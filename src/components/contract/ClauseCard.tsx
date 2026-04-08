import { useState } from "react";
import { ContractClause, RiskLevel } from "@/types/contract";
import { ChevronDown, ChevronUp, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/i18n/LanguageContext";

const ClauseCard = ({ clause }: { clause: ContractClause }) => {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(clause.riskLevel === "high");

  const riskStyles: Record<RiskLevel, { badge: string; icon: typeof AlertTriangle; label: string; border: string }> = {
    high: { badge: "bg-risk-high/10 text-risk-high border-transparent hover:bg-risk-high/20", icon: AlertTriangle, label: t("clause.riskHigh"), border: "border-l-risk-high" },
    medium: { badge: "bg-risk-medium/10 text-risk-medium border-transparent hover:bg-risk-medium/20", icon: AlertCircle, label: t("clause.riskMedium"), border: "border-l-risk-medium" },
    low: { badge: "bg-risk-low/10 text-risk-low border-transparent hover:bg-risk-low/20", icon: CheckCircle2, label: t("clause.riskLow"), border: "border-l-risk-low" },
  };

  const style = riskStyles[clause.riskLevel];
  const Icon = style.icon;

  return (
    <Card className={`bg-card overflow-hidden border-l-4 ${style.border} transition-all`}>
      <button className="w-full p-4 flex items-center justify-between text-left" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 flex-shrink-0" style={{ color: `hsl(var(--risk-${clause.riskLevel}))` }} />
          <div>
            <span className="font-medium text-foreground">{clause.title}</span>
            <span className="text-xs text-muted-foreground ml-2">{clause.category}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={style.badge}>{style.label}</Badge>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-destructive/5 p-4 space-y-2">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider">{t("clause.original")}</p>
              <p className="text-sm text-foreground leading-relaxed">{clause.originalText}</p>
            </div>
            <div className="rounded-lg bg-success/10 p-4 space-y-2">
              <p className="text-xs font-semibold text-success uppercase tracking-wider">{t("clause.suggested")}</p>
              <p className="text-sm text-foreground leading-relaxed">{clause.suggestedText}</p>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("clause.reason")}</p>
            <p className="text-sm text-foreground leading-relaxed">{clause.reason}</p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default ClauseCard;
