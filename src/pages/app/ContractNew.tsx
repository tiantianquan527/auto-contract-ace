import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function ContractNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [companyName, setCompanyName] = useState("");
  const [stance, setStance] = useState("partyA");
  const [position, setPosition] = useState("equal");
  const [customRules, setCustomRules] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("departments").select("*").then(({ data }) => setDepartments(data ?? []));
    // pre-fill user's department
    if (user) {
      supabase.from("profiles").select("department_id").eq("user_id", user.id).maybeSingle()
        .then(({ data }) => { if (data?.department_id) setDepartmentId(data.department_id); });
    }
  }, [user]);

  const submit = async () => {
    if (!file || !title || !user) { toast.error("请填写标题并选择文件"); return; }
    setSubmitting(true);
    try {
      const safe = file.name.replace(/[^\x20-\x7E]/g, "_").replace(/\s+/g, "_");
      const path = `${user.id}/${Date.now()}_${safe}`;
      const { error: upErr } = await supabase.storage.from("contracts").upload(path, file);
      if (upErr) throw upErr;

      const { data: contract, error: cErr } = await supabase.from("contracts").insert({
        title,
        file_name: file.name,
        department_id: departmentId || null,
        uploaded_by: user.id,
        company_name: companyName || null,
        stance,
        negotiation_position: position,
        custom_rules: customRules || null,
        status: "draft",
        current_version: 1,
      }).select().single();
      if (cErr) throw cErr;

      const { error: vErr } = await supabase.from("contract_versions").insert({
        contract_id: contract.id,
        version: 1,
        file_path: path,
        file_name: file.name,
        uploaded_by: user.id,
      });
      if (vErr) throw vErr;

      toast.success("合同已创建");
      navigate(`/app/contracts/${contract.id}`);
    } catch (e: any) {
      toast.error(e.message || "创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">新建合同</h1>
      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label>合同标题 *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：与XX公司技术服务合同" />
        </div>
        <div className="space-y-2">
          <Label>归属部门</Label>
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger><SelectValue placeholder="选择部门" /></SelectTrigger>
            <SelectContent>
              {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>我方主体名称</Label>
          <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>立场</Label>
            <Select value={stance} onValueChange={setStance}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="neutral">中立</SelectItem>
                <SelectItem value="partyA">甲方</SelectItem>
                <SelectItem value="partyB">乙方</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>谈判地位</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="equal">平等</SelectItem>
                <SelectItem value="partyA-advantage">甲方占优</SelectItem>
                <SelectItem value="partyB-advantage">乙方占优</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>额外审查要求（可选）</Label>
          <Textarea value={customRules} onChange={(e) => setCustomRules(e.target.value)} className="min-h-[80px]" />
        </div>
        <div className="space-y-2">
          <Label>合同文件 *（.txt / .docx）</Label>
          <label className="flex items-center gap-3 p-4 border border-dashed rounded-md cursor-pointer hover:border-primary">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">{file ? file.name : "点击选择文件"}</span>
            <input type="file" className="hidden" accept=".txt,.docx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
        <Button onClick={submit} disabled={submitting} className="w-full">
          {submitting ? "提交中…" : "创建合同"}
        </Button>
      </Card>
    </div>
  );
}
