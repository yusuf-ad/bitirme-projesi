import i18n, {
    getCurrentLanguage,
    loadSavedLanguage,
    setLanguage,
} from "@/lib/i18n";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type Locale = "en" | "tr";

interface LanguageContextType {
  locale: Locale;
  isLoaded: boolean;
  changeLanguage: (lang: Locale) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(getCurrentLanguage());
  const [isLoaded, setIsLoaded] = useState(false);
  // Force re-render counter to ensure all components update
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    const load = async () => {
      await loadSavedLanguage();
      setLocale(getCurrentLanguage());
      setIsLoaded(true);
    };
    load();
  }, []);

  const changeLanguage = useCallback(async (lang: Locale) => {
    await setLanguage(lang);
    setLocale(lang);
    // Force a re-render to ensure all components pick up the new language
    setForceUpdate((prev) => prev + 1);
  }, []);

  // Create a new t function reference when locale changes
  // This ensures components that depend on t will re-render
  const t = useMemo(
    () => (key: string) => {
      return i18n.t(key);
    },
    [locale]
  );

  const value = useMemo(
    () => ({ locale, isLoaded, changeLanguage, t }),
    [locale, isLoaded, changeLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
