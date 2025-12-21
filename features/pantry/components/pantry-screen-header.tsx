import { Colors, getThemeColors } from "@/constants/theme";
import { TabType } from "@/features/pantry";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/providers/theme-provider";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PantryScreenHeaderProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  searchQuery: string;
  onSearchChange: (text: string) => void;
  recipeSearchQuery: string;
  onRecipeSearchChange: (text: string) => void;
  shoppingListCount?: number;
  ingredientsCount?: number;
  recipeIdeasCount?: number;
  onClear?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PantryScreenHeader({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  recipeSearchQuery,
  onRecipeSearchChange,
  shoppingListCount = 0,
  ingredientsCount = 0,
  recipeIdeasCount = 0,
  onClear,
}: PantryScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[900];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.background.secondary }]}>
      {/* Top Row: Title & Actions */}
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: themeColors.text.primary }]}>{t("pantry.title")}</Text>

        <View style={styles.actionsContainer}>
          <View style={styles.clearButtonSpacer}>
            {activeTab === "my-ingredients" &&
              ingredientsCount > 0 &&
              onClear && (
                <AnimatedPressable
                  style={[
                    styles.pillButton, 
                    styles.clearButton,
                    { 
                      backgroundColor: isDark ? "rgba(255,69,58,0.15)" : Colors.gray[100],
                      borderColor: isDark ? "rgba(255,69,58,0.3)" : Colors.lilac[300],
                    }
                  ]}
                  onPress={onClear}
                  entering={FadeIn.duration(300)}
                  exiting={FadeOut.duration(300)}
                >
                  <Feather
                    name="trash-2"
                    size={16}
                    color={themeColors.semantic.error.main}
                  />
                </AnimatedPressable>
              )}
          </View>
          <Pressable
            style={[styles.pillButton, styles.cartButton, { backgroundColor: accentColor }]}
            onPress={() => router.push("/shopping-list")}
          >
            <Feather name="shopping-cart" size={16} color="#FFFFFF" />
            <Text style={styles.cartText}>{shoppingListCount}</Text>
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: themeColors.background.surface },
          Platform.OS === "android" ? { paddingVertical: 0 } : null,
        ]}
      >
        <Feather
          name="search"
          size={20}
          color={themeColors.text.tertiary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: themeColors.text.primary }]}
          placeholder={
            activeTab === "my-ingredients"
              ? `${t("common.search")}...`
              : `${t("common.search")}...`
          }
          placeholderTextColor={themeColors.text.tertiary}
          value={
            activeTab === "my-ingredients" ? searchQuery : recipeSearchQuery
          }
          onChangeText={
            activeTab === "my-ingredients"
              ? onSearchChange
              : onRecipeSearchChange
          }
        />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: themeColors.border.light }]}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "my-ingredients" && { borderBottomColor: accentColor },
          ]}
          onPress={() => onTabChange("my-ingredients")}
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                { color: themeColors.text.tertiary },
                activeTab === "my-ingredients" && { color: accentColor },
              ]}
            >
              {t("pantry.myIngredients")}
            </Text>
            {ingredientsCount > 0 && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: isDark ? themeColors.gray[700] : Colors.gray[200] },
                  activeTab === "my-ingredients" && { backgroundColor: accentColor },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: themeColors.text.secondary },
                    activeTab === "my-ingredients" && styles.activeBadgeText,
                  ]}
                >
                  {ingredientsCount}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
        <Pressable
          style={[
            styles.tab, 
            activeTab === "recipe-ideas" && { borderBottomColor: accentColor }
          ]}
          onPress={() => onTabChange("recipe-ideas")}
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                { color: themeColors.text.tertiary },
                activeTab === "recipe-ideas" && { color: accentColor },
              ]}
            >
              {t("pantry.recipeIdeas")}
            </Text>
            {recipeIdeasCount >= 0 && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: isDark ? themeColors.gray[700] : Colors.gray[200] },
                  activeTab === "recipe-ideas" && { backgroundColor: accentColor },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: themeColors.text.secondary },
                    activeTab === "recipe-ideas" && styles.activeBadgeText,
                  ]}
                >
                  {recipeIdeasCount > 99 ? "99+" : recipeIdeasCount}
                </Text>
              </View>
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingBottom: 0,
    minHeight: 160,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  clearButtonSpacer: {
    width: 44,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
    height: 36,
  },
  clearButton: {
    borderWidth: 1,
  },
  cartButton: {},
  cartText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 0,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  activeBadgeText: {
    color: "#FFFFFF",
  },
});

