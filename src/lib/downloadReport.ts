import { ContractReview } from "@/types/contract";

function riskLabel(level: string) {
  const map: Record<string, string> = { high: "🔴 高危", medium: "🟡 中度", low: "🟢 瑕疵" };
  return map[level] || level;
}

export function downloadAnnotatedReport(review: ContractReview) {
  let content = `合同审核报告 — 批注版\n`;
  content += `${"=".repeat(50)}\n`;
  content += `文件：${review.fileName}\n`;
  content += `审核时间：${review.reviewedAt}\n`;
  content += `总体评分：${review.overallScore}/100\n`;
  content += `发现问题：${review.clauses.length} 个（高危 ${review.riskSummary.high}，中度 ${review.riskSummary.medium}，瑕疵 ${review.riskSummary.low}）\n`;
  content += `${"=".repeat(50)}\n\n`;

  review.clauses.forEach((c, i) => {
    content += `【${i + 1}】${c.title}  ${riskLabel(c.riskLevel)}\n`;
    content += `分类：${c.category}\n`;
    content += `原文：${c.originalText}\n`;
    content += `⚠ 问题：${c.reason}\n`;
    content += `${"─".repeat(40)}\n\n`;
  });

  downloadText(content, `${review.fileName}_批注版.txt`);
}

export function downloadRevisedReport(review: ContractReview) {
  let content = `合同审核报告 — 修订版\n`;
  content += `${"=".repeat(50)}\n`;
  content += `文件：${review.fileName}\n`;
  content += `审核时间：${review.reviewedAt}\n`;
  content += `${"=".repeat(50)}\n\n`;

  review.clauses.forEach((c, i) => {
    content += `【${i + 1}】${c.title}  ${riskLabel(c.riskLevel)}\n`;
    content += `原文：${c.originalText}\n`;
    content += `修改建议：${c.suggestedText}\n`;
    content += `修改原因：${c.reason}\n`;
    content += `${"─".repeat(40)}\n\n`;
  });

  downloadText(content, `${review.fileName}_修订版.txt`);
}

function downloadText(content: string, filename: string) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
