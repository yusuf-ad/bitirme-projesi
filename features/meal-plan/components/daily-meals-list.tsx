import { Colors } from "@/constants/theme";
import { MealPlanItemRecord, MealSlot } from "@/features/meal-plan/types";
import { Image, StyleSheet, Text, View } from "react-native";

interface DailyMealsListProps {
  items: MealPlanItemRecord[];
  selectedDate: Date;
  planName?: string;
}

const MEAL_ORDER: MealSlot[] = ["breakfast", "lunch", "dinner", "snack"];

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const formatDisplayDate = (date: Date) => {
  const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
  const month = date.toLocaleDateString(undefined, { month: "short" });
  const day = date.getDate();
  return `${weekday}, ${month} ${day}`;
};

export function DailyMealsList({
  items,
  planName,
  selectedDate,
}: DailyMealsListProps) {
  const sortedItems = [...items].sort((a, b) => {
    const aIndex = MEAL_ORDER.indexOf(a.meal_type);
    const bIndex = MEAL_ORDER.indexOf(b.meal_type);
    const safeAIndex = aIndex === -1 ? MEAL_ORDER.length : aIndex;
    const safeBIndex = bIndex === -1 ? MEAL_ORDER.length : bIndex;
    return safeAIndex - safeBIndex;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{formatDisplayDate(selectedDate)}</Text>
      {planName ? <Text style={styles.planName}>{planName}</Text> : null}

      <View style={styles.list}>
        {sortedItems.map((item) => {
          const calories = item.calories_per_serving
            ? `${item.calories_per_serving} kcal`
            : null;
          const prepTime = item.ready_in_minutes
            ? `${item.ready_in_minutes} min`
            : null;

          return (
            <View key={item.id} style={styles.card}>
              {item.recipe_image_url ? (
                <Image
                  source={{ uri: item.recipe_image_url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.image, styles.imagePlaceholder]} />
              )}

              <View style={styles.cardContent}>
                <Text style={styles.mealType}>
                  {capitalize(item.meal_type)}
                </Text>
                <Text style={styles.recipeName}>{item.recipe_name}</Text>
                <View style={styles.metaRow}>
                  {prepTime ? (
                    <Text style={styles.metaText}>{prepTime}</Text>
                  ) : null}
                  {prepTime && calories ? (
                    <Text style={styles.metaSeparator}>·</Text>
                  ) : null}
                  {calories ? (
                    <Text style={styles.metaText}>{calories}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingVertical: 16,
  },
  date: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[500],
  },
  planName: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.background.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 156,
  },
  imagePlaceholder: {
    backgroundColor: Colors.gray[200],
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 6,
  },
  mealType: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.lilac[900],
  },
  recipeName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "400",
    color: Colors.gray[600],
  },
  metaSeparator: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gray[600],
  },
});
