"use client";

import { createContext, useContext, useEffect, useState, ComponentProps } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Language, TranslationKey, translations } from "@/lib/i18n";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "id",
  setLang: () => {},
  t: (key) => translations.id[key],
});

export const useTranslation = () => useContext(LanguageContext);

export function AppProviders({ children, ...props }: ThemeProviderProps) {
  const [lang, setLangState] = useState<Language>("id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedLang = localStorage.getItem("app-lang") as Language | null;
    if (storedLang && (storedLang === "id" || storedLang === "en")) {
      setLangState(storedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("app-lang", newLang);
    document.cookie = `app-lang=${newLang}; path=/; max-age=31536000`; // 1 year
  };

  const t = (key: TranslationKey): string => {
    return translations[lang][key] || translations["id"][key] || key;
  };

  if (!mounted) {
    // Avoid hydration mismatch by rendering default without language context briefly
    return (
      <NextThemesProvider {...props}>
        <LanguageContext.Provider value={{ lang: "id", setLang, t: (k) => translations.id[k] }}>
          {children}
        </LanguageContext.Provider>
      </NextThemesProvider>
    );
  }

  return (
    <NextThemesProvider {...props}>
      <LanguageContext.Provider value={{ lang, setLang, t }}>
        {children}
      </LanguageContext.Provider>
    </NextThemesProvider>
  );
}
