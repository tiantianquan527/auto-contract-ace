export type RiskLevel = "high" | "medium" | "low";

export interface ContractClause {
  id: string;
  title: string;
  originalText: string;
  suggestedText: string;
  reason: string;
  riskLevel: RiskLevel;
  category: string;
}

export interface ContractReview {
  fileName: string;
  totalClauses: number;
  riskSummary: {
    high: number;
    medium: number;
    low: number;
  };
  clauses: ContractClause[];
  overallScore: number;
  reviewedAt: string;
}
