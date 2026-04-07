import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Shield, FileSearch, Scale, ClipboardList } from "lucide-react";

const steps = [
  { label: "正在提取合同要素", percent: 20, icon: FileSearch },
  { label: "正在识别合同主体与条款结构", percent: 40, icon: ClipboardList },
  { label: "正在比对最新劳动法/公司法", percent: 60, icon: Scale },
  { label: "正在分析风险等级", percent: 80, icon: Shield },
  { label: "正在生成风险清单", percent: 95, icon: ClipboardList },
];

const ReviewProgress = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate through steps
    const stepDuration = 2500 / steps.length; // total ~2.5s
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) return prev + 1;
        return prev;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const target = steps[currentStep].percent;
    // Smooth progress animation
    const timer = setTimeout(() => setProgress(target), 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="max-w-lg mx-auto space-y-8 py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center animate-pulse">
          <CurrentIcon className="w-7 h-7 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">AI 正在审核合同</h2>
      </div>

      <div className="space-y-3">
        <Progress value={progress} className="h-2.5" />
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground font-medium">
            {steps[currentStep].label}...
          </p>
          <span className="text-sm font-semibold text-primary">{progress}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div
            key={step.label}
            className={`flex items-center gap-3 text-sm px-3 py-2 rounded-lg transition-all ${
              idx < currentStep
                ? "text-primary bg-primary/5"
                : idx === currentStep
                ? "text-foreground bg-accent font-medium"
                : "text-muted-foreground/50"
            }`}
          >
            <step.icon className="w-4 h-4 flex-shrink-0" />
            <span>{step.label}</span>
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
