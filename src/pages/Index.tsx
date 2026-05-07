import { useState } from "react";
import ContractUpload from "@/components/contract/ContractUpload";
import ReviewProgress from "@/components/contract/ReviewProgress";
import ReviewResult from "@/components/contract/ReviewResult";
import { ContractReview } from "@/types/contract";
import { uploadAndReviewContract } from "@/lib/contractReview";
import { toast } from "sonner";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/i18n/LanguageContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, LogIn } from "lucide-react";

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
  const { t } = useLanguage();
  const { user } = useAuth();

  const handleReview = async (file: File, config: ReviewConfig) => {
    setPageState("reviewing");
    setProgressStep(0);
    try {
      const result = await uploadAndReviewContract(file, config, (step) => setProgressStep(step));
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
            <span className="text-lg font-bold text-primary-foreground">{t("header.brand")}</span>
            <span className="text-xs text-primary-foreground/70 border border-primary-foreground/30 rounded px-1.5 py-0.5">
              {t("header.badge")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to={user ? "/app" : "/auth"}>
              <Button size="sm" variant="secondary" className="h-8">
                {user ? <><LayoutDashboard className="w-4 h-4 mr-1" /> 工作台</> : <><LogIn className="w-4 h-4 mr-1" /> 企业登录</>}
              </Button>
            </Link>
            <LanguageSwitcher />
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
