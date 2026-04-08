export type Locale = "zh" | "en";

const translations = {
  // Header
  "header.brand": { zh: "JobCity", en: "JobCity" },
  "header.badge": { zh: "合同审核", en: "Contract Review" },

  // Upload page
  "upload.tagline": { zh: "AI 智能合同审核", en: "AI Smart Contract Review" },
  "upload.title": { zh: "一键审核", en: "One-Click Review" },
  "upload.subtitle": { zh: "上传合同文件，AI 将自动识别风险条款并提供修改建议", en: "Upload a contract file and AI will automatically identify risky clauses and suggest revisions" },
  "upload.dropzone": { zh: "拖拽文件到此处或点击上传", en: "Drag & drop file here or click to upload" },
  "upload.formats": { zh: "支持 PDF、Word、TXT 格式，最大 20MB", en: "Supports PDF, Word, TXT formats, max 20MB" },
  "upload.security.encryption": { zh: "🔒 企业级加密传输", en: "🔒 Enterprise-grade encryption" },
  "upload.security.noTraining": { zh: "承诺不使用您的文件训练模型", en: "Your files are never used for model training" },
  "upload.security.ephemeral": { zh: "阅后即焚", en: "Auto-delete after review" },
  "upload.companyLabel": { zh: "我方主体名称", en: "Our Company Name" },
  "upload.companyPlaceholder": { zh: "请输入我方主体名称，例如：XX科技有限公司", en: "Enter your company name, e.g. Acme Inc." },
  "upload.stanceLabel": { zh: "审核立场", en: "Review Stance" },
  "upload.stance.neutral": { zh: "中立", en: "Neutral" },
  "upload.stance.partyA": { zh: "甲方", en: "Party A" },
  "upload.stance.partyB": { zh: "乙方", en: "Party B" },
  "upload.negotiationLabel": { zh: "谈判地位", en: "Negotiation Position" },
  "upload.negotiation.equal": { zh: "平等地位", en: "Equal footing" },
  "upload.negotiation.partyAAdvantage": { zh: "甲方占优", en: "Party A advantage" },
  "upload.negotiation.partyBAdvantage": { zh: "乙方占优", en: "Party B advantage" },
  "upload.rulesLabel": { zh: "高级：自定义审查规则", en: "Advanced: Custom Review Rules" },
  "upload.rulesPlaceholder": { zh: "输入特定审查规则，例如：'重点关注赔偿限额'...", en: "Enter specific review rules, e.g. 'Focus on liability caps'..." },
  "upload.tagsLabel": { zh: "快捷标签库（点击添加/移除）", en: "Quick tags (click to add/remove)" },
  "upload.addTag": { zh: "自定义标签", en: "Custom tag" },
  "upload.tagPlaceholder": { zh: "输入标签名...", en: "Enter tag name..." },
  "upload.tagConfirm": { zh: "确定", en: "OK" },
  "upload.tagCancel": { zh: "取消", en: "Cancel" },
  "upload.submitBtn": { zh: "一键审核", en: "One-Click Review" },
  "upload.feature.risk": { zh: "风险识别", en: "Risk Detection" },
  "upload.feature.riskDesc": { zh: "自动识别合同中的法律风险", en: "Automatically identify legal risks in contracts" },
  "upload.feature.clause": { zh: "条款分析", en: "Clause Analysis" },
  "upload.feature.clauseDesc": { zh: "逐条分析并提供修改建议", en: "Analyze each clause and suggest revisions" },
  "upload.feature.compliance": { zh: "合规检查", en: "Compliance Check" },
  "upload.feature.complianceDesc": { zh: "对照最新法律法规审核", en: "Review against latest laws and regulations" },

  // Prompt tags
  "tag.penaltyRatio": { zh: "重点审查违约金比例", en: "Focus on penalty ratios" },
  "tag.jurisdiction": { zh: "关注管辖权条款", en: "Check jurisdiction clauses" },
  "tag.ipOwnership": { zh: "检查知识产权归属", en: "Check IP ownership" },
  "tag.unlimitedLiability": { zh: "是否有无限连带责任", en: "Unlimited joint liability" },
  "tag.confidentialityPeriod": { zh: "审查保密期限合理性", en: "Review NDA period" },
  "tag.nonCompeteCompensation": { zh: "关注竞业限制补偿", en: "Non-compete compensation" },

  // Progress
  "progress.title": { zh: "AI 正在审核合同", en: "AI is Reviewing the Contract" },
  "progress.step1": { zh: "正在提取合同要素", en: "Extracting contract elements" },
  "progress.step2": { zh: "正在识别合同主体与条款结构", en: "Identifying parties and clause structure" },
  "progress.step3": { zh: "正在比对最新劳动法/公司法", en: "Comparing with latest labor/corporate law" },
  "progress.step4": { zh: "正在分析风险等级", en: "Analyzing risk levels" },
  "progress.step5": { zh: "正在生成风险清单", en: "Generating risk checklist" },

  // Result
  "result.title": { zh: "审查完成", en: "Review Complete" },
  "result.newReview": { zh: "审查新合同", en: "Review New Contract" },
  "result.issuesFound": { zh: "共发现", en: "Found" },
  "result.issues": { zh: "个问题", en: "issues" },
  "result.high": { zh: "🔴 高危", en: "🔴 High" },
  "result.medium": { zh: "🟡 中度", en: "🟡 Medium" },
  "result.low": { zh: "🟢 瑕疵", en: "🟢 Minor" },
  "result.downloadAnnotated": { zh: "下载 批注版", en: "Download Annotated" },
  "result.downloadRevised": { zh: "下载 修订版", en: "Download Revised" },
  "result.details": { zh: "审查详情", en: "Review Details" },
  "result.splitView": { zh: "分屏对照", en: "Split View" },
  "result.listView": { zh: "列表视图", en: "List View" },
  "result.selectAll": { zh: "全选", en: "Select All" },
  "result.suggestion": { zh: "建议：", en: "Suggestion: " },
  "result.disclaimer": { zh: "审查结果仅供参考，重要合同请咨询专业律师", en: "Results are for reference only. Consult a lawyer for important contracts." },
  "result.riskHigh": { zh: "🔴 高危风险", en: "🔴 High Risk" },
  "result.riskMedium": { zh: "🟡 中度风险", en: "🟡 Medium Risk" },
  "result.riskLow": { zh: "🟢 文本瑕疵", en: "🟢 Minor Issue" },

  // Split screen
  "split.originalTitle": { zh: "📄 原始合同", en: "📄 Original Contract" },
  "split.originalDesc": { zh: "点击右侧风险项可定位到对应条款", en: "Click a risk item on the right to locate the clause" },
  "split.aiTitle": { zh: "🤖 AI 风险批注", en: "🤖 AI Risk Annotations" },
  "split.aiDesc": { zh: "按风险等级分类，点击可定位原文", en: "Grouped by risk level. Click to locate in original." },
  "split.clause": { zh: "第", en: "Clause " },
  "split.clauseSuffix": { zh: "条", en: "" },

  // Clause card
  "clause.original": { zh: "原始条款", en: "Original Clause" },
  "clause.suggested": { zh: "建议修改", en: "Suggested Revision" },
  "clause.reason": { zh: "修改原因", en: "Reason" },
  "clause.riskHigh": { zh: "高风险", en: "High Risk" },
  "clause.riskMedium": { zh: "中风险", en: "Medium Risk" },
  "clause.riskLow": { zh: "低风险", en: "Low Risk" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key]?.[locale] ?? key;
}

export default translations;
