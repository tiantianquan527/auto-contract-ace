import { useRef } from "react";
import { ContractClause } from "@/types/contract";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface SplitScreenReviewProps {
  clauses: ContractClause[];
  activeClauseId: string | null;
  onClauseClick: (id: string) => void;
}

const SplitScreenReview = ({ clauses, activeClauseId, onClauseClick }: SplitScreenReviewProps) => {
  const { t } = useLanguage();
  const leftRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleRightClick = (id: string) => {
    onClauseClick(id);
    leftRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const riskConfig = {
    high: { color: "text-risk-high", bg: "bg-risk-high/10", border: "border-risk-high/30", icon: AlertCircle, label: t("result.riskHigh"), badgeBg: "bg-risk-high/10 text-risk-high border-risk-high/30" },
    medium: { color: "text-risk-medium", bg: "bg-risk-medium/10", border: "border-risk-medium/30", icon: AlertTriangle, label: t("result.riskMedium"), badgeBg: "bg-risk-medium/10 text-risk-medium border-risk-medium/30" },
    low: { color: "text-risk-low", bg: "bg-risk-low/10", border: "border-risk-low/30", icon: Info, label: t("result.riskLow"), badgeBg: "bg-risk-low/10 text-risk-low border-risk-low/30" },
  };

  const highClauses = clauses.filter((c) => c.riskLevel === "high");
  const mediumClauses = clauses.filter((c) => c.riskLevel === "medium");
  const lowClauses = clauses.filter((c) => c.riskLevel === "low");
  const grouped = [
    { level: "high" as const, items: highClauses },
    { level: "medium" as const, items: mediumClauses },
    { level: "low" as const, items: lowClauses },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-[500px]">
      <div className="border border-border rounded-xl bg-card overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">{t("split.originalTitle")}</h3>
          <p className="text-xs text-muted-foreground">{t("split.originalDesc")}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {clauses.map((clause, idx) => {
            const risk = riskConfig[clause.riskLevel];
            const isActive = activeClauseId === clause.id;
            return (
              <div
                key={clause.id}
                ref={(el) => { leftRefs.current[clause.id] = el; }}
                className={`p-3 rounded-lg border-l-4 transition-all duration-300 ${
                  isActive
                    ? `${risk.border} ${risk.bg} ring-2 ring-offset-1 ring-primary/30`
                    : "border-transparent hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-muted-foreground font-mono">{t("split.clause")}{idx + 1}{t("split.clauseSuffix")}</span>
                  <span className="text-xs font-medium text-muted-foreground">{clause.title}</span>
                </div>
                <p className={`text-sm leading-relaxed ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                  {clause.originalText}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">{t("split.aiTitle")}</h3>
          <p className="text-xs text-muted-foreground">{t("split.aiDesc")}</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {grouped.map(({ level, items }) => {
            const risk = riskConfig[level];
            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{risk.label}</span>
                  <Badge variant="outline" className={`text-xs ${risk.badgeBg}`}>{items.length}</Badge>
                </div>
                {items.map((clause) => {
                  const isActive = activeClauseId === clause.id;
                  const RiskIcon = risk.icon;
                  return (
                    <div
                      key={clause.id}
                      onClick={() => handleRightClick(clause.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isActive
                          ? `${risk.border} ${risk.bg} shadow-sm`
                          : "border-border hover:border-primary/30 hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <RiskIcon className={`w-4 h-4 ${risk.color} flex-shrink-0 mt-0.5`} />
                        <span className="text-sm font-medium text-foreground">{clause.title}</span>
                      </div>
                      <p className="text-sm text-primary font-medium mb-1.5">
                        {t("result.suggestion")}{clause.suggestedText}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{clause.reason}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SplitScreenReview;
