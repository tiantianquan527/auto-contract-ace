import { useState, useCallback } from "react";
import { Upload, FileText, X, Shield, FileEdit, Building2, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReviewConfig {
  stance: string;
  negotiationPosition: string;
  companyName: string;
  customRules: string;
}

interface ContractUploadProps {
  onReview: (file: File, config: ReviewConfig) => void;
  isReviewing: boolean;
}

type Stance = "neutral" | "partyA" | "partyB";

const promptTags = [
  "重点审查违约金比例",
  "关注管辖权条款",
  "检查知识产权归属",
  "是否有无限连带责任",
  "审查保密期限合理性",
  "关注竞业限制补偿",
];

const ContractUpload = ({ onReview, isReviewing }: ContractUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stance, setStance] = useState<Stance>("partyA");
  const [negotiationPosition, setNegotiationPosition] = useState("equal");
  const [customRules, setCustomRules] = useState("");
  const [companyName, setCompanyName] = useState("");
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

  const stanceOptions: { value: Stance; label: string }[] = [
    { value: "neutral", label: "中立" },
    { value: "partyA", label: "甲方" },
    { value: "partyB", label: "乙方" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-secondary-foreground">AI 智能合同审核</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">一键审核</h1>
        <p className="text-muted-foreground">
          上传合同文件，AI 将自动识别风险条款并提供修改建议
        </p>
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
        <input
          id="file-input"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="p-10 flex flex-col items-center gap-4">
          {file ? (
            <div className="flex items-center gap-4 w-full">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                <Upload className="w-7 h-7 text-primary-foreground" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">拖拽文件到此处或点击上传</p>
                <p className="text-sm text-muted-foreground mt-1">
                  支持 PDF、Word、TXT 格式，最大 20MB
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* 我方主体名称 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <label className="text-sm font-medium">我方主体名称</label>
        </div>
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="请输入我方主体名称，例如：XX科技有限公司"
          className="bg-card border-border"
        />
      </div>

      {/* 审核立场 & 谈判地位 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">审核立场</label>
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
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">谈判地位</label>
          <Select value={negotiationPosition} onValueChange={setNegotiationPosition}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equal">平等地位</SelectItem>
              <SelectItem value="partyA-advantage">甲方占优</SelectItem>
              <SelectItem value="partyB-advantage">乙方占优</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 高级：自定义审查规则 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileEdit className="w-4 h-4" />
          <span className="text-sm font-medium">高级：自定义审查规则</span>
        </div>
        <Textarea
          value={customRules}
          onChange={(e) => setCustomRules(e.target.value)}
          placeholder="输入特定审查规则，例如：'重点关注赔偿限额'..."
          className="bg-card border-border min-h-[100px] resize-none"
        />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">快捷标签库（点击添加/移除）</span>
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
                  placeholder="输入标签名..."
                  className="h-7 w-36 text-xs bg-card border-border"
                  autoFocus
                />
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={addCustomTag}>
                  确定
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setShowTagInput(false); setNewTagInput(""); }}>
                  取消
                </Button>
              </div>
            ) : (
              <Badge
                variant="outline"
                className="cursor-pointer border-dashed hover:bg-primary/10 hover:border-primary/40 transition-colors text-xs px-2.5 py-1"
                onClick={() => setShowTagInput(true)}
              >
                <Plus className="w-3 h-3 mr-1" />
                自定义标签
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Button
        className="w-full h-12 text-base font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
        disabled={!file || isReviewing}
        onClick={() => file && onReview(file, { stance, negotiationPosition, companyName, customRules })}
      >
        <Shield className="w-5 h-5 mr-2" />
        一键审核
      </Button>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "风险识别", desc: "自动识别合同中的法律风险" },
          { label: "条款分析", desc: "逐条分析并提供修改建议" },
          { label: "合规检查", desc: "对照最新法律法规审核" },
        ].map((item) => (
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
