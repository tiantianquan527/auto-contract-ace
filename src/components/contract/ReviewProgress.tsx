import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Shield, FileSearch, Scale, ClipboardList } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { TranslationKey } from "@/i18n/translations";

const stepKeys: { labelKey: TranslationKey; percent: number; icon: typeof FileSearch }[] = [
  { labelKey: "progress.step1", percent: 20, icon: FileSearch },
  { labelKey: "progress.step2", percent: 40, icon: ClipboardList },
  { labelKey: "progress.step3", percent: 60, icon: Scale },
  { labelKey: "progress.step4", percent: 80, icon: Shield },
  { labelKey: "progress.step5", percent: 95, icon: ClipboardList },
];

interface ReviewProgressProps {
  currentStep?: number;
}

const ReviewProgress = ({ currentStep: externalStep }: ReviewProgressProps) => {
  const { t } = useLanguage();
  const [internalStep, setInternalStep] = useState(0);
  const currentStep = externalStep ?? internalStep;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (externalStep !== undefined) return;
    const stepDuration = 2500 / stepKeys.length;
    const interval = setInterval(() => {
      setInternalStep((prev) => (prev < stepKeys.length - 1 ? prev + 1 : prev));
    }, stepDuration);
    return () => clearInterval(interval);
  }, [externalStep]);

  useEffect(() => {
    const target = stepKeys[currentStep].percent;
    const timer = setTimeout(() => setProgress(target), 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const CurrentIcon = stepKeys[currentStep].icon;

  return (
    <div className="max-w-lg mx-auto space-y-8 py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center animate-pulse">
          <CurrentIcon className="w-7 h-7 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{t("progress.title")}</h2>
      </div>

      <div className="space-y-3">
        <Progress value={progress} className="h-2.5" />
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground font-medium">
            {t(stepKeys[currentStep].labelKey)}...
          </p>
          <span className="text-sm font-semibold text-primary">{progress}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {stepKeys.map((step, idx) => (
          <div
            key={step.labelKey}
            className={`flex items-center gap-3 text-sm px-3 py-2 rounded-lg transition-all ${
              idx < currentStep
                ? "text-primary bg-primary/5"
                : idx === currentStep
                ? "text-foreground bg-accent font-medium"
                : "text-muted-foreground/50"
            }`}
          >
            <step.icon className="w-4 h-4 flex-shrink-0" />
            <span>{t(step.labelKey)}</span>
            {idx < currentStep && <span className="ml-auto text-primary">✓</span>}
            {idx === currentStep && (
              <span className="ml-auto w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewProgress;
