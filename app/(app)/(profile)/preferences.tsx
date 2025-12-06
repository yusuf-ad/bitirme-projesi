import { Colors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { useLanguage } from "@/hooks/useLanguage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LANGUAGES = [
  { code: "en" as const, name: "English", flag: "🇺🇸" },
  { code: "tr" as const, name: "Türkçe", flag: "🇹🇷" },
];

export default function PreferencesScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { locale, isLoaded, changeLanguage, t } = useLanguage();
  const { isEnabled: hapticEnabled, setHapticEnabled, selection } = useHaptics();
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const getCurrentLang = () => {
    return LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];
  };

  if (!isLoaded) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: top }]}>
        <ActivityIndicator size="large" color={Colors.lilac[900]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>{t("preferences.title")}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* App Settings Section */}
        <Text style={styles.sectionLabel}>{t("preferences.appSettings")}</Text>
        <View style={styles.card}>
          {/* Language */}
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              selection();
              setShowLanguagePicker(!showLanguagePicker);
            }}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="translate"
                  size={20}
                  color={Colors.lilac[900]}
                />
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemLabel}>{t("preferences.language")}</Text>
                <Text style={styles.menuItemDescription}>
                  {t("preferences.languageDesc")}
                </Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>
                {getCurrentLang().flag} {getCurrentLang().name}
              </Text>
              <MaterialCommunityIcons
                name={showLanguagePicker ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.text.secondary}
              />
            </View>
          </Pressable>

          {/* Language Picker */}
          {showLanguagePicker && (
            <View style={styles.pickerContainer}>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  style={[
                    styles.pickerOption,
                    locale === lang.code && styles.pickerOptionSelected,
                  ]}
                  onPress={async () => {
                    selection();
                    await changeLanguage(lang.code);
                    setShowLanguagePicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionFlag}>{lang.flag}</Text>
                  <Text
                    style={[
                      styles.pickerOptionText,
                      locale === lang.code && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {lang.name}
                  </Text>
                  {locale === lang.code && (
                    <MaterialCommunityIcons
                      name="check"
                      size={20}
                      color={Colors.lilac[900]}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          {/* Haptic Feedback */}
          <View style={styles.switchItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="vibrate"
                  size={20}
                  color={hapticEnabled ? Colors.lilac[900] : Colors.text.secondary}
                />
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemLabel}>{t("preferences.hapticFeedback")}</Text>
                <Text style={styles.menuItemDescription}>
                  {t("preferences.hapticDesc")}
                </Text>
              </View>
            </View>
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{
                false: Colors.gray[200],
                true: Colors.lilac[200],
              }}
              thumbColor={hapticEnabled ? Colors.lilac[900] : "#FFFFFF"}
            />
          </View>
        </View>

        {/* Info Text */}
        <Text style={styles.footerText}>
          {t("preferences.footerText")}{"\n"}
          {t("preferences.languageChangeNote")}
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
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
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
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  switchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  menuItemValue: {
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 48,
  },
  pickerContainer: {
    backgroundColor: "#FAFAFA",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.lilac[100],
  },
  pickerOptionFlag: {
    fontSize: 20,
  },
  pickerOptionText: {
    fontSize: 15,
    color: Colors.text.primary,
    flex: 1,
  },
  pickerOptionTextSelected: {
    fontWeight: "600",
    color: Colors.lilac[900],
  },
  footerText: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
});
