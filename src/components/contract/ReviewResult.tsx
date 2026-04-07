import { useState } from "react";
import { ContractReview } from "@/types/contract";
import { CheckCircle2, RefreshCw, Download, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface ReviewResultProps {
  review: ContractReview;
  onBack: () => void;
}

const ReviewResult = ({ review, onBack }: ReviewResultProps) => {
  const totalIssues = review.clauses.length;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(review.clauses.map((c) => c.id))
  );

  const allSelected = selectedIds.size === totalIssues;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(review.clauses.map((c) => c.id)));
    }
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header: 审查完成 */}
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2 className="w-10 h-10 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">审查完成</h1>
        </div>
        <div className="flex-1 flex justify-end">
          <Button variant="outline" className="gap-2" onClick={onBack}>
            <RefreshCw className="w-4 h-4" />
            审查新合同
          </Button>
        </div>
      </div>

      {/* File info */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
          {review.fileName}
        </span>
        <span>·</span>
        <span>
          共发现 <strong className="text-foreground">{totalIssues}</strong> 个问题
        </span>
      </div>

      {/* Download buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-0 bg-card border border-border hover:border-primary/40 transition-colors cursor-pointer">
          <button className="w-full flex items-center justify-center gap-3 p-5">
            <Download className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">下载 批注版</span>
          </button>
        </Card>
        <Card className="p-0 bg-card border border-border hover:border-primary/40 transition-colors cursor-pointer">
          <button className="w-full flex items-center justify-center gap-3 p-5">
            <Download className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">下载 修订版</span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
              {totalIssues}
            </Badge>
          </button>
        </Card>
      </div>

      {/* 审查详情 header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">审查详情</h2>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={toggleAll}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <span className="text-sm text-muted-foreground">
            全选 ({selectedIds.size}/{totalIssues})
          </span>
        </div>
      </div>

      {/* Clause list */}
      <div className="space-y-4">
        {review.clauses.map((clause, index) => (
          <Card key={clause.id} className="bg-card border border-border p-5 space-y-4">
            {/* Top row */}
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedIds.has(clause.id)}
                onCheckedChange={() => toggleOne(clause.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm text-muted-foreground font-medium">#{index + 1}</span>
              <Badge className="bg-primary/10 text-primary border-transparent text-xs">
                建议修改
              </Badge>
            </div>

            {/* Original text */}
            <div className="border-l-2 border-muted pl-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{clause.originalText}</p>
            </div>

            {/* Suggested text */}
            <div>
              <p className="text-sm text-foreground leading-relaxed">
                <span className="text-primary font-medium">建议：</span>
                <span className="font-medium">{clause.suggestedText}</span>
              </p>
            </div>

            {/* Reason */}
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="w-4 h-4 text-risk-medium flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">{clause.reason}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground border border-risk-medium/30 rounded-lg px-4 py-3 bg-risk-medium/5 inline-block">
          审查结果仅供参考，重要合同请咨询专业律师
        </p>
      </div>
    </div>
  );
};

export default ReviewResult;
