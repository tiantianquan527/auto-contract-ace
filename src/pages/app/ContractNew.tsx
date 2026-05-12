import { useState } from "react";
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

const CONTRACT_TYPES = [
  "催收", "广告推广", "VCRP", "股权转让", "租赁", "工商代理",
  "注册地址续费", "办公室租赁", "团餐", "年会", "团建", "机票购买",
  "酒店预定", "租车", "会议场地租赁", "下午茶采购", "桶装水采购", "其他",
];

const CURRENCIES = ["CNY 人民币", "USD 美元", "EUR 欧元", "HKD 港币", "JPY 日元", "GBP 英镑", "其他"];

export default function ContractNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    departmentName: "",
    contractType: "",
    currency: "CNY 人民币",
    startDate: "",
    endDate: "",
    partyAName: "",
    partyBName: "",
    counterpartyContactName: "",
    counterpartyContactPhone: "",
    ourBankAccount: "",
    counterpartyBankAccount: "",
    stance: "partyA",
    position: "equal",
    customRules: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    const required: [string, string][] = [
      ["title", "合同标题"],
      ["departmentName", "所属部门"],
      ["contractType", "合同类型"],
      ["currency", "币种"],
      ["startDate", "起始日期"],
      ["endDate", "到期日"],
      ["partyAName", "甲方名称"],
      ["partyBName", "乙方名称"],
      ["counterpartyContactName", "对方联系人"],
      ["counterpartyContactPhone", "对方联系电话"],
    ];
    for (const [k, label] of required) {
      if (!form[k as keyof typeof form]) { toast.error(`请填写${label}`); return; }
    }
    if (!file || !user) { toast.error("请选择合同文件"); return; }

    setSubmitting(true);
    try {
      const safe = file.name.replace(/[^\x20-\x7E]/g, "_").replace(/\s+/g, "_");
      const path = `${user.id}/${Date.now()}_${safe}`;
      const { error: upErr } = await supabase.storage.from("contracts").upload(path, file);
      if (upErr) throw upErr;

      const { data: contract, error: cErr } = await supabase.from("contracts").insert({
        title: form.title,
        file_name: file.name,
        department_name: form.departmentName,
        contract_type: form.contractType,
        currency: form.currency,
        start_date: form.startDate,
        end_date: form.endDate,
        party_a_name: form.partyAName,
        party_b_name: form.partyBName,
        counterparty_contact_name: form.counterpartyContactName,
        counterparty_contact_phone: form.counterpartyContactPhone,
        our_bank_account: form.ourBankAccount || null,
        counterparty_bank_account: form.counterpartyBankAccount || null,
        uploaded_by: user.id,
        company_name: form.partyAName,
        stance: form.stance,
        negotiation_position: form.position,
        custom_rules: form.customRules || null,
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
    <div className="p-8 max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">新建合同</h1>

      <Card className="p-6 space-y-5">
        <div className="space-y-2">
          <Label>合同标题 *</Label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="如：与XX公司技术服务合同" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>所属部门 *</Label>
            <Input value={form.departmentName} onChange={(e) => set("departmentName", e.target.value)} placeholder="如：行政部 / 财务部" />
          </div>
          <div className="space-y-2">
            <Label>合同类型 *</Label>
            <Select value={form.contractType} onValueChange={(v) => set("contractType", v)}>
              <SelectTrigger><SelectValue placeholder="请选择类型" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {CONTRACT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>币种 *</Label>
            <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>起始日期 *</Label>
            <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>到期日 *</Label>
            <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>甲方名称 *</Label>
            <Input value={form.partyAName} onChange={(e) => set("partyAName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>乙方名称 *</Label>
            <Input value={form.partyBName} onChange={(e) => set("partyBName", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>对方联系人 *</Label>
            <Input value={form.counterpartyContactName} onChange={(e) => set("counterpartyContactName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>对方联系电话 *</Label>
            <Input value={form.counterpartyContactPhone} onChange={(e) => set("counterpartyContactPhone", e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>我方银行账户</Label>
          <Textarea value={form.ourBankAccount} onChange={(e) => set("ourBankAccount", e.target.value)} placeholder="开户行 / 户名 / 账号" className="min-h-[60px]" />
        </div>
        <div className="space-y-2">
          <Label>对方银行账户</Label>
          <Textarea value={form.counterpartyBankAccount} onChange={(e) => set("counterpartyBankAccount", e.target.value)} placeholder="开户行 / 户名 / 账号" className="min-h-[60px]" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>立场</Label>
            <Select value={form.stance} onValueChange={(v) => set("stance", v)}>
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
            <Select value={form.position} onValueChange={(v) => set("position", v)}>
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
          <Textarea value={form.customRules} onChange={(e) => set("customRules", e.target.value)} className="min-h-[60px]" />
        </div>

        <div className="space-y-2">
          <Label>合同文件 *（支持 Word / PDF / Excel / 图片 / TXT）</Label>
          <label className="flex items-center gap-3 p-4 border border-dashed rounded-md cursor-pointer hover:border-primary">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm">{file ? file.name : "点击选择文件"}</span>
            <input
              type="file"
              className="hidden"
              accept=".txt,.doc,.docx,.pdf,.xls,.xlsx,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <p className="text-xs text-muted-foreground">提示：AI 智能审核目前对 .txt / .docx 文本提取最准确；其它格式会先归档，可在合同详情中补充文本进行审核。</p>
        </div>

        <Button onClick={submit} disabled={submitting} className="w-full">
          {submitting ? "提交中…" : "创建合同"}
        </Button>
      </Card>
    </div>
  );
}
