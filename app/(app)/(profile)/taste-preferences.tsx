import { getThemeColors } from "@/constants/theme";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TastePreferencesScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);
  const { t } = useLanguage();

  const CUISINES = [
    { id: "italian", label: t("cuisines.italian") },
    { id: "mexican", label: t("cuisines.mexican") },
    { id: "chinese", label: t("cuisines.chinese") },
    { id: "japanese", label: t("cuisines.japanese") },
    { id: "indian", label: t("cuisines.indian") },
    { id: "thai", label: t("cuisines.thai") },
    { id: "french", label: t("cuisines.french") },
    { id: "greek", label: t("cuisines.greek") },
    { id: "spanish", label: t("cuisines.spanish") },
    { id: "mediterranean", label: t("cuisines.mediterranean") },
    { id: "american", label: t("cuisines.american") },
    { id: "korean", label: t("cuisines.korean") },
  ];

  const DISLIKES = [
    { id: "mushrooms", label: t("dislikes.mushrooms") },
    { id: "olives", label: t("dislikes.olives") },
    { id: "cilantro", label: t("dislikes.cilantro") },
    { id: "onions", label: t("dislikes.onions") },
    { id: "garlic", label: t("dislikes.garlic") },
    { id: "spicyFood", label: t("dislikes.spicyFood") },
    { id: "seafood", label: t("dislikes.seafood") },
    { id: "dairy", label: t("dislikes.dairy") },
    { id: "gluten", label: t("dislikes.gluten") },
    { id: "nuts", label: t("dislikes.nuts") },
  ];

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(["italian", "japanese", "mexican"]);
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>(["mushrooms"]);

  const toggleSelection = (id: string, list: string[], setList: (l: string[]) => void) => {
    Haptics.selectionAsync();
    if (list.includes(id)) {
      setList(list.filter((i) => i !== id));
    } else {
      setList([...list, id]);
    }
  };

  const Section = ({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) => (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: Colors.background.surface }]}>
        {children}
      </View>
    </Animated.View>
  );

  const ChipGrid = ({ items, selected, onToggle }: { items: { id: string; label: string }[]; selected: string[]; onToggle: (id: string) => void }) => (
    <View style={styles.chipGrid}>
      {items.map((item) => {
        const isSelected = selected.includes(item.id);
        return (
          <Pressable
            key={item.id}
            onPress={() => onToggle(item.id)}
            style={[
              styles.chip,
              { 
                backgroundColor: isSelected ? Colors.lilac[900] : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"),
                borderColor: isSelected ? Colors.lilac[900] : "transparent"
              }
            ]}
          >
            <Text style={[styles.chipText, { color: isSelected ? "#FFFFFF" : Colors.text.primary }]}>
              {item.label}
            </Text>
            {isSelected && (
              <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
            )}
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors.background.secondary, paddingTop: top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.background.surface }]}>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>{t("tastePreferencesPage.title")}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom + 40 }]}>
        
        {/* Cuisines */}
        <Section title={t("tastePreferencesPage.favoriteCuisines")} delay={100}>
          <View style={styles.sectionContent}>
            <Text style={[styles.description, { color: Colors.text.secondary }]}>
              {t("tastePreferencesPage.favoriteCuisinesDesc")}
            </Text>
            <ChipGrid 
              items={CUISINES} 
              selected={selectedCuisines} 
              onToggle={(id) => toggleSelection(id, selectedCuisines, setSelectedCuisines)} 
            />
          </View>
        </Section>

        {/* Dislikes */}
        <Section title={t("tastePreferencesPage.dislikesExclusions")} delay={200}>
          <View style={styles.sectionContent}>
            <Text style={[styles.description, { color: Colors.text.secondary }]}>
              {t("tastePreferencesPage.dislikesExclusionsDesc")}
            </Text>
            <ChipGrid 
              items={DISLIKES} 
              selected={selectedDislikes} 
              onToggle={(id) => toggleSelection(id, selectedDislikes, setSelectedDislikes)} 
            />
          </View>
        </Section>

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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 40,
  },
  content: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionContent: {
    padding: 16,
    gap: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
