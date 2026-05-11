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
import {
  ArrowLeft, FileText, Sparkles, Upload, CheckCircle2, XCircle,
  Stamp, Archive, Send, ChevronRight,
} from "lucide-react";
import ArchiveViewer from "@/components/contract/ArchiveViewer";

type Status =
  | "draft" | "self_review" | "finance_review" | "legal_review"
  | "head_approval" | "approved" | "sealed" | "archived" | "revision_required" | "reviewing";

const statusLabel: Record<string, string> = {
  draft: "草稿",
  self_review: "发起人一审",
  reviewing: "审核中",
  finance_review: "财务审核中",
  legal_review: "法务审核中",
  head_approval: "部门负责人审批中",
  revision_required: "待修订",
  approved: "审批通过",
  sealed: "已盖章",
  archived: "已归档",
};

const STAGES: { key: Status; label: string }[] = [
  { key: "self_review", label: "发起人一审" },
  { key: "finance_review", label: "财务审核" },
  { key: "legal_review", label: "法务审核" },
  { key: "head_approval", label: "部门负责人审批" },
  { key: "sealed", label: "盖章" },
  { key: "archived", label: "归档" },
];

const stageOrder = (s: Status): number => {
  const map: Record<string, number> = {
    draft: 0, self_review: 0, reviewing: 0,
    finance_review: 1, legal_review: 2,
    head_approval: 3, approved: 3,
    sealed: 4, archived: 5, revision_required: 0,
  };
  return map[s] ?? 0;
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

  if (!contract) return <div className="p-8 text-muted-foreground">加载中…</div>;

  const status: Status = contract.status;
  const isOwner = user?.id === contract.uploaded_by;
  const isAdmin = hasRole("admin");
  const isFinance = hasRole("finance");
  const isLegal = hasRole("legal");
  const isArchived = status === "archived";
  const latestReview = reviews[0];

  const updateStatus = async (next: Status, msg: string) => {
    setBusy(true);
    try {
      const { error } = await supabase.from("contracts").update({ status: next }).eq("id", id);
      if (error) throw error;
      toast.success(msg);
      load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const runReview = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("enterprise-review", { body: { contractId: id } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      await supabase.from("contracts").update({ status: "self_review" }).eq("id", id);
      toast.success(`AI 审核完成（高:${data.riskSummary.high} 中:${data.riskSummary.medium} 低:${data.riskSummary.low}）`);
      load();
    } catch (e: any) {
      toast.error(e.message || "审核失败");
    } finally { setBusy(false); }
  };

  const submitToFinance = () => updateStatus("finance_review", "已提交财务审核");

  const decideStage = async (stage: Status, action: "approve" | "reject" | "comment") => {
    if (!user) return;
    setBusy(true);
    try {
      await supabase.from("contract_approvals").insert({
        contract_id: id, approver_id: user.id, action,
        comment: comment || null, stage,
      });
      if (action === "approve") {
        const next: Record<string, Status> = {
          finance_review: "legal_review",
          legal_review: "head_approval",
          head_approval: "approved",
        };
        const n = next[stage];
        if (n) await supabase.from("contracts").update({ status: n }).eq("id", id);
      } else if (action === "reject") {
        await supabase.from("contracts").update({ status: "revision_required" }).eq("id", id);
      }
      setComment("");
      toast.success("已提交");
      load();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
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
      toast.success("修订版本已上传，可重新发起审核");
      setRevisionFile(null); setRevisionNote("");
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

  const archive = () => updateStatus("archived", "已归档");

  const currentStage = stageOrder(status);

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
        <Badge>{statusLabel[status]}</Badge>
      </div>

      {/* Stepper */}
      <Card className="p-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {STAGES.map((s, i) => {
            const done = i < currentStage;
            const active = i === currentStage && status !== "revision_required";
            return (
              <div key={s.key} className="flex items-center gap-1 flex-shrink-0">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs ${
                  done ? "bg-primary/10 text-primary" :
                  active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <span className="w-5 h-5 rounded-full bg-background/40 flex items-center justify-center font-semibold">{i + 1}</span>
                  {s.label}
                </div>
                {i < STAGES.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              </div>
            );
          })}
        </div>
        {status === "revision_required" && (
          <p className="text-xs text-destructive mt-2">⚠ 已被打回，请上传修订版本后重新发起审核</p>
        )}
      </Card>

      <Tabs defaultValue="flow" className="w-full">
        <TabsList>
          <TabsTrigger value="flow">流程操作</TabsTrigger>
          <TabsTrigger value="review">AI 审核结果</TabsTrigger>
          <TabsTrigger value="revision">修订版本</TabsTrigger>
          <TabsTrigger value="approval">审批记录</TabsTrigger>
          <TabsTrigger value="archive">归档查阅</TabsTrigger>
        </TabsList>

        {/* ===== FLOW ===== */}
        <TabsContent value="flow" className="space-y-4">
          {/* Step 1: 发起人一审 */}
          {(status === "draft" || status === "self_review" || status === "revision_required") && isOwner && !isArchived && (
            <Card className="p-4 space-y-3">
              <p className="font-medium">第 1 步 · 发起人一审</p>
              <p className="text-sm text-muted-foreground">先运行 AI 智能审核检查风险点，确认无误后提交财务审核。</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={runReview} disabled={busy} variant="outline">
                  <Sparkles className="w-4 h-4 mr-1" /> 运行 AI 审核
                </Button>
                <Button onClick={submitToFinance} disabled={busy || !latestReview}>
                  <Send className="w-4 h-4 mr-1" /> 提交财务审核
                </Button>
              </div>
              {!latestReview && <p className="text-xs text-muted-foreground">请先运行至少一次 AI 审核才能提交。</p>}
            </Card>
          )}

          {/* Step 2: 财务审核 */}
          {status === "finance_review" && (
            <Card className="p-4 space-y-3">
              <p className="font-medium">第 2 步 · 财务审核</p>
              {isFinance || isAdmin ? (
                <>
                  <Textarea placeholder="财务审核意见" value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-[60px]" />
                  <div className="flex gap-2">
                    <Button onClick={() => decideStage("finance_review", "approve")} disabled={busy}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> 通过并转法务
                    </Button>
                    <Button variant="destructive" onClick={() => decideStage("finance_review", "reject")} disabled={busy}>
                      <XCircle className="w-4 h-4 mr-1" /> 打回修订
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">等待财务人员处理…</p>
              )}
            </Card>
          )}

          {/* Step 3: 法务审核 */}
          {status === "legal_review" && (
            <Card className="p-4 space-y-3">
              <p className="font-medium">第 3 步 · 法务审核</p>
              {isLegal || isAdmin ? (
                <>
                  <Textarea placeholder="法务审核意见" value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-[60px]" />
                  <div className="flex gap-2">
                    <Button onClick={() => decideStage("legal_review", "approve")} disabled={busy}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> 通过并转部门负责人
                    </Button>
                    <Button variant="destructive" onClick={() => decideStage("legal_review", "reject")} disabled={busy}>
                      <XCircle className="w-4 h-4 mr-1" /> 打回修订
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">等待法务人员处理…</p>
              )}
            </Card>
          )}

          {/* Step 4: 部门负责人审批 */}
          {status === "head_approval" && (
            <Card className="p-4 space-y-3">
              <p className="font-medium">第 4 步 · 部门负责人审批</p>
              {isAdmin ? (
                <>
                  <Textarea placeholder="审批意见" value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-[60px]" />
                  <div className="flex gap-2">
                    <Button onClick={() => decideStage("head_approval", "approve")} disabled={busy}>
                      <CheckCircle2 className="w-4 h-4 mr-1" /> 审批通过
                    </Button>
                    <Button variant="destructive" onClick={() => decideStage("head_approval", "reject")} disabled={busy}>
                      <XCircle className="w-4 h-4 mr-1" /> 打回修订
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">等待部门负责人处理…</p>
              )}
            </Card>
          )}

          {/* Step 5: 盖章 */}
          {status === "approved" && (
            <Card className="p-4 space-y-3">
              <p className="font-medium">第 5 步 · 盖章</p>
              <p className="text-sm text-muted-foreground">线下盖章后上传扫描件或照片。</p>
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setSealFile(e.target.files?.[0] ?? null)} />
              <Button onClick={uploadSeal} disabled={busy || !sealFile}>
                <Stamp className="w-4 h-4 mr-1" /> 上传盖章扫描件
              </Button>
            </Card>
          )}

          {/* Step 6: 归档 */}
          {status === "sealed" && isAdmin && (
            <Card className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">第 6 步 · 归档</p>
                <p className="text-sm text-muted-foreground mt-1">归档后合同仅可查看，不可下载。</p>
              </div>
              <Button onClick={archive} disabled={busy}><Archive className="w-4 h-4 mr-1" /> 归档</Button>
            </Card>
          )}

          {isArchived && (
            <Card className="p-6 text-center text-muted-foreground">
              ✓ 合同已归档完成。可前往"归档查阅"页查看盖章扫描件。
            </Card>
          )}
        </TabsContent>

        {/* ===== AI REVIEW ===== */}
        <TabsContent value="review" className="space-y-4">
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
            <Card className="p-8 text-center text-muted-foreground">尚未运行 AI 审核</Card>
          )}
        </TabsContent>

        {/* ===== REVISION ===== */}
        <TabsContent value="revision" className="space-y-3">
          {!isArchived && (isOwner || isAdmin) && (
            <Card className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">上传修订版本（将作为新版本，状态会回到草稿，可重新发起流程）</p>
              <input type="file" accept=".txt,.doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg" onChange={(e) => setRevisionFile(e.target.files?.[0] ?? null)} />
              <Textarea placeholder="修订说明" value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} className="min-h-[60px]" />
              <Button onClick={uploadRevision} disabled={busy || !revisionFile}>
                <Upload className="w-4 h-4 mr-1" /> 上传修订版
              </Button>
            </Card>
          )}
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

        {/* ===== APPROVAL HISTORY ===== */}
        <TabsContent value="approval" className="space-y-3">
          <Card className="p-4">
            <p className="text-sm font-medium mb-2">审批/审核记录</p>
            {approvals.length === 0 ? <p className="text-sm text-muted-foreground">暂无</p> : (
              <ul className="space-y-2 text-sm">
                {approvals.map((a) => (
                  <li key={a.id} className="border-b pb-2 last:border-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        {a.stage && <Badge variant="outline">{statusLabel[a.stage] || a.stage}</Badge>}
                        <Badge variant={a.action === "approve" ? "default" : a.action === "reject" ? "destructive" : "outline"}>
                          {a.action === "approve" ? "通过" : a.action === "reject" ? "打回" : "留言"}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                    </div>
                    {a.comment && <p className="text-xs mt-1 text-muted-foreground">{a.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="p-4">
            <p className="text-sm font-medium mb-2">盖章扫描件</p>
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

        {/* ===== ARCHIVE ===== */}
        <TabsContent value="archive" className="space-y-3">
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
