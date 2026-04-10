import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Locale } from "@/i18n/translations";

const languages: { code: Locale; flag: string }[] = [
  { code: "zh", flag: "🇨🇳" },
  { code: "en", flag: "🇺🇸" },
  { code: "id", flag: "🇮🇩" },
  { code: "es", flag: "🇪🇸" },
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
          className="text-primary-foreground hover:bg-primary-foreground/10 px-2"
        >
          <span className="text-xl leading-none">{current.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLocale(lang.code)}
            className={`justify-center ${locale === lang.code ? "bg-accent" : ""}`}
          >
            <span className="text-2xl leading-none">{lang.flag}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
