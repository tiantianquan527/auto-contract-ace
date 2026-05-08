import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArrowLeft, FileText, Sparkles, Upload, CheckCircle2, XCircle, Stamp, Archive } from "lucide-react";
import ArchiveViewer from "@/components/contract/ArchiveViewer";

const statusLabel: Record<string, string> = {
  draft: "草稿", reviewing: "审核中", revision_required: "待修订",
  approved: "已通过", sealed: "已盖章", archived: "已归档",
};

export default function ContractDetail() {
  const { id } = useParams();
  const { user, hasRole } = useAuth();
  const [contract, setContract] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [seals, setSeals] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [revisionFile, setRevisionFile] = useState<File | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const [comment, setComment] = useState("");
  const [sealFile, setSealFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const { data: c } = await supabase.from("contracts").select("*, departments(name)").eq("id", id).single();
    setContract(c);
    const { data: v } = await supabase.from("contract_versions").select("*").eq("contract_id", id).order("version", { ascending: false });
    setVersions(v ?? []);
    const { data: r } = await supabase.from("contract_reviews").select("*").eq("contract_id", id).order("created_at", { ascending: false });
    setReviews(r ?? []);
    const { data: a } = await supabase.from("contract_approvals").select("*").eq("contract_id", id).order("created_at", { ascending: false });
    setApprovals(a ?? []);
    const { data: s } = await supabase.from("contract_seals").select("*").eq("contract_id", id).order("created_at", { ascending: false });
    setSeals(s ?? []);
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const canApprove = hasRole("admin") || hasRole("legal") || hasRole("finance");
  const canArchive = hasRole("admin");

  const runReview = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("enterprise-review", { body: { contractId: id } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`审核完成（高:${data.riskSummary.high} 中:${data.riskSummary.medium} 低:${data.riskSummary.low}）`);
      load();
    } catch (e: any) {
      toast.error(e.message || "审核失败");
    } finally { setBusy(false); }
  };

  const uploadRevision = async () => {
    if (!revisionFile || !user || !contract) return;
    setBusy(true);
    try {
      const safe = revisionFile.name.replace(/[^\x20-\x7E]/g, "_").replace(/\s+/g, "_");
      const path = `${user.id}/${Date.now()}_${safe}`;
      const { error: upErr } = await supabase.storage.from("contracts").upload(path, revisionFile);
      if (upErr) throw upErr;
      const newV = (contract.current_version || 1) + 1;
      await supabase.from("contract_versions").insert({
        contract_id: id, version: newV, file_path: path, file_name: revisionFile.name,
        uploaded_by: user.id, note: revisionNote || null,
      });
      await supabase.from("contracts").update({ current_version: newV, status: "draft" }).eq("id", id);
      toast.success("修订版本已上传");
      setRevisionFile(null); setRevisionNote("");
      load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const decide = async (action: "approve" | "reject" | "comment") => {
    if (!user) return;
    setBusy(true);
    try {
      await supabase.from("contract_approvals").insert({
        contract_id: id, approver_id: user.id, action, comment: comment || null,
      });
      if (action === "approve") {
        await supabase.from("contracts").update({ status: "approved" }).eq("id", id);
      } else if (action === "reject") {
        await supabase.from("contracts").update({ status: "revision_required" }).eq("id", id);
      }
      setComment("");
      toast.success("已提交");
      load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const uploadSeal = async () => {
    if (!sealFile || !user) return;
    setBusy(true);
    try {
      const safe = sealFile.name.replace(/[^\x20-\x7E]/g, "_").replace(/\s+/g, "_");
      const path = `${user.id}/${Date.now()}_${safe}`;
      const { error: upErr } = await supabase.storage.from("contract-scans").upload(path, sealFile);
      if (upErr) throw upErr;
      await supabase.from("contract_seals").insert({
        contract_id: id, file_path: path, file_name: sealFile.name, uploaded_by: user.id,
      });
      await supabase.from("contracts").update({ status: "sealed" }).eq("id", id);
      toast.success("盖章扫描件已上传");
      setSealFile(null);
      load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const archive = async () => {
    setBusy(true);
    try {
      await supabase.from("contracts").update({ status: "archived" }).eq("id", id);
      toast.success("已归档");
      load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  if (!contract) return <div className="p-8 text-muted-foreground">加载中…</div>;
  const latestReview = reviews[0];
  const isArchived = contract.status === "archived";

  return (
    <div className="p-8 max-w-5xl space-y-6">
      <Link to="/app/contracts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4 mr-1" /> 返回列表
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="w-6 h-6" /> {contract.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {contract.departments?.name || "未指定部门"} · v{contract.current_version} · {new Date(contract.created_at).toLocaleString()}
          </p>
        </div>
        <Badge>{statusLabel[contract.status]}</Badge>
      </div>

      <Tabs defaultValue="review" className="w-full">
        <TabsList>
          <TabsTrigger value="review">审核结果</TabsTrigger>
          <TabsTrigger value="revision">修订</TabsTrigger>
          <TabsTrigger value="approval">审批</TabsTrigger>
          <TabsTrigger value="seal">盖章</TabsTrigger>
          <TabsTrigger value="archive">归档</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-4">
          <Card className="p-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">点击下方按钮调用 AI 匹配本部门规则进行审核</p>
            <Button onClick={runReview} disabled={busy || isArchived}>
              <Sparkles className="w-4 h-4 mr-1" /> 一键智能审核
            </Button>
          </Card>
          {latestReview ? (
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span>评分：<b className="text-lg">{latestReview.overall_score}</b></span>
                <span>高危 <b className="text-destructive">{latestReview.risk_summary?.high ?? 0}</b></span>
                <span>中度 {latestReview.risk_summary?.medium ?? 0}</span>
                <span>瑕疵 {latestReview.risk_summary?.low ?? 0}</span>
              </div>
              <div className="space-y-2">
                {(latestReview.clauses || []).map((c: any, i: number) => (
                  <Card key={i} className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{c.title}</p>
                      <Badge variant={c.riskLevel === "high" ? "destructive" : c.riskLevel === "medium" ? "secondary" : "outline"}>
                        {c.riskLevel === "high" ? "高危" : c.riskLevel === "medium" ? "中度" : "瑕疵"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">原文：{c.originalText}</p>
                    <p className="text-xs mt-1">建议：{c.suggestedText}</p>
                    <p className="text-xs text-muted-foreground mt-1">原因：{c.reason}</p>
                  </Card>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">尚未审核</Card>
          )}
        </TabsContent>

        <TabsContent value="revision" className="space-y-3">
          <Card className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">上传修订版（将作为新版本）</p>
            <input type="file" accept=".txt,.docx" onChange={(e) => setRevisionFile(e.target.files?.[0] ?? null)} />
            <Textarea placeholder="修订说明" value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} className="min-h-[60px]" />
            <Button onClick={uploadRevision} disabled={busy || !revisionFile || isArchived}>
              <Upload className="w-4 h-4 mr-1" /> 上传修订版
            </Button>
          </Card>
          <Card className="p-4">
            <p className="text-sm font-medium mb-2">版本历史</p>
            <ul className="text-sm space-y-1">
              {versions.map((v) => (
                <li key={v.id} className="flex justify-between border-b pb-1 last:border-0">
                  <span>v{v.version} · {v.file_name}</span>
                  <span className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-3">
          {canApprove && !isArchived && (
            <Card className="p-4 space-y-3">
              <Textarea placeholder="审批意见" value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-[60px]" />
              <div className="flex gap-2">
                <Button onClick={() => decide("approve")} disabled={busy}><CheckCircle2 className="w-4 h-4 mr-1" /> 通过</Button>
                <Button variant="destructive" onClick={() => decide("reject")} disabled={busy}><XCircle className="w-4 h-4 mr-1" /> 打回修订</Button>
                <Button variant="outline" onClick={() => decide("comment")} disabled={busy || !comment}>仅留言</Button>
              </div>
            </Card>
          )}
          <Card className="p-4">
            <p className="text-sm font-medium mb-2">审批记录</p>
            {approvals.length === 0 ? <p className="text-sm text-muted-foreground">暂无</p> : (
              <ul className="space-y-2 text-sm">
                {approvals.map((a) => (
                  <li key={a.id} className="border-b pb-2 last:border-0">
                    <div className="flex justify-between">
                      <Badge variant={a.action === "approve" ? "default" : a.action === "reject" ? "destructive" : "outline"}>
                        {a.action === "approve" ? "通过" : a.action === "reject" ? "打回" : "留言"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                    </div>
                    {a.comment && <p className="text-xs mt-1 text-muted-foreground">{a.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="seal" className="space-y-3">
          {(contract.status === "approved" || contract.status === "sealed") && !isArchived && (
            <Card className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">上传已盖章的扫描件或照片</p>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setSealFile(e.target.files?.[0] ?? null)} />
              <Button onClick={uploadSeal} disabled={busy || !sealFile}>
                <Stamp className="w-4 h-4 mr-1" /> 上传扫描件
              </Button>
            </Card>
          )}
          <Card className="p-4">
            <p className="text-sm font-medium mb-2">扫描件</p>
            {seals.length === 0 ? <p className="text-sm text-muted-foreground">暂无</p> : (
              <ul className="space-y-1 text-sm">
                {seals.map((s) => (
                  <li key={s.id} className="flex justify-between border-b pb-1 last:border-0">
                    <span>{s.file_name}</span>
                    <span className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="archive" className="space-y-3">
          {contract.status === "sealed" && canArchive && (
            <Card className="p-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">归档后合同仅可查看，不可下载</p>
              <Button onClick={archive} disabled={busy}><Archive className="w-4 h-4 mr-1" /> 归档</Button>
            </Card>
          )}
          {isArchived ? (
            <ArchiveViewer seals={seals} userEmail={user?.email || "user"} />
          ) : (
            <Card className="p-8 text-center text-muted-foreground">合同尚未归档</Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
