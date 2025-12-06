import i18n, { getCurrentLanguage, loadSavedLanguage, setLanguage } from "@/lib/i18n";
import { useCallback, useEffect, useState } from "react";

export const useLanguage = () => {
  const [locale, setLocale] = useState<"en" | "tr">(getCurrentLanguage());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      await loadSavedLanguage();
      setLocale(getCurrentLanguage());
      setIsLoaded(true);
    };
    load();
  }, []);

  const changeLanguage = useCallback(async (lang: "en" | "tr") => {
    await setLanguage(lang);
    setLocale(lang);
  }, []);

  const t = useCallback((key: string) => {
    return i18n.t(key);
  }, [locale]);

  return {
    locale,
    isLoaded,
    changeLanguage,
    t,
  };
};
