import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const LanguageSwitcher = () => {
  const { locale, setLocale } = useLanguage();

  const toggle = () => setLocale(locale === "zh" ? "en" : "zh");

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="text-primary-foreground hover:bg-primary-foreground/10 gap-1.5"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-medium">{locale === "zh" ? "EN" : "中文"}</span>
    </Button>
  );
};

export default LanguageSwitcher;
