import { useState } from "react";
import ContractUpload from "@/components/contract/ContractUpload";
import ReviewProgress from "@/components/contract/ReviewProgress";
import ReviewResult from "@/components/contract/ReviewResult";
import { ContractReview } from "@/types/contract";
import { uploadAndReviewContract } from "@/lib/contractReview";
import { toast } from "sonner";

type PageState = "upload" | "reviewing" | "result";

interface ReviewConfig {
  stance: string;
  negotiationPosition: string;
  companyName: string;
  customRules: string;
}

const Index = () => {
  const [pageState, setPageState] = useState<PageState>("upload");
  const [review, setReview] = useState<ContractReview | null>(null);
  const [progressStep, setProgressStep] = useState(0);

  const handleReview = async (file: File, config: ReviewConfig) => {
    setPageState("reviewing");
    setProgressStep(0);

    try {
      const result = await uploadAndReviewContract(file, config, (step) => {
        setProgressStep(step);
      });
      setReview(result);
      setPageState("result");
    } catch (err: any) {
      console.error("Review failed:", err);
      toast.error(err.message || "合同审核失败，请稍后重试");
      setPageState("upload");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-primary">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary-foreground">JobCity</span>
            <span className="text-xs text-primary-foreground/70 border border-primary-foreground/30 rounded px-1.5 py-0.5">
              合同审核
            </span>
          </div>
        </div>
      </header>

      <main className="px-4 py-8">
        {pageState === "result" && review ? (
          <ReviewResult review={review} onBack={() => { setReview(null); setPageState("upload"); }} />
        ) : pageState === "reviewing" ? (
          <ReviewProgress currentStep={progressStep} />
        ) : (
          <ContractUpload onReview={handleReview} isReviewing={false} />
        )}
      </main>
    </div>
  );
};

export default Index;
