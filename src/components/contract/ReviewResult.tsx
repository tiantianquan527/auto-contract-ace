import { ContractReview, RiskLevel } from "@/types/contract";
import { ArrowLeft, Download, AlertTriangle, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ClauseCard from "./ClauseCard";

interface ReviewResultProps {
  review: ContractReview;
  onBack: () => void;
}

const riskConfig: Record<RiskLevel, { label: string; icon: typeof AlertTriangle; colorClass: string }> = {
  high: { label: "高风险", icon: AlertTriangle, colorClass: "text-risk-high" },
  medium: { label: "中风险", icon: AlertCircle, colorClass: "text-risk-medium" },
  low: { label: "低风险", icon: CheckCircle2, colorClass: "text-risk-low" },
};

const ReviewResult = ({ review, onBack }: ReviewResultProps) => {
  const scoreColor =
    review.overallScore >= 80 ? "text-risk-low" : review.overallScore >= 60 ? "text-risk-medium" : "text-risk-high";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">审核报告</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-3.5 h-3.5" />
              <span>{review.fileName}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          导出报告
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5 bg-card text-center">
          <p className="text-sm text-muted-foreground">合规评分</p>
          <p className={`text-3xl font-bold mt-1 ${scoreColor}`}>{review.overallScore}</p>
        </Card>
        {(["high", "medium", "low"] as RiskLevel[]).map((level) => {
          const config = riskConfig[level];
          const Icon = config.icon;
          return (
            <Card key={level} className="p-5 bg-card text-center">
              <p className="text-sm text-muted-foreground">{config.label}</p>
              <div className={`flex items-center justify-center gap-2 mt-1 ${config.colorClass}`}>
                <Icon className="w-5 h-5" />
                <span className="text-3xl font-bold">{review.riskSummary[level]}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Clauses */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          条款审核详情 ({review.totalClauses} 条)
        </h2>
        {review.clauses.map((clause) => (
          <ClauseCard key={clause.id} clause={clause} />
        ))}
      </div>
    </div>
  );
};

export default ReviewResult;
