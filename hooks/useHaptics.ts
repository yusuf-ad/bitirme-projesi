import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useState } from "react";

const HAPTIC_KEY = "haptic_feedback_enabled";

// Global state for haptic preference
let globalHapticEnabled = true;

export const useHaptics = () => {
  const [isEnabled, setIsEnabled] = useState(globalHapticEnabled);

  useEffect(() => {
    loadHapticPreference();
  }, []);

  const loadHapticPreference = async () => {
    try {
      const stored = await AsyncStorage.getItem(HAPTIC_KEY);
      if (stored !== null) {
        const enabled = stored === "true";
        globalHapticEnabled = enabled;
        setIsEnabled(enabled);
      }
    } catch (error) {
      console.error("Failed to load haptic preference:", error);
    }
  };

  const setHapticEnabled = useCallback(async (enabled: boolean) => {
    try {
      globalHapticEnabled = enabled;
      setIsEnabled(enabled);
      await AsyncStorage.setItem(HAPTIC_KEY, String(enabled));
      
      // Give feedback when enabling
      if (enabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Failed to save haptic preference:", error);
    }
  }, []);

  const selection = useCallback(() => {
    if (globalHapticEnabled) {
      Haptics.selectionAsync();
    }
  }, []);

  const impact = useCallback((style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
    if (globalHapticEnabled) {
      Haptics.impactAsync(style);
    }
  }, []);

  const notification = useCallback((type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    if (globalHapticEnabled) {
      Haptics.notificationAsync(type);
    }
  }, []);

  return {
    isEnabled,
    setHapticEnabled,
    selection,
    impact,
    notification,
  };
};

// Standalone functions for use outside of React components
export const hapticSelection = () => {
  if (globalHapticEnabled) {
    Haptics.selectionAsync();
  }
};

export const hapticImpact = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Medium) => {
  if (globalHapticEnabled) {
    Haptics.impactAsync(style);
  }
};

export const hapticNotification = (type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
  if (globalHapticEnabled) {
    Haptics.notificationAsync(type);
  }
};

// Initialize haptic preference on app start
export const initHaptics = async () => {
  try {
    const stored = await AsyncStorage.getItem(HAPTIC_KEY);
    if (stored !== null) {
      globalHapticEnabled = stored === "true";
    }
  } catch (error) {
    console.error("Failed to init haptics:", error);
  }
};
