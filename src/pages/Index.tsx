import { useState } from "react";
import ContractUpload from "@/components/contract/ContractUpload";
import ReviewResult from "@/components/contract/ReviewResult";
import { ContractReview } from "@/types/contract";
import { mockReview } from "@/data/mockReview";

const Index = () => {
  const [review, setReview] = useState<ContractReview | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const handleReview = (_file: File) => {
    setIsReviewing(true);
    // Simulate AI review
    setTimeout(() => {
      setReview({ ...mockReview, fileName: _file.name });
      setIsReviewing(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
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
        {review ? (
          <ReviewResult review={review} onBack={() => setReview(null)} />
        ) : (
          <ContractUpload onReview={handleReview} isReviewing={isReviewing} />
        )}
      </main>
    </div>
  );
};

export default Index;
