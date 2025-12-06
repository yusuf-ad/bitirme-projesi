import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const PRIVACY_PREFS_KEY = "profile_privacy_preferences";

interface PrivacyPreferences {
  personalizedInsights: boolean;
}

const defaultPreferences: PrivacyPreferences = {
  personalizedInsights: true,
};

export function usePrivacyPreferences() {
  const [prefs, setPrefs] = useState<PrivacyPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const storedPrefs = await AsyncStorage.getItem(PRIVACY_PREFS_KEY);
      if (storedPrefs) {
        const parsed = JSON.parse(storedPrefs);
        setPrefs({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load privacy preferences", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const isPersonalizedInsightsEnabled = useCallback(() => {
    return prefs.personalizedInsights;
  }, [prefs.personalizedInsights]);

  return {
    prefs,
    isLoaded,
    isPersonalizedInsightsEnabled: prefs.personalizedInsights,
    reload: loadPreferences,
  };
}
