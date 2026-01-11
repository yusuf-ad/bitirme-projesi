import { Colors as StaticColors, getThemeColors } from "@/constants/theme";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SupportFeedbackScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);

  const contactOptions = useMemo(
    () => [
      {
        id: "chat",
        title: t("support.liveChat"),
        description: t("support.liveChatDesc"),
        icon: "message-text-outline",
        action: () => Alert.alert(t("support.liveChat"), "Live chat is currently unavailable. Please contact us via email."),
      },
      {
        id: "email",
        title: t("support.emailSupport"),
        description: "support@plannedeat.app",
        icon: "email-outline",
        action: () =>
          Linking.openURL("mailto:support@plannedeat.app?subject=Support request").catch(() => 
            Alert.alert("Error", "Could not open email client.")
          ),
      },
      {
        id: "feedback",
        title: t("support.productFeedback"),
        description: t("support.productFeedbackDesc"),
        icon: "lightbulb-on-outline",
        action: () => Linking.openURL("mailto:feedback@plannedeat.app?subject=Product Feedback").catch(() => 
            Alert.alert("Error", "Could not open email client.")
          ),
      },
    ],
    [t]
  );

  return (
    <View style={[styles.container, { paddingTop: top, backgroundColor: Colors.background.primary }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>{t("support.title")}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroCard, { backgroundColor: isDark ? Colors.lilac[900] + "20" : StaticColors.lilac[100] }]}>
          <Text style={[styles.heroTitle, { color: Colors.text.primary }]}>{t("support.needHelp")}</Text>
          <Text style={[styles.heroDescription, { color: Colors.text.secondary }]}>
            {t("support.responseTime")}
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: Colors.text.secondary }]}>{t("support.contactUs")}</Text>
        <View style={[styles.card, { backgroundColor: Colors.background.surface }]}>
          {contactOptions.map((option, index) => (
            <View key={option.id}>
              <Pressable
                style={styles.listRow}
                onPress={() => {
                  Haptics.selectionAsync();
                  option.action();
                }}
              >
                <View style={[styles.iconWrapper, { backgroundColor: isDark ? Colors.background.tertiary : "#F4F4F7" }]}>
                  <MaterialCommunityIcons
                    name={option.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={20}
                    color={Colors.lilac[900]}
                  />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={[styles.rowTitle, { color: Colors.text.primary }]}>{option.title}</Text>
                  <Text style={[styles.rowDescription, { color: Colors.text.secondary }]}>{option.description}</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={Colors.text.secondary}
                />
              </Pressable>
              {index < contactOptions.length - 1 && <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#EFEFEF" }]} />}
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: Colors.text.secondary }]}>{t("support.resources")}</Text>
        <View style={[styles.card, { backgroundColor: Colors.background.surface }]}>
          <Pressable
            style={styles.listRow}
            onPress={() => Linking.openURL("https://github.com/senior-project-2026/Planned-Eat-Web/wiki")}
          >
            <View style={[styles.iconWrapper, { backgroundColor: isDark ? Colors.background.tertiary : "#F4F4F7" }]}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={20}
                color={Colors.lilac[900]}
              />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: Colors.text.primary }]}>{t("support.helpCenter")}</Text>
              <Text style={[styles.rowDescription, { color: Colors.text.secondary }]}>
                {t("support.helpCenterDesc")}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.text.secondary}
            />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#EFEFEF" }]} />
          <Pressable
            style={styles.listRow}
            onPress={() => Linking.openURL("https://github.com/senior-project-2026/Planned-Eat-Web/actions")}
          >
            <View style={[styles.iconWrapper, { backgroundColor: isDark ? Colors.background.tertiary : "#F4F4F7" }]}>
              <MaterialCommunityIcons
                name="pulse"
                size={20}
                color={Colors.lilac[900]}
              />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: Colors.text.primary }]}>{t("support.serviceStatus")}</Text>
              <Text style={[styles.rowDescription, { color: Colors.text.secondary }]}>
                {t("support.serviceStatusDesc")}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="open-in-new"
              size={20}
              color={Colors.text.secondary}
            />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#EFEFEF" }]} />
          <Pressable
            style={styles.listRow}
            onPress={() => Linking.openURL("https://senior-project-2026.github.io/Planned-Eat-Web/")}
          >
            <View style={[styles.iconWrapper, { backgroundColor: isDark ? Colors.background.tertiary : "#F4F4F7" }]}>
              <MaterialCommunityIcons
                name="web"
                size={20}
                color={Colors.lilac[900]}
              />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: Colors.text.primary }]}>{t("support.website")}</Text>
              <Text style={[styles.rowDescription, { color: Colors.text.secondary }]}>
                {t("support.websiteDesc")}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="open-in-new"
              size={20}
              color={Colors.text.secondary}
            />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    gap: 6,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  heroDescription: {
    fontSize: 14,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  card: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
    fontSize: 13,
  },
  divider: {
    height: 1,
  },
});
