import { getThemeColors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/providers/theme-provider";
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
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);
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
      t("privacy.resetConfirm"),
      t("privacy.resetConfirmDesc"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.reset"),
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
      t("privacy.requestSent"),
      t("privacy.requestSentDesc")
    );
  };

  if (!isLoaded) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: top, backgroundColor: Colors.background.secondary }]}>
        <ActivityIndicator size="large" color={Colors.lilac[900]} />
      </View>
    );
  }

  const privacyOptions = [
    {
      id: "insights",
      icon: "lightbulb-on-outline" as const,
      title: t("privacy.personalizedInsights"),
      description: t("privacy.personalizedDesc"),
      value: prefs.personalizedInsights,
      onToggle: (value: boolean) =>
        updatePreference("personalizedInsights", value),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: top, backgroundColor: Colors.background.primary }]}>
      <View style={[styles.header, { backgroundColor: Colors.background.surface, borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E5E5" }]}>
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
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>{t("privacy.title")}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Privacy Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: isDark ? Colors.lilac[900] + "20" : "#F0EDFF" }]}>
          <MaterialCommunityIcons
            name="shield-check-outline"
            size={24}
            color={Colors.lilac[900]}
          />
          <Text style={[styles.infoBannerText, { color: Colors.lilac[900] }]}>
            {t("privacy.dataEncrypted")}
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: Colors.text.secondary }]}>{t("privacy.privacyControls")}</Text>
        <View style={[styles.card, { backgroundColor: Colors.background.surface }]}>
          {privacyOptions.map((option, index) => (
            <View key={option.id}>
              <View style={styles.optionRow}>
                <View style={[styles.optionIconContainer, { backgroundColor: isDark ? Colors.background.tertiary : "#F5F5F5" }]}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={20}
                    color={option.value ? Colors.lilac[900] : Colors.text.secondary}
                  />
                </View>
                <View style={styles.optionCopy}>
                  <Text style={[styles.optionTitle, { color: Colors.text.primary }]}>{option.title}</Text>
                  <Text style={[styles.optionDescription, { color: Colors.text.secondary }]}>
                    {option.description}
                  </Text>
                </View>
                <Switch
                  value={option.value}
                  onValueChange={option.onToggle}
                  trackColor={{
                    false: isDark ? Colors.gray[700] : Colors.gray[200],
                    true: isDark ? Colors.lilac[700] : Colors.lilac[200],
                  }}
                  thumbColor={option.value ? Colors.lilac[900] : "#FFFFFF"}
                />
              </View>
              {index < privacyOptions.length - 1 && <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F0F0F0" }]} />}
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: Colors.text.secondary }]}>{t("privacy.dataManagement")}</Text>
        <View style={[styles.card, { backgroundColor: Colors.background.surface }]}>
          <Pressable
            style={styles.listRow}
            onPress={handleExport}
            accessibilityRole="button"
          >
            <View style={[styles.rowIconContainer, { backgroundColor: isDark ? Colors.lilac[900] + "20" : "#F0EDFF" }]}>
              <MaterialCommunityIcons
                name="download-outline"
                size={20}
                color={Colors.lilac[900]}
              />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: Colors.text.primary }]}>{t("privacy.exportData")}</Text>
              <Text style={[styles.rowDescription, { color: Colors.text.secondary }]}>
                {t("privacy.exportDataDesc")}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.text.secondary}
            />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F0F0F0" }]} />
          <Pressable
            style={styles.listRow}
            onPress={() =>
              Alert.alert(
                t("privacy.deleteAccount"),
                t("privacy.deleteAccountConfirm"),
                [
                  { text: t("common.cancel"), style: "cancel" },
                  {
                    text: t("common.delete"),
                    style: "destructive",
                    onPress: () => Linking.openURL("mailto:privacy@plannedeat.app?subject=Delete my data"),
                  },
                ]
              )
            }
          >
            <View style={[styles.rowIconContainer, { backgroundColor: isDark ? "rgba(220, 53, 69, 0.15)" : "#FFEBEE" }]}>
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color={isDark ? "#EF4444" : "#DC3545"}
              />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: isDark ? "#EF4444" : "#DC3545" }]}>{t("privacy.deleteAccount")}</Text>
              <Text style={[styles.rowDescription, { color: Colors.text.secondary }]}>
                {t("privacy.deleteAccountDesc")}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.text.secondary}
            />
          </Pressable>
        </View>

        <Pressable
          style={[styles.resetButton, { backgroundColor: Colors.background.surface }]}
          onPress={handleReset}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={18}
            color={Colors.text.primary}
          />
          <Text style={[styles.resetText, { color: Colors.text.primary }]}>{t("privacy.resetToDefaults")}</Text>
        </Pressable>

        <Text style={[styles.footerText, { color: Colors.text.secondary }]}>
          {t("privacy.lastUpdated")}{"\n"}
          {t("privacy.contactPrivacy")}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
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
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "600",
    textTransform: "uppercase",
    marginTop: 8,
  },
  card: {
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
    justifyContent: "center",
    alignItems: "center",
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  divider: {
    height: 1,
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
    justifyContent: "center",
    alignItems: "center",
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  rowDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
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
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
});
