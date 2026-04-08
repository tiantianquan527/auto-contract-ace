import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate JWT - ensure user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const filePath = typeof body.filePath === "string" ? body.filePath.trim() : "";
    const stance = typeof body.stance === "string" ? body.stance.slice(0, 50) : "neutral";
    const negotiationPosition = typeof body.negotiationPosition === "string" ? body.negotiationPosition.slice(0, 50) : "equal";
    const companyName = typeof body.companyName === "string" ? body.companyName.slice(0, 200) : "";
    const customRules = typeof body.customRules === "string" ? body.customRules.slice(0, 2000) : "";

    if (!filePath || filePath.length > 500) {
      return new Response(
        JSON.stringify({ error: "filePath is required and must be under 500 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const allowedStances = ["neutral", "partyA", "partyB"];
    const allowedPositions = ["equal", "partyA-advantage", "partyB-advantage"];
    const safeStance = allowedStances.includes(stance) ? stance : "neutral";
    const safePosition = allowedPositions.includes(negotiationPosition) ? negotiationPosition : "equal";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Download the contract file from storage using service role
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: fileData, error: fileError } = await supabase.storage
      .from("contracts")
      .download(filePath);

    if (fileError || !fileData) {
      console.error("File download error:", fileError);
      return new Response(
        JSON.stringify({ error: "Failed to download contract file" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract text from file
    const contractText = await fileData.text();

    // Build the system prompt
    const stanceMap: Record<string, string> = {
      neutral: "中立立场",
      partyA: "甲方立场（保护甲方利益）",
      partyB: "乙方立场（保护乙方利益）",
    };
    const positionMap: Record<string, string> = {
      equal: "双方平等地位",
      "partyA-advantage": "甲方占优势地位",
      "partyB-advantage": "乙方占优势地位",
    };

    const stanceDesc = stanceMap[safeStance] || "中立立场";
    const positionDesc = positionMap[safePosition] || "双方平等地位";
    const companyDesc = companyName ? `我方主体名称为「${companyName}」。` : "";

    const systemPrompt = `你是一位资深的中国法律顾问和合同审核专家。请以${stanceDesc}审核以下合同。
谈判地位：${positionDesc}。${companyDesc}

你必须严格按照以下JSON格式返回审核结果，不要返回任何其他内容：

{
  "overallScore": 0-100的整数评分,
  "clauses": [
    {
      "id": "从1开始的序号字符串",
      "title": "条款名称",
      "category": "条款分类",
      "originalText": "原文中有问题的具体文字",
      "suggestedText": "修改建议的具体文字",
      "reason": "详细的法律依据和修改原因",
      "riskLevel": "high 或 medium 或 low"
    }
  ]
}

风险等级说明：
- high（高危风险）：赋予对方单方解约权、无限连带责任、严重违反法律法规等
- medium（中度风险）：违约金比例过高、条款不够明确、缺少保护性条款等
- low（文本瑕疵）：错别字、日期不符、表述不够规范等

${customRules ? `额外审查要求：${customRules}` : ""}

请仔细逐条分析合同，找出所有潜在问题。至少分析5个条款。`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `请审核以下合同内容：\n\n${contractText}` },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI 请求频率过高，请稍后再试" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 额度不足，请充值后再试" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("AI returned empty response");
    }

    // Parse the JSON from AI response (handle markdown code blocks)
    let reviewData;
    try {
      const jsonStr = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      reviewData = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Build final result
    const result = {
      totalClauses: reviewData.clauses?.length || 0,
      overallScore: reviewData.overallScore || 70,
      riskSummary: {
        high: reviewData.clauses?.filter((c: any) => c.riskLevel === "high").length || 0,
        medium: reviewData.clauses?.filter((c: any) => c.riskLevel === "medium").length || 0,
        low: reviewData.clauses?.filter((c: any) => c.riskLevel === "low").length || 0,
      },
      clauses: reviewData.clauses || [],
      reviewedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("review-contract error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
