import { getThemeColors } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
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

const CUISINES = [
  "Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", "French", "Greek", "Spanish", "Mediterranean", "American", "Korean"
];

const DISLIKES = [
  "Mushrooms", "Olives", "Cilantro", "Onions", "Garlic", "Spicy Food", "Seafood", "Dairy", "Gluten", "Nuts"
];

export default function TastePreferencesScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);
  const { profile } = useAuthContext();

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(["Italian", "Japanese", "Mexican"]);
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>(["Mushrooms"]);

  const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
    Haptics.selectionAsync();
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
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

  const ChipGrid = ({ items, selected, onToggle }: { items: string[]; selected: string[]; onToggle: (item: string) => void }) => (
    <View style={styles.chipGrid}>
      {items.map((item) => {
        const isSelected = selected.includes(item);
        return (
          <Pressable
            key={item}
            onPress={() => onToggle(item)}
            style={[
              styles.chip,
              { 
                backgroundColor: isSelected ? Colors.lilac[900] : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"),
                borderColor: isSelected ? Colors.lilac[900] : "transparent"
              }
            ]}
          >
            <Text style={[styles.chipText, { color: isSelected ? "#FFFFFF" : Colors.text.primary }]}>
              {item}
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
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>Taste Preferences</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom + 40 }]}>
        
        {/* Cuisines */}
        <Section title="Favorite Cuisines" delay={100}>
          <View style={styles.sectionContent}>
            <Text style={[styles.description, { color: Colors.text.secondary }]}>
              Select the cuisines you enjoy the most. We'll prioritize recipes from these categories.
            </Text>
            <ChipGrid 
              items={CUISINES} 
              selected={selectedCuisines} 
              onToggle={(item) => toggleSelection(item, selectedCuisines, setSelectedCuisines)} 
            />
          </View>
        </Section>

        {/* Dislikes */}
        <Section title="Dislikes & Exclusions" delay={200}>
          <View style={styles.sectionContent}>
            <Text style={[styles.description, { color: Colors.text.secondary }]}>
              Ingredients you want to avoid. We'll do our best to exclude recipes containing these.
            </Text>
            <ChipGrid 
              items={DISLIKES} 
              selected={selectedDislikes} 
              onToggle={(item) => toggleSelection(item, selectedDislikes, setSelectedDislikes)} 
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
