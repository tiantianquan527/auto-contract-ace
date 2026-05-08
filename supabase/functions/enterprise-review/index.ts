import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims, error: cErr } = await userClient.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (cErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claims.claims.sub as string;

    const body = await req.json();
    const contractId = String(body.contractId || "");
    if (!contractId) {
      return new Response(JSON.stringify({ error: "contractId required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // Load contract + latest version
    const { data: contract, error: cErr2 } = await admin
      .from("contracts").select("*").eq("id", contractId).single();
    if (cErr2 || !contract) throw new Error("Contract not found");

    const { data: version } = await admin
      .from("contract_versions").select("*")
      .eq("contract_id", contractId)
      .order("version", { ascending: false })
      .limit(1).single();
    if (!version) throw new Error("No version uploaded");

    // Mark as reviewing
    await admin.from("contracts").update({ status: "reviewing" }).eq("id", contractId);

    // Load applicable rules: dept-bound matching contract.department_id OR rules with no department (general)
    const { data: rules } = await admin
      .from("review_rules").select("*").eq("is_active", true);
    const applicableRules = (rules ?? []).filter((r: any) =>
      !r.department_id || r.department_id === contract.department_id
    );

    // Download file
    const { data: fileData, error: fErr } = await admin.storage
      .from("contracts").download(version.file_path);
    if (fErr || !fileData) throw new Error("Failed to download file");

    let contractText = "";
    const lower = version.file_path.toLowerCase();
    try {
      if (lower.endsWith(".docx")) {
        const buf = new Uint8Array(await fileData.arrayBuffer());
        const { unzipSync, strFromU8 } = await import("npm:fflate@0.8.2");
        const files = unzipSync(buf, { filter: (f) => f.name === "word/document.xml" });
        const xml = files["word/document.xml"] ? strFromU8(files["word/document.xml"]) : "";
        contractText = xml.replace(/<w:p[^>]*>/g, "\n").replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"').replace(/&apos;/g, "'").trim();
      } else {
        contractText = await fileData.text();
      }
    } catch (e) {
      console.error("extract failed", e);
    }

    const ratio = contractText
      ? (contractText.match(/[\u0020-\u007E\u4e00-\u9fff\s]/g)?.length || 0) / contractText.length : 0;
    if (!contractText || contractText.length < 50 || ratio < 0.7) {
      await admin.from("contracts").update({ status: "draft" }).eq("id", contractId);
      return new Response(JSON.stringify({ error: "无法读取合同文本，请上传 .txt 或 .docx 文件" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stanceMap: Record<string, string> = {
      neutral: "中立立场", partyA: "甲方立场", partyB: "乙方立场",
    };
    const positionMap: Record<string, string> = {
      equal: "双方平等", "partyA-advantage": "甲方占优", "partyB-advantage": "乙方占优",
    };

    const ruleBlock = applicableRules.length
      ? applicableRules.map((r: any, i: number) =>
          `${i + 1}. 【${r.name}】(${(r.tags || []).join("/")}) ${r.description}`
        ).join("\n")
      : "（暂无配置规则，按通用法律标准审核）";

    const systemPrompt = `你是资深法律顾问。以${stanceMap[contract.stance] || "中立立场"}审核以下合同，谈判地位：${positionMap[contract.negotiation_position] || "双方平等"}。${contract.company_name ? `我方主体：「${contract.company_name}」。` : ""}

【企业内置审核规则】请严格逐条对照以下规则进行审查：
${ruleBlock}

${contract.custom_rules ? `【额外要求】${contract.custom_rules}` : ""}

必须严格返回 JSON：
{
  "overallScore": 0-100,
  "clauses": [
    { "id": "1", "title": "条款名", "category": "分类", "originalText": "原文", "suggestedText": "建议", "reason": "原因(注明触发的规则名)", "riskLevel": "high|medium|low" }
  ]
}
风险等级：high=高危/medium=中度/low=瑕疵。至少分析 5 条。`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `合同内容：\n\n${contractText}` },
        ],
      }),
    });

    if (!aiRes.ok) {
      await admin.from("contracts").update({ status: "draft" }).eq("id", contractId);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "AI 请求频率过高" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI 额度不足" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error("AI gateway error " + aiRes.status);
    }

    const aiJson = await aiRes.json();
    const content = aiJson.choices?.[0]?.message?.content;
    const extractJson = (s: string): string | null => {
      const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
      if (fence) return fence[1].trim();
      const start = s.indexOf("{");
      if (start === -1) return null;
      let depth = 0;
      for (let i = start; i < s.length; i++) {
        if (s[i] === "{") depth++;
        else if (s[i] === "}") { depth--; if (depth === 0) return s.slice(start, i + 1); }
      }
      return null;
    };
    let parsed: any;
    try {
      const j = extractJson(content || "");
      parsed = JSON.parse(j!);
    } catch {
      await admin.from("contracts").update({ status: "draft" }).eq("id", contractId);
      return new Response(JSON.stringify({ error: "AI 未能识别合同内容" }), {
        status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clauses = parsed.clauses || [];
    const summary = {
      high: clauses.filter((c: any) => c.riskLevel === "high").length,
      medium: clauses.filter((c: any) => c.riskLevel === "medium").length,
      low: clauses.filter((c: any) => c.riskLevel === "low").length,
    };

    const { data: reviewRow } = await admin.from("contract_reviews").insert({
      contract_id: contractId,
      version: version.version,
      overall_score: parsed.overallScore || 70,
      risk_summary: summary,
      clauses,
      matched_rule_ids: applicableRules.map((r: any) => r.id),
    }).select().single();

    // Auto status: high risks → revision_required, else stays reviewing for approval
    const nextStatus = summary.high > 0 ? "revision_required" : "reviewing";
    await admin.from("contracts").update({ status: nextStatus }).eq("id", contractId);

    return new Response(JSON.stringify({
      reviewId: reviewRow?.id,
      overallScore: parsed.overallScore,
      riskSummary: summary,
      clauses,
      matchedRules: applicableRules.length,
      status: nextStatus,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("enterprise-review error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "服务内部错误" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
