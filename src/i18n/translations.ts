export type Locale = "zh" | "en" | "id" | "es" | "hi";

const translations = {
  // Header
  "header.brand": { zh: "JobCity", en: "JobCity", id: "JobCity", es: "JobCity", hi: "JobCity" },
  "header.badge": { zh: "合同审核", en: "Contract Review", id: "Tinjauan Kontrak", es: "Revisión de Contrato", hi: "अनुबंध समीक्षा" },

  // Auth
  "auth.loginTitle": { zh: "登录", en: "Log In", id: "Masuk", es: "Iniciar Sesión", hi: "लॉग इन" },
  "auth.signupTitle": { zh: "注册", en: "Sign Up", id: "Daftar", es: "Registrarse", hi: "साइन अप" },
  "auth.emailPlaceholder": { zh: "邮箱地址", en: "Email address", id: "Alamat email", es: "Correo electrónico", hi: "ईमेल पता" },
  "auth.passwordPlaceholder": { zh: "密码（至少6位）", en: "Password (min 6 chars)", id: "Kata sandi (min 6 karakter)", es: "Contraseña (mín 6 caracteres)", hi: "पासवर्ड (कम से कम 6 अक्षर)" },
  "auth.loginBtn": { zh: "登录", en: "Log In", id: "Masuk", es: "Iniciar Sesión", hi: "लॉग इन" },
  "auth.signupBtn": { zh: "注册", en: "Sign Up", id: "Daftar", es: "Registrarse", hi: "साइन अप" },
  "auth.noAccount": { zh: "没有账号？", en: "No account?", id: "Belum punya akun?", es: "¿No tienes cuenta?", hi: "खाता नहीं है?" },
  "auth.hasAccount": { zh: "已有账号？", en: "Have an account?", id: "Sudah punya akun?", es: "¿Ya tienes cuenta?", hi: "खाता है?" },
  "auth.signupSuccess": { zh: "注册成功，已自动登录", en: "Signed up successfully", id: "Pendaftaran berhasil", es: "Registro exitoso", hi: "सफलतापूर्वक पंजीकृत" },
  "auth.logout": { zh: "退出", en: "Logout", id: "Keluar", es: "Cerrar Sesión", hi: "लॉग आउट" },

  // Upload page
  "upload.tagline": { zh: "AI 智能合同审核", en: "AI Smart Contract Review", id: "Tinjauan Kontrak AI Cerdas", es: "Revisión Inteligente de Contratos con IA", hi: "AI स्मार्ट अनुबंध समीक्षा" },
  "upload.title": { zh: "一键审核", en: "One-Click Review", id: "Tinjauan Sekali Klik", es: "Revisión con Un Clic", hi: "एक-क्लिक समीक्षा" },
  "upload.subtitle": { zh: "上传合同文件，AI 将自动识别风险条款并提供修改建议", en: "Upload a contract file and AI will automatically identify risky clauses and suggest revisions", id: "Unggah file kontrak dan AI akan otomatis mengidentifikasi klausul berisiko", es: "Sube un contrato y la IA identificará cláusulas de riesgo automáticamente", hi: "अनुबंध फ़ाइल अपलोड करें और AI स्वचालित रूप से जोखिम खंडों की पहचान करेगा" },
  "upload.dropzone": { zh: "拖拽文件到此处或点击上传", en: "Drag & drop file here or click to upload", id: "Seret & lepas file di sini atau klik untuk mengunggah", es: "Arrastra y suelta el archivo aquí o haz clic para subir", hi: "फ़ाइल यहाँ खींचें या अपलोड करने के लिए क्लिक करें" },
  "upload.formats": { zh: "支持 PDF、Word、TXT 格式，最大 20MB", en: "Supports PDF, Word, TXT formats, max 20MB", id: "Mendukung format PDF, Word, TXT, maks 20MB", es: "Soporta PDF, Word, TXT, máx 20MB", hi: "PDF, Word, TXT प्रारूप, अधिकतम 20MB" },
  "upload.security.encryption": { zh: "🔒 企业级加密传输", en: "🔒 Enterprise-grade encryption", id: "🔒 Enkripsi tingkat enterprise", es: "🔒 Cifrado empresarial", hi: "🔒 एंटरप्राइज़-ग्रेड एन्क्रिप्शन" },
  "upload.security.noTraining": { zh: "承诺不使用您的文件训练模型", en: "Your files are never used for model training", id: "File Anda tidak pernah digunakan untuk pelatihan model", es: "Sus archivos nunca se usan para entrenar modelos", hi: "आपकी फ़ाइलें मॉडल प्रशिक्षण के लिए कभी उपयोग नहीं की जातीं" },
  "upload.security.ephemeral": { zh: "阅后即焚", en: "Auto-delete after review", id: "Hapus otomatis setelah tinjauan", es: "Eliminación automática tras revisión", hi: "समीक्षा के बाद ऑटो-डिलीट" },
  "upload.companyLabel": { zh: "我方主体名称", en: "Our Company Name", id: "Nama Perusahaan Kami", es: "Nombre de Nuestra Empresa", hi: "हमारी कंपनी का नाम" },
  "upload.companyPlaceholder": { zh: "请输入我方主体名称，例如：XX科技有限公司", en: "Enter your company name, e.g. Acme Inc.", id: "Masukkan nama perusahaan Anda", es: "Ingrese el nombre de su empresa", hi: "अपनी कंपनी का नाम दर्ज करें" },
  "upload.stanceLabel": { zh: "审核立场", en: "Review Stance", id: "Posisi Tinjauan", es: "Posición de Revisión", hi: "समीक्षा रुख" },
  "upload.stance.neutral": { zh: "中立", en: "Neutral", id: "Netral", es: "Neutral", hi: "तटस्थ" },
  "upload.stance.partyA": { zh: "甲方", en: "Party A", id: "Pihak A", es: "Parte A", hi: "पक्ष A" },
  "upload.stance.partyB": { zh: "乙方", en: "Party B", id: "Pihak B", es: "Parte B", hi: "पक्ष B" },
  "upload.negotiationLabel": { zh: "谈判地位", en: "Negotiation Position", id: "Posisi Negosiasi", es: "Posición de Negociación", hi: "बातचीत की स्थिति" },
  "upload.negotiation.equal": { zh: "平等地位", en: "Equal footing", id: "Posisi setara", es: "En igualdad", hi: "समान स्थिति" },
  "upload.negotiation.partyAAdvantage": { zh: "甲方占优", en: "Party A advantage", id: "Keunggulan Pihak A", es: "Ventaja Parte A", hi: "पक्ष A का लाभ" },
  "upload.negotiation.partyBAdvantage": { zh: "乙方占优", en: "Party B advantage", id: "Keunggulan Pihak B", es: "Ventaja Parte B", hi: "पक्ष B का लाभ" },
  "upload.rulesLabel": { zh: "高级：自定义审查规则", en: "Advanced: Custom Review Rules", id: "Lanjutan: Aturan Tinjauan Kustom", es: "Avanzado: Reglas Personalizadas", hi: "उन्नत: कस्टम समीक्षा नियम" },
  "upload.rulesPlaceholder": { zh: "输入特定审查规则，例如：'重点关注赔偿限额'...", en: "Enter specific review rules, e.g. 'Focus on liability caps'...", id: "Masukkan aturan tinjauan khusus...", es: "Ingrese reglas específicas de revisión...", hi: "विशिष्ट समीक्षा नियम दर्ज करें..." },
  "upload.tagsLabel": { zh: "快捷标签库（点击添加/移除）", en: "Quick tags (click to add/remove)", id: "Tag cepat (klik untuk tambah/hapus)", es: "Etiquetas rápidas (clic para agregar/quitar)", hi: "त्वरित टैग (जोड़ने/हटाने के लिए क्लिक करें)" },
  "upload.addTag": { zh: "自定义标签", en: "Custom tag", id: "Tag kustom", es: "Etiqueta personalizada", hi: "कस्टम टैग" },
  "upload.tagPlaceholder": { zh: "输入标签名...", en: "Enter tag name...", id: "Masukkan nama tag...", es: "Ingrese nombre de etiqueta...", hi: "टैग नाम दर्ज करें..." },
  "upload.tagConfirm": { zh: "确定", en: "OK", id: "OK", es: "OK", hi: "ठीक" },
  "upload.tagCancel": { zh: "取消", en: "Cancel", id: "Batal", es: "Cancelar", hi: "रद्द करें" },
  "upload.submitBtn": { zh: "一键审核", en: "One-Click Review", id: "Tinjauan Sekali Klik", es: "Revisión con Un Clic", hi: "एक-क्लिक समीक्षा" },
  "upload.feature.risk": { zh: "风险识别", en: "Risk Detection", id: "Deteksi Risiko", es: "Detección de Riesgos", hi: "जोखिम पहचान" },
  "upload.feature.riskDesc": { zh: "自动识别合同中的法律风险", en: "Automatically identify legal risks in contracts", id: "Identifikasi risiko hukum secara otomatis", es: "Identifica riesgos legales automáticamente", hi: "अनुबंधों में कानूनी जोखिमों की स्वचालित पहचान" },
  "upload.feature.clause": { zh: "条款分析", en: "Clause Analysis", id: "Analisis Klausul", es: "Análisis de Cláusulas", hi: "खंड विश्लेषण" },
  "upload.feature.clauseDesc": { zh: "逐条分析并提供修改建议", en: "Analyze each clause and suggest revisions", id: "Analisis setiap klausul dan saran revisi", es: "Analiza cada cláusula y sugiere revisiones", hi: "प्रत्येक खंड का विश्लेषण और संशोधन सुझाव" },
  "upload.feature.compliance": { zh: "合规检查", en: "Compliance Check", id: "Pemeriksaan Kepatuhan", es: "Verificación de Cumplimiento", hi: "अनुपालन जाँच" },
  "upload.feature.complianceDesc": { zh: "对照最新法律法规审核", en: "Review against latest laws and regulations", id: "Tinjau terhadap hukum dan regulasi terbaru", es: "Revisión contra las últimas leyes y regulaciones", hi: "नवीनतम कानूनों और विनियमों के विरुद्ध समीक्षा" },

  // Prompt tags
  "tag.penaltyRatio": { zh: "重点审查违约金比例", en: "Focus on penalty ratios", id: "Fokus pada rasio penalti", es: "Enfocarse en ratios de penalización", hi: "जुर्माना अनुपात पर ध्यान दें" },
  "tag.jurisdiction": { zh: "关注管辖权条款", en: "Check jurisdiction clauses", id: "Periksa klausul yurisdiksi", es: "Verificar cláusulas de jurisdicción", hi: "अधिकार क्षेत्र खंडों की जाँच करें" },
  "tag.ipOwnership": { zh: "检查知识产权归属", en: "Check IP ownership", id: "Periksa kepemilikan IP", es: "Verificar propiedad intelectual", hi: "बौद्धिक संपदा स्वामित्व की जाँच करें" },
  "tag.unlimitedLiability": { zh: "是否有无限连带责任", en: "Unlimited joint liability", id: "Tanggung jawab bersama tak terbatas", es: "Responsabilidad solidaria ilimitada", hi: "असीमित संयुक्त देयता" },
  "tag.confidentialityPeriod": { zh: "审查保密期限合理性", en: "Review NDA period", id: "Tinjau periode NDA", es: "Revisar período de NDA", hi: "NDA अवधि की समीक्षा" },
  "tag.nonCompeteCompensation": { zh: "关注竞业限制补偿", en: "Non-compete compensation", id: "Kompensasi non-kompetisi", es: "Compensación de no competencia", hi: "गैर-प्रतिस्पर्धा मुआवज़ा" },

  // Progress
  "progress.title": { zh: "AI 正在审核合同", en: "AI is Reviewing the Contract", id: "AI Sedang Meninjau Kontrak", es: "La IA está Revisando el Contrato", hi: "AI अनुबंध की समीक्षा कर रहा है" },
  "progress.step1": { zh: "正在提取合同要素", en: "Extracting contract elements", id: "Mengekstrak elemen kontrak", es: "Extrayendo elementos del contrato", hi: "अनुबंध तत्व निकाल रहे हैं" },
  "progress.step2": { zh: "正在识别合同主体与条款结构", en: "Identifying parties and clause structure", id: "Mengidentifikasi pihak dan struktur klausul", es: "Identificando partes y estructura de cláusulas", hi: "पक्षों और खंड संरचना की पहचान" },
  "progress.step3": { zh: "正在比对最新劳动法/公司法", en: "Comparing with latest labor/corporate law", id: "Membandingkan dengan hukum terbaru", es: "Comparando con legislación vigente", hi: "नवीनतम कानूनों से तुलना" },
  "progress.step4": { zh: "正在分析风险等级", en: "Analyzing risk levels", id: "Menganalisis tingkat risiko", es: "Analizando niveles de riesgo", hi: "जोखिम स्तरों का विश्लेषण" },
  "progress.step5": { zh: "正在生成风险清单", en: "Generating risk checklist", id: "Membuat daftar risiko", es: "Generando lista de riesgos", hi: "जोखिम चेकलिस्ट बना रहे हैं" },

  // Result
  "result.title": { zh: "审查完成", en: "Review Complete", id: "Tinjauan Selesai", es: "Revisión Completa", hi: "समीक्षा पूर्ण" },
  "result.newReview": { zh: "审查新合同", en: "Review New Contract", id: "Tinjau Kontrak Baru", es: "Revisar Nuevo Contrato", hi: "नया अनुबंध समीक्षा करें" },
  "result.issuesFound": { zh: "共发现", en: "Found", id: "Ditemukan", es: "Se encontraron", hi: "पाया गया" },
  "result.issues": { zh: "个问题", en: "issues", id: "masalah", es: "problemas", hi: "मुद्दे" },
  "result.high": { zh: "🔴 高危", en: "🔴 High", id: "🔴 Tinggi", es: "🔴 Alto", hi: "🔴 उच्च" },
  "result.medium": { zh: "🟡 中度", en: "🟡 Medium", id: "🟡 Sedang", es: "🟡 Medio", hi: "🟡 मध्यम" },
  "result.low": { zh: "🟢 瑕疵", en: "🟢 Minor", id: "🟢 Kecil", es: "🟢 Menor", hi: "🟢 मामूली" },
  "result.downloadAnnotated": { zh: "下载 批注版", en: "Download Annotated", id: "Unduh Beranotasi", es: "Descargar Anotado", hi: "एनोटेटेड डाउनलोड" },
  "result.downloadRevised": { zh: "下载 修订版", en: "Download Revised", id: "Unduh Revisi", es: "Descargar Revisado", hi: "संशोधित डाउनलोड" },
  "result.details": { zh: "审查详情", en: "Review Details", id: "Detail Tinjauan", es: "Detalles de Revisión", hi: "समीक्षा विवरण" },
  "result.splitView": { zh: "分屏对照", en: "Split View", id: "Tampilan Terpisah", es: "Vista Dividida", hi: "विभाजित दृश्य" },
  "result.listView": { zh: "列表视图", en: "List View", id: "Tampilan Daftar", es: "Vista de Lista", hi: "सूची दृश्य" },
  "result.selectAll": { zh: "全选", en: "Select All", id: "Pilih Semua", es: "Seleccionar Todo", hi: "सभी चुनें" },
  "result.suggestion": { zh: "建议：", en: "Suggestion: ", id: "Saran: ", es: "Sugerencia: ", hi: "सुझाव: " },
  "result.disclaimer": { zh: "审查结果仅供参考，重要合同请咨询专业律师", en: "Results are for reference only. Consult a lawyer for important contracts.", id: "Hasil hanya untuk referensi. Konsultasikan kontrak penting dengan pengacara.", es: "Los resultados son solo de referencia. Consulte un abogado para contratos importantes.", hi: "परिणाम केवल संदर्भ के लिए हैं। महत्वपूर्ण अनुबंधों के लिए वकील से परामर्श करें।" },
  "result.riskHigh": { zh: "🔴 高危风险", en: "🔴 High Risk", id: "🔴 Risiko Tinggi", es: "🔴 Riesgo Alto", hi: "🔴 उच्च जोखिम" },
  "result.riskMedium": { zh: "🟡 中度风险", en: "🟡 Medium Risk", id: "🟡 Risiko Sedang", es: "🟡 Riesgo Medio", hi: "🟡 मध्यम जोखिम" },
  "result.riskLow": { zh: "🟢 文本瑕疵", en: "🟢 Minor Issue", id: "🟢 Masalah Kecil", es: "🟢 Problema Menor", hi: "🟢 मामूली मुद्दा" },

  // Split screen
  "split.originalTitle": { zh: "📄 原始合同", en: "📄 Original Contract", id: "📄 Kontrak Asli", es: "📄 Contrato Original", hi: "📄 मूल अनुबंध" },
  "split.originalDesc": { zh: "点击右侧风险项可定位到对应条款", en: "Click a risk item on the right to locate the clause", id: "Klik item risiko di kanan untuk menemukan klausul", es: "Haga clic en un elemento de riesgo para localizar la cláusula", hi: "खंड का पता लगाने के लिए दाईं ओर जोखिम आइटम पर क्लिक करें" },
  "split.aiTitle": { zh: "🤖 AI 风险批注", en: "🤖 AI Risk Annotations", id: "🤖 Anotasi Risiko AI", es: "🤖 Anotaciones de Riesgo IA", hi: "🤖 AI जोखिम एनोटेशन" },
  "split.aiDesc": { zh: "按风险等级分类，点击可定位原文", en: "Grouped by risk level. Click to locate in original.", id: "Dikelompokkan berdasarkan tingkat risiko. Klik untuk menemukan.", es: "Agrupado por nivel de riesgo. Haga clic para localizar.", hi: "जोखिम स्तर के अनुसार समूहित। मूल में खोजने के लिए क्लिक करें।" },
  "split.clause": { zh: "第", en: "Clause ", id: "Klausul ", es: "Cláusula ", hi: "खंड " },
  "split.clauseSuffix": { zh: "条", en: "", id: "", es: "", hi: "" },

  // Clause card
  "clause.original": { zh: "原始条款", en: "Original Clause", id: "Klausul Asli", es: "Cláusula Original", hi: "मूल खंड" },
  "clause.suggested": { zh: "建议修改", en: "Suggested Revision", id: "Saran Revisi", es: "Revisión Sugerida", hi: "सुझाया गया संशोधन" },
  "clause.reason": { zh: "修改原因", en: "Reason", id: "Alasan", es: "Razón", hi: "कारण" },
  "clause.riskHigh": { zh: "高风险", en: "High Risk", id: "Risiko Tinggi", es: "Riesgo Alto", hi: "उच्च जोखिम" },
  "clause.riskMedium": { zh: "中风险", en: "Medium Risk", id: "Risiko Sedang", es: "Riesgo Medio", hi: "मध्यम जोखिम" },
  "clause.riskLow": { zh: "低风险", en: "Low Risk", id: "Risiko Rendah", es: "Riesgo Bajo", hi: "कम जोखिम" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, locale: Locale): string {
  return translations[key]?.[locale] ?? key;
}

export default translations;
