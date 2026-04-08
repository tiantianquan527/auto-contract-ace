import { supabase } from "@/integrations/supabase/client";
import { ContractReview } from "@/types/contract";

interface ReviewConfig {
  stance: string;
  negotiationPosition: string;
  companyName: string;
  customRules: string;
}

export async function uploadAndReviewContract(
  file: File,
  config: ReviewConfig,
  onProgress?: (step: number) => void
): Promise<ContractReview> {
  // Step 0: uploading
  onProgress?.(0);

  // Upload file to storage
  // Sanitize filename: replace non-ASCII chars to avoid storage key errors
  const safeName = file.name.replace(/[^\x20-\x7E]/g, '_').replace(/\s+/g, '_');
  const filePath = `${Date.now()}_${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("contracts")
    .upload(filePath, file);

  if (uploadError) {
    throw new Error(`文件上传失败: ${uploadError.message}`);
  }

  // Step 1: extracting
  onProgress?.(1);

  // Call edge function
  onProgress?.(2);

  const { data, error } = await supabase.functions.invoke("review-contract", {
    body: {
      filePath,
      stance: config.stance,
      negotiationPosition: config.negotiationPosition,
      companyName: config.companyName,
      customRules: config.customRules,
    },
  });

  if (error) {
    throw new Error(`审核失败: ${error.message}`);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  // Step 3-4: analyzing, generating
  onProgress?.(3);
  await new Promise((r) => setTimeout(r, 500));
  onProgress?.(4);

  return {
    fileName: file.name,
    totalClauses: data.totalClauses,
    riskSummary: data.riskSummary,
    clauses: data.clauses,
    overallScore: data.overallScore,
    reviewedAt: data.reviewedAt,
  };
}
