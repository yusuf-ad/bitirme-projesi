import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIVACY_PREFS_KEY = "profile_privacy_preferences";

interface PrivacyPreferences {
  shareAnalytics: boolean;
  personalizedInsights: boolean;
  researchOptIn: boolean;
}

const defaultPreferences: PrivacyPreferences = {
  shareAnalytics: true,
  personalizedInsights: true,
  researchOptIn: false,
};

export default function PrivacyScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const [prefs, setPrefs] = useState<PrivacyPreferences>(defaultPreferences);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const storedPrefs = await AsyncStorage.getItem(PRIVACY_PREFS_KEY);
      if (storedPrefs) {
        setPrefs(JSON.parse(storedPrefs));
      }
    } catch (error) {
      console.error("Failed to load privacy preferences", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const updatePreference = async (
    key: keyof PrivacyPreferences,
    value: boolean
  ) => {
    Haptics.selectionAsync();
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await AsyncStorage.setItem(PRIVACY_PREFS_KEY, JSON.stringify(updated));
  };

  const handleReset = async () => {
    Alert.alert(
      "Reset privacy settings?",
      "We'll restore default privacy choices. You can undo this anytime.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setPrefs(defaultPreferences);
            await AsyncStorage.setItem(
              PRIVACY_PREFS_KEY,
              JSON.stringify(defaultPreferences)
            );
          },
        },
      ]
    );
  };

  const handleExport = () => {
    Haptics.selectionAsync();
    Alert.alert(
      "Request sent",
      "We'll compile your data export and email it to you within 48 hours."
    );
  };

  const privacyOptions = [
    {
      id: "analytics",
      title: "Share anonymized analytics",
      description: "Help us improve meal suggestions with usage statistics.",
      value: prefs.shareAnalytics,
      onToggle: (value: boolean) => updatePreference("shareAnalytics", value),
    },
    {
      id: "insights",
      title: "Personalized insights",
      description: "Enable AI-powered tips using your taste & goal data.",
      value: prefs.personalizedInsights,
      onToggle: (value: boolean) =>
        updatePreference("personalizedInsights", value),
    },
    {
      id: "research",
      title: "Opt in to research studies",
      description: "Share anonymous trends with nutrition partners.",
      value: prefs.researchOptIn,
      onToggle: (value: boolean) => updatePreference("researchOptIn", value),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          style={styles.backButton}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy & Data</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Controls</Text>
        <View style={styles.card}>
          {privacyOptions.map((option, index) => (
            <View key={option.id}>
              <View style={styles.optionRow}>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                <Switch
                  value={isLoaded ? option.value : false}
                  onValueChange={option.onToggle}
                  trackColor={{
                    false: Colors.gray[200],
                    true: Colors.lilac[200],
                  }}
                  thumbColor={option.value ? Colors.lilac[900] : "#FFFFFF"}
                />
              </View>
              {index < privacyOptions.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Data requests</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.listRow}
            onPress={handleExport}
            accessibilityRole="button"
          >
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Request data export</Text>
              <Text style={styles.rowDescription}>
                We'll send a secure download link to your email.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="tray-arrow-down"
              size={22}
              color={Colors.text.secondary}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={styles.listRow}
            onPress={() =>
              Linking.openURL("mailto:privacy@plannedeat.app?subject=Delete my data")
            }
          >
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Delete my account</Text>
              <Text style={styles.rowDescription}>
                We'll remove your saved plans and onboarding data.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="delete-alert-outline"
              size={22}
              color={Colors.text.secondary}
            />
          </Pressable>
        </View>

        <Pressable style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reset to defaults</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "600",
    textTransform: "uppercase",
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 0,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    gap: 16,
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    gap: 16,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  rowDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  resetButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  resetText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
  },
});

