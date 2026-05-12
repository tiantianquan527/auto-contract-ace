import { useState, useCallback } from "react";
import { Upload, FileText, X, Shield, FileEdit, Building2, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";

export interface ReviewConfig {
  stance: string;
  negotiationPosition: string;
  companyName: string;
  customRules: string;
  departmentName: string;
  contractType: string;
  currency: string;
  startDate: string;
  endDate: string;
  partyAName: string;
  partyBName: string;
  counterpartyContactName: string;
  counterpartyContactPhone: string;
  ourBankAccount: string;
  counterpartyBankAccount: string;
}

interface ContractUploadProps {
  onReview: (file: File, config: ReviewConfig) => void;
  isReviewing: boolean;
}

type Stance = "neutral" | "partyA" | "partyB";

const CONTRACT_TYPES = [
  "催收", "广告推广", "VCRP", "股权转让", "租赁", "工商代理",
  "注册地址续费", "办公室租赁", "团餐", "年会", "团建", "机票购买",
  "酒店预定", "租车", "会议场地租赁", "下午茶采购", "桶装水采购", "其他",
];
const CURRENCIES = ["CNY 人民币", "USD 美元", "EUR 欧元", "HKD 港币", "JPY 日元", "GBP 英镑", "其他"];

const ContractUpload = ({ onReview, isReviewing }: ContractUploadProps) => {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stance, setStance] = useState<Stance>("partyA");
  const [negotiationPosition, setNegotiationPosition] = useState("equal");
  const [customRules, setCustomRules] = useState("");

  const [departmentName, setDepartmentName] = useState("");
  const [contractType, setContractType] = useState("");
  const [currency, setCurrency] = useState("CNY 人民币");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [partyAName, setPartyAName] = useState("");
  const [partyBName, setPartyBName] = useState("");
  const [counterpartyContactName, setCounterpartyContactName] = useState("");
  const [counterpartyContactPhone, setCounterpartyContactPhone] = useState("");
  const [ourBankAccount, setOurBankAccount] = useState("");
  const [counterpartyBankAccount, setCounterpartyBankAccount] = useState("");

  const promptTags = [
    t("tag.penaltyRatio"),
    t("tag.jurisdiction"),
    t("tag.ipOwnership"),
    t("tag.unlimitedLiability"),
    t("tag.confidentialityPeriod"),
    t("tag.nonCompeteCompensation"),
  ];

  const [tags, setTags] = useState<string[]>([...promptTags]);
  const [newTagInput, setNewTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const removeFile = () => setFile(null);

  const toggleTag = (tag: string) => {
    const bracket = `[${tag}]`;
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
        setCustomRules((r) => r.replace(bracket, "").replace(/\s{2,}/g, " ").trim());
      } else {
        next.add(tag);
        setCustomRules((r) => (r ? `${r} ${bracket}` : bracket));
      }
      return next;
    });
  };

  const addCustomTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      toggleTag(trimmed);
    }
    setNewTagInput("");
    setShowTagInput(false);
  };

  const removeTag = (tag: string) => {
    if (activeTags.has(tag)) toggleTag(tag);
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const stanceOptions: { value: Stance; labelKey: "upload.stance.neutral" | "upload.stance.partyA" | "upload.stance.partyB" }[] = [
    { value: "neutral", labelKey: "upload.stance.neutral" },
    { value: "partyA", labelKey: "upload.stance.partyA" },
    { value: "partyB", labelKey: "upload.stance.partyB" },
  ];

  const handleSubmit = () => {
    if (!file) return;
    const required: [string, string][] = [
      [departmentName, "所属部门"],
      [contractType, "合同类型"],
      [currency, "币种"],
      [startDate, "起始日期"],
      [endDate, "到期日"],
      [partyAName, "甲方名称"],
      [partyBName, "乙方名称"],
      [counterpartyContactName, "对方联系人"],
      [counterpartyContactPhone, "对方联系电话"],
    ];
    for (const [v, label] of required) {
      if (!v) { toast.error(`请填写${label}`); return; }
    }
    onReview(file, {
      stance, negotiationPosition,
      companyName: partyAName,
      customRules,
      departmentName, contractType, currency,
      startDate, endDate,
      partyAName, partyBName,
      counterpartyContactName, counterpartyContactPhone,
      ourBankAccount, counterpartyBankAccount,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-secondary-foreground">{t("upload.tagline")}</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">{t("upload.title")}</h1>
        <p className="text-muted-foreground">{t("upload.subtitle")}</p>
      </div>

      <Card
        className={`relative border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragging
            ? "border-primary bg-accent"
            : file
            ? "border-primary/50 bg-card"
            : "border-border hover:border-primary/40 hover:bg-accent/50 bg-card"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && document.getElementById("file-input")?.click()}
      >
        <input id="file-input" type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.png,.jpg,.jpeg" className="hidden" onChange={handleFileChange} />
        <div className="p-10 flex flex-col items-center gap-4">
          {file ? (
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); removeFile(); }} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                <Upload className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">{t("upload.dropzone")}</p>
                <p className="text-sm text-muted-foreground mt-1">支持 PDF / Word / Excel / 图片 / TXT,最大 20MB</p>
              </div>
            </>
          )}
        </div>
      </Card>

      <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground flex-wrap">
        <span className="flex items-center gap-1">{t("upload.security.encryption")}</span>
        <span className="text-border">|</span>
        <span>{t("upload.security.noTraining")}</span>
        <span className="text-border">|</span>
        <span>{t("upload.security.ephemeral")}</span>
      </div>

      <Card className="p-5 space-y-4 bg-card">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" /> 合同基本信息
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">所属部门 *</Label>
            <Input value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} placeholder="如：行政部" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">合同类型 *</Label>
            <Select value={contractType} onValueChange={setContractType}>
              <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {CONTRACT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">币种 *</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">起始日期 *</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">到期日 *</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">甲方名称 *</Label>
            <Input value={partyAName} onChange={(e) => setPartyAName(e.target.value)} placeholder="我方/甲方公司名称" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">乙方名称 *</Label>
            <Input value={partyBName} onChange={(e) => setPartyBName(e.target.value)} placeholder="对方/乙方公司名称" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">对方联系人 *</Label>
            <Input value={counterpartyContactName} onChange={(e) => setCounterpartyContactName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">对方联系电话 *</Label>
            <Input value={counterpartyContactPhone} onChange={(e) => setCounterpartyContactPhone(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">我方银行账户</Label>
          <Textarea value={ourBankAccount} onChange={(e) => setOurBankAccount(e.target.value)} placeholder="开户行 / 户名 / 账号" className="min-h-[56px]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">对方银行账户</Label>
          <Textarea value={counterpartyBankAccount} onChange={(e) => setCounterpartyBankAccount(e.target.value)} placeholder="开户行 / 户名 / 账号" className="min-h-[56px]" />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{t("upload.stanceLabel")}</label>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {stanceOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStance(opt.value)}
                className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                  stance === opt.value
                    ? "gradient-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">{t("upload.negotiationLabel")}</label>
          <Select value={negotiationPosition} onValueChange={setNegotiationPosition}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equal">{t("upload.negotiation.equal")}</SelectItem>
              <SelectItem value="partyA-advantage">{t("upload.negotiation.partyAAdvantage")}</SelectItem>
              <SelectItem value="partyB-advantage">{t("upload.negotiation.partyBAdvantage")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileEdit className="w-4 h-4" />
          <span className="text-sm font-medium">{t("upload.rulesLabel")}</span>
        </div>
        <Textarea
          value={customRules}
          onChange={(e) => setCustomRules(e.target.value)}
          placeholder={t("upload.rulesPlaceholder")}
          className="bg-card border-border min-h-[100px] resize-none"
        />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{t("upload.tagsLabel")}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant={activeTags.has(tag) ? "default" : "outline"}
                className={`cursor-pointer transition-all text-xs px-2.5 py-1 group ${
                  activeTags.has(tag)
                    ? "gradient-primary text-primary-foreground"
                    : "hover:bg-primary/10 hover:border-primary/40"
                }`}
                onClick={() => toggleTag(tag)}
              >
                {activeTags.has(tag) ? "✓ " : "+ "}
                {tag}
                {!promptTags.includes(tag) && (
                  <button
                    className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))}
            {showTagInput ? (
              <div className="flex items-center gap-1">
                <Input
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomTag()}
                  placeholder={t("upload.tagPlaceholder")}
                  className="h-7 w-36 text-xs bg-card border-border"
                  autoFocus
                />
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={addCustomTag}>{t("upload.tagConfirm")}</Button>
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setShowTagInput(false); setNewTagInput(""); }}>{t("upload.tagCancel")}</Button>
              </div>
            ) : (
              <Badge
                variant="outline"
                className="cursor-pointer border-dashed hover:bg-primary/10 hover:border-primary/40 transition-colors text-xs px-2.5 py-1"
                onClick={() => setShowTagInput(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                {t("upload.addTag")}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Button
        className="w-full h-12 text-base font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
        disabled={!file || isReviewing}
        onClick={handleSubmit}
      >
        <Shield className="w-5 h-5 mr-2" />
        {t("upload.submitBtn")}
      </Button>

      <div className="grid grid-cols-3 gap-4">
        {([
          { label: t("upload.feature.risk"), desc: t("upload.feature.riskDesc") },
          { label: t("upload.feature.clause"), desc: t("upload.feature.clauseDesc") },
          { label: t("upload.feature.compliance"), desc: t("upload.feature.complianceDesc") },
        ]).map((item) => (
          <Card key={item.label} className="p-4 bg-card text-center">
            <p className="font-medium text-foreground text-sm">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContractUpload;
