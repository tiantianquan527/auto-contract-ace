import { useState } from "react";
import { ContractReview } from "@/types/contract";
import { CheckCircle2, RefreshCw, Download, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SplitScreenReview from "./SplitScreenReview";
import { useLanguage } from "@/i18n/LanguageContext";

interface ReviewResultProps {
  review: ContractReview;
  onBack: () => void;
}

const ReviewResult = ({ review, onBack }: ReviewResultProps) => {
  const { t } = useLanguage();
  const totalIssues = review.clauses.length;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(review.clauses.map((c) => c.id))
  );
  const [activeClauseId, setActiveClauseId] = useState<string | null>(null);

  const allSelected = selectedIds.size === totalIssues;

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(review.clauses.map((c) => c.id)));
  };

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const highClauses = review.clauses.filter((c) => c.riskLevel === "high");
  const mediumClauses = review.clauses.filter((c) => c.riskLevel === "medium");
  const lowClauses = review.clauses.filter((c) => c.riskLevel === "low");

  const riskConfig = {
    high: { color: "text-risk-high", bg: "bg-risk-high/10", border: "border-risk-high/30", icon: AlertCircle, label: t("result.riskHigh"), badgeBg: "bg-risk-high/10 text-risk-high border-risk-high/30" },
    medium: { color: "text-risk-medium", bg: "bg-risk-medium/10", border: "border-risk-medium/30", icon: AlertTriangle, label: t("result.riskMedium"), badgeBg: "bg-risk-medium/10 text-risk-medium border-risk-medium/30" },
    low: { color: "text-risk-low", bg: "bg-risk-low/10", border: "border-risk-low/30", icon: Info, label: t("result.riskLow"), badgeBg: "bg-risk-low/10 text-risk-low border-risk-low/30" },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex flex-col items-center gap-2">
          <CheckCircle2 className="w-10 h-10 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">{t("result.title")}</h1>
        </div>
        <div className="flex-1 flex justify-end">
          <Button variant="outline" className="gap-2" onClick={onBack}>
            <RefreshCw className="w-4 h-4" />
            {t("result.newReview")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
            {review.fileName}
          </span>
          <span>·</span>
          <span>
            {t("result.issuesFound")} <strong className="text-foreground">{totalIssues}</strong> {t("result.issues")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={riskConfig.high.badgeBg}>
            {t("result.high")} {highClauses.length}
          </Badge>
          <Badge variant="outline" className={riskConfig.medium.badgeBg}>
            {t("result.medium")} {mediumClauses.length}
          </Badge>
          <Badge variant="outline" className={riskConfig.low.badgeBg}>
            {t("result.low")} {lowClauses.length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-0 bg-card border border-border hover:border-primary/40 transition-colors cursor-pointer">
          <button className="w-full flex items-center justify-center gap-3 p-5">
            <Download className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">{t("result.downloadAnnotated")}</span>
          </button>
        </Card>
        <Card className="p-0 bg-card border border-border hover:border-primary/40 transition-colors cursor-pointer">
          <button className="w-full flex items-center justify-center gap-3 p-5">
            <Download className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium text-foreground">{t("result.downloadRevised")}</span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
              {totalIssues}
            </Badge>
          </button>
        </Card>
      </div>

      <Tabs defaultValue="split" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{t("result.details")}</h2>
          <TabsList className="bg-muted">
            <TabsTrigger value="split" className="text-xs">{t("result.splitView")}</TabsTrigger>
            <TabsTrigger value="list" className="text-xs">{t("result.listView")}</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="split" className="mt-0">
          <SplitScreenReview clauses={review.clauses} activeClauseId={activeClauseId} onClauseClick={setActiveClauseId} />
        </TabsContent>

        <TabsContent value="list" className="mt-0 space-y-4">
          <div className="flex items-center justify-end gap-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={toggleAll}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="text-sm text-muted-foreground">
              {t("result.selectAll")} ({selectedIds.size}/{totalIssues})
            </span>
          </div>

          {[
            { level: "high" as const, items: highClauses },
            { level: "medium" as const, items: mediumClauses },
            { level: "low" as const, items: lowClauses },
          ]
            .filter((g) => g.items.length > 0)
            .map(({ level, items }) => {
              const risk = riskConfig[level];
              const RiskIcon = risk.icon;
              return (
                <div key={level} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{risk.label}</span>
                    <Badge variant="outline" className={`text-xs ${risk.badgeBg}`}>{items.length}</Badge>
                  </div>
                  {items.map((clause) => (
                    <Card key={clause.id} className={`bg-card border p-5 space-y-4 ${risk.border}`}>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={selectedIds.has(clause.id)}
                          onCheckedChange={() => toggleOne(clause.id)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-sm text-muted-foreground font-medium">{clause.title}</span>
                        <Badge className={`border-transparent text-xs ${risk.badgeBg}`}>{risk.label}</Badge>
                      </div>
                      <div className="border-l-2 border-muted pl-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">{clause.originalText}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground leading-relaxed">
                          <span className="text-primary font-medium">{t("result.suggestion")}</span>
                          <span className="font-medium">{clause.suggestedText}</span>
                        </p>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <RiskIcon className={`w-4 h-4 ${risk.color} flex-shrink-0 mt-0.5`} />
                        <p className="leading-relaxed">{clause.reason}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              );
            })}
        </TabsContent>
      </Tabs>

      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground border border-risk-medium/30 rounded-lg px-4 py-3 bg-risk-medium/5 inline-block">
          {t("result.disclaimer")}
        </p>
      </div>
    </div>
  );
};

export default ReviewResult;
