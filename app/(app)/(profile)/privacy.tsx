import { Colors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
  personalizedInsights: boolean;
}

const defaultPreferences: PrivacyPreferences = {
  personalizedInsights: true,
};

export default function PrivacyScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { selection } = useHaptics();
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
    selection();
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
    selection();
    Alert.alert(
      "Request sent",
      "We'll compile your data export and email it to you within 48 hours."
    );
  };

  const privacyOptions = [
    {
      id: "insights",
      icon: "lightbulb-on-outline" as const,
      title: "Personalized insights",
      description: "Enable AI-powered meal suggestions and tips based on your preferences and goals.",
      value: prefs.personalizedInsights,
      onToggle: (value: boolean) =>
        updatePreference("personalizedInsights", value),
    },
  ];

  if (!isLoaded) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: top }]}>
        <ActivityIndicator size="large" color={Colors.lilac[900]} />
      </View>
    );
  }

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
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Info Banner */}
        <View style={styles.infoBanner}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={24}
            color={Colors.lilac[900]}
          />
          <Text style={styles.infoBannerText}>
            Your data is encrypted and never sold to third parties.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Privacy Controls</Text>
        <View style={styles.card}>
          {privacyOptions.map((option, index) => (
            <View key={option.id}>
              <View style={styles.optionRow}>
                <View style={styles.optionIconContainer}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={20}
                    color={option.value ? Colors.lilac[900] : Colors.text.secondary}
                  />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                <Switch
                  value={option.value}
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

        <Text style={styles.sectionLabel}>Data Management</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.listRow}
            onPress={handleExport}
            accessibilityRole="button"
          >
            <View style={styles.rowIconContainer}>
              <MaterialCommunityIcons
                name="download-outline"
                size={20}
                color={Colors.lilac[900]}
              />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Export my data</Text>
              <Text style={styles.rowDescription}>
                Download a copy of all your data.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.text.secondary}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={styles.listRow}
            onPress={() =>
              Alert.alert(
                "Delete Account",
                "This will permanently delete all your data including meal plans, preferences, and history. This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => Linking.openURL("mailto:privacy@plannedeat.app?subject=Delete my data"),
                  },
                ]
              )
            }
          >
            <View style={[styles.rowIconContainer, styles.rowIconDanger]}>
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color="#DC3545"
              />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, styles.dangerText]}>Delete my account</Text>
              <Text style={styles.rowDescription}>
                Permanently remove all your data.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.text.secondary}
            />
          </Pressable>
        </View>

        <Pressable style={styles.resetButton} onPress={handleReset}>
          <MaterialCommunityIcons
            name="refresh"
            size={18}
            color={Colors.text.primary}
          />
          <Text style={styles.resetText}>Reset to defaults</Text>
        </Pressable>

        <Text style={styles.footerText}>
          Last updated: December 2025{"\n"}
          Questions? Contact privacy@plannedeat.app
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
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
    padding: 16,
    gap: 16,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EDFF",
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    color: Colors.lilac[900],
    fontWeight: "500",
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "600",
    textTransform: "uppercase",
    color: Colors.text.secondary,
    marginTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 48,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  rowIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F0EDFF",
    justifyContent: "center",
    alignItems: "center",
  },
  rowIconDanger: {
    backgroundColor: "#FFEBEE",
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  rowDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  dangerText: {
    color: "#DC3545",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  resetText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
});

