import { Colors as StaticColors, getThemeColors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
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

const LANGUAGE_OPTIONS_HEIGHT = 120; // Approximate height of language options

export default function PreferencesScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { locale, isLoaded, changeLanguage, t } = useLanguage();
  const { isEnabled: hapticEnabled, setHapticEnabled, selection } = useHaptics();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  
  // Animation values
  const expandAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Animate language picker when showLanguagePicker changes
  useEffect(() => {
    if (showLanguagePicker) {
      // Expand animation
      Animated.parallel([
        Animated.spring(expandAnim, {
          toValue: 1,
          useNativeDriver: false,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          delay: 100,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Collapse animation
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.spring(expandAnim, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 8,
        }),
      ]).start();
    }
  }, [showLanguagePicker, expandAnim, opacityAnim]);

  const getCurrentLang = () => {
    return LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];
  };

  if (!isLoaded) {
    return (
      <View style={[styles.container, styles.loadingContainer, { paddingTop: top, backgroundColor: Colors.background.secondary }]}>
        <ActivityIndicator size="large" color={Colors.lilac[900]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: top, backgroundColor: Colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.background.surface, borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E5E5" }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>{t("preferences.title")}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* App Settings Section */}
        <Text style={[styles.sectionLabel, { color: Colors.text.secondary }]}>{t("preferences.appSettings")}</Text>
        <View style={[styles.card, { backgroundColor: Colors.background.surface }]}>
          {/* Language */}
          <Pressable
            style={styles.menuItem}
            onPress={() => {
              selection();
              setShowLanguagePicker(!showLanguagePicker);
            }}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? Colors.background.tertiary : "#F5F5F5" }]}>
                <MaterialCommunityIcons
                  name="translate"
                  size={20}
                  color={Colors.lilac[900]}
                />
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={[styles.menuItemLabel, { color: Colors.text.primary }]}>{t("preferences.language")}</Text>
                <Text style={[styles.menuItemDescription, { color: Colors.text.secondary }]}>
                  {t("preferences.languageDesc")}
                </Text>
              </View>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={[styles.menuItemValue, { color: Colors.text.secondary }]}>
                {getCurrentLang().flag} {getCurrentLang().name}
              </Text>
              <MaterialCommunityIcons
                name={showLanguagePicker ? "chevron-up" : "chevron-down"}
                size={20}
                color={Colors.text.secondary}
              />
            </View>
          </Pressable>

          {/* Language Picker - Animated */}
          <Animated.View 
            style={[
              styles.pickerContainer,
              {
                maxHeight: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, LANGUAGE_OPTIONS_HEIGHT],
                }),
                opacity: opacityAnim,
                overflow: "hidden",
                backgroundColor: isDark ? Colors.background.secondary : "#FAFAFA",
                borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "#F0F0F0",
              }
            ]}
          >
            {LANGUAGES.map((lang, index) => (
              <Animated.View
                key={lang.code}
                style={{
                  transform: [{
                    translateX: expandAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  }],
                }}
              >
                <Pressable
                  style={[
                    styles.pickerOption,
                    locale === lang.code && { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : StaticColors.lilac[100] },
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
                      { color: Colors.text.primary },
                      locale === lang.code && { fontWeight: "600", color: Colors.lilac[900] },
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
              </Animated.View>
            ))}
          </Animated.View>

          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F0F0F0" }]} />

          {/* Haptic Feedback */}
          <View style={styles.switchItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDark ? Colors.background.tertiary : "#F5F5F5" }]}>
                <MaterialCommunityIcons
                  name="vibrate"
                  size={20}
                  color={hapticEnabled ? Colors.lilac[900] : Colors.text.secondary}
                />
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={[styles.menuItemLabel, { color: Colors.text.primary }]}>{t("preferences.hapticFeedback")}</Text>
                <Text style={[styles.menuItemDescription, { color: Colors.text.secondary }]}>
                  {t("preferences.hapticDesc")}
                </Text>
              </View>
            </View>
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{
                false: isDark ? Colors.gray[700] : Colors.gray[200],
                true: isDark ? Colors.lilac[700] : Colors.lilac[200],
              }}
              thumbColor={hapticEnabled ? Colors.lilac[900] : "#FFFFFF"}
            />
          </View>
        </View>

        {/* Info Text */}
        <Text style={[styles.footerText, { color: Colors.text.secondary }]}>
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
    justifyContent: "center",
    alignItems: "center",
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuItemDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  menuItemValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginLeft: 48,
  },
  pickerContainer: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  pickerOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
  },
  pickerOptionFlag: {
    fontSize: 20,
  },
  pickerOptionText: {
    fontSize: 15,
    flex: 1,
  },
  footerText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
});
