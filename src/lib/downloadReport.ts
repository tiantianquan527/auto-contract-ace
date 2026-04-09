import { ContractReview } from "@/types/contract";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, WidthType, ShadingType, BorderStyle, HeadingLevel,
  Header, Footer, PageNumber,
} from "docx";

const riskColors: Record<string, string> = {
  high: "FF4444",
  medium: "FFAA00",
  low: "22CC66",
};

const riskLabels: Record<string, string> = {
  high: "高危",
  medium: "中度",
  low: "瑕疵",
};

function cellBorders() {
  const b = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  return { top: b, bottom: b, left: b, right: b };
}

function summaryTable(review: ContractReview): Table {
  const rows = [
    ["文件", review.fileName],
    ["审核时间", review.reviewedAt],
    ["总体评分", `${review.overallScore}/100`],
    ["发现问题", `${review.clauses.length} 个（高危 ${review.riskSummary.high}，中度 ${review.riskSummary.medium}，瑕疵 ${review.riskSummary.low}）`],
  ];
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2400, 6960],
    rows: rows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 2400, type: WidthType.DXA },
              borders: cellBorders(),
              shading: { fill: "F0F4F8", type: ShadingType.CLEAR },
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 22, font: "Arial" })] })],
            }),
            new TableCell({
              width: { size: 6960, type: WidthType.DXA },
              borders: cellBorders(),
              margins: { top: 60, bottom: 60, left: 120, right: 120 },
              children: [new Paragraph({ children: [new TextRun({ text: value, size: 22, font: "Arial" })] })],
            }),
          ],
        })
    ),
  });
}

export async function downloadAnnotatedReport(review: ContractReview) {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "合同审核报告 — 批注版", bold: true, size: 36, font: "Arial" })],
    }),
    new Paragraph({ children: [] }),
    summaryTable(review),
    new Paragraph({ children: [] }),
  ];

  review.clauses.forEach((c, i) => {
    const color = riskColors[c.riskLevel] || "333333";
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
        children: [
          new TextRun({ text: `【${i + 1}】${c.title}  `, bold: true, size: 26, font: "Arial" }),
          new TextRun({ text: riskLabels[c.riskLevel] || c.riskLevel, bold: true, size: 26, font: "Arial", color }),
        ],
      }),
      new Paragraph({
        children: [new TextRun({ text: `分类：${c.category}`, size: 22, font: "Arial", color: "666666" })],
      }),
      new Paragraph({
        spacing: { before: 100 },
        children: [
          new TextRun({ text: "原文：", bold: true, size: 22, font: "Arial" }),
          new TextRun({ text: c.originalText, size: 22, font: "Arial" }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100 },
        children: [
          new TextRun({ text: "⚠ 问题：", bold: true, size: 22, font: "Arial", color }),
          new TextRun({ text: c.reason, size: 22, font: "Arial", color }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100 },
        children: [
          new TextRun({ text: "💡 建议修改：", bold: true, size: 22, font: "Arial", color: "2266CC" }),
          new TextRun({ text: c.suggestedText, size: 22, font: "Arial", color: "2266CC" }),
        ],
      }),
      new Paragraph({
        spacing: { after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD", space: 8 } },
        children: [],
      })
    );
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "合同审核报告 — 批注版", size: 18, font: "Arial", color: "999999" })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "第 ", size: 18, font: "Arial", color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial", color: "999999" }), new TextRun({ text: " 页", size: 18, font: "Arial", color: "999999" })],
          })],
        }),
      },
      children,
    }],
  });

  const buffer = await Packer.toBlob(doc);
  downloadBlob(buffer, `${review.fileName}_批注版.docx`);
}

export async function downloadRevisedReport(review: ContractReview) {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "合同审核报告 — 修订版", bold: true, size: 36, font: "Arial" })],
    }),
    new Paragraph({ children: [] }),
    summaryTable(review),
    new Paragraph({ children: [] }),
  ];

  review.clauses.forEach((c, i) => {
    const color = riskColors[c.riskLevel] || "333333";
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
        children: [
          new TextRun({ text: `【${i + 1}】${c.title}  `, bold: true, size: 26, font: "Arial" }),
          new TextRun({ text: riskLabels[c.riskLevel] || c.riskLevel, bold: true, size: 26, font: "Arial", color }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100 },
        children: [
          new TextRun({ text: "原文：", bold: true, size: 22, font: "Arial" }),
          new TextRun({ text: c.originalText, size: 22, font: "Arial", strikethrough: true, color: "999999" }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100 },
        children: [
          new TextRun({ text: "修改为：", bold: true, size: 22, font: "Arial", color: "2266CC" }),
          new TextRun({ text: c.suggestedText, size: 22, font: "Arial", color: "2266CC", underline: {} }),
        ],
      }),
      new Paragraph({
        spacing: { before: 100 },
        children: [
          new TextRun({ text: "修改原因：", bold: true, size: 22, font: "Arial", color: "666666" }),
          new TextRun({ text: c.reason, size: 22, font: "Arial", color: "666666", italics: true }),
        ],
      }),
      new Paragraph({
        spacing: { after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD", space: 8 } },
        children: [],
      })
    );
  });

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "合同审核报告 — 修订版", size: 18, font: "Arial", color: "999999" })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "第 ", size: 18, font: "Arial", color: "999999" }), new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial", color: "999999" }), new TextRun({ text: " 页", size: 18, font: "Arial", color: "999999" })],
          })],
        }),
      },
      children,
    }],
  });

  const buffer = await Packer.toBlob(doc);
  downloadBlob(buffer, `${review.fileName}_修订版.docx`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
