import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Locale } from "@/i18n/translations";

const languages: { code: Locale; flag: string; label: string }[] = [
  { code: "zh", flag: "🇨🇳", label: "中文" },
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "id", flag: "🇮🇩", label: "Bahasa" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "hi", flag: "🇮🇳", label: "हिन्दी" },
];

const LanguageSwitcher = () => {
  const { locale, setLocale } = useLanguage();
  const current = languages.find((l) => l.code === locale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary-foreground/10 gap-1.5"
        >
          <span className="text-lg leading-none">{current.flag}</span>
          <span className="text-sm font-medium">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={locale === lang.code ? "bg-accent" : ""}
          >
            <span className="text-lg mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
