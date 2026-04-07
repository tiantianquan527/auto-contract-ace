import { useState } from "react";
import ContractUpload from "@/components/contract/ContractUpload";
import ReviewProgress from "@/components/contract/ReviewProgress";
import ReviewResult from "@/components/contract/ReviewResult";
import { ContractReview } from "@/types/contract";
import { mockReview } from "@/data/mockReview";

type PageState = "upload" | "reviewing" | "result";

const Index = () => {
  const [pageState, setPageState] = useState<PageState>("upload");
  const [review, setReview] = useState<ContractReview | null>(null);

  const handleReview = (_file: File) => {
    setPageState("reviewing");
    setTimeout(() => {
      setReview({ ...mockReview, fileName: _file.name });
      setPageState("result");
    }, 3000);
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
          <ReviewProgress />
        ) : (
          <ContractUpload onReview={handleReview} isReviewing={false} />
        )}
      </main>
    </div>
  );
};

export default Index;
