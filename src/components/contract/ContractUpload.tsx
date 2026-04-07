import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ContractUploadProps {
  onReview: (file: File) => void;
  isReviewing: boolean;
}

const ContractUpload = ({ onReview, isReviewing }: ContractUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

      <Button
        className="w-full h-12 text-base font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
        disabled={!file || isReviewing}
        onClick={() => file && onReview(file)}
      >
        {isReviewing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            正在审核中...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5 mr-2" />
            一键审核
          </>
        )}
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
