import { Colors, getThemeColors } from "@/constants/theme";
import { pantryService } from "@/features/pantry/services/pantry-service";
import { PantryCategory } from "@/features/pantry/types";
import { generateAPIUrl } from "@/lib/utils";
import { useTheme } from "@/providers/theme-provider";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
interface EditableIngredient {
  id: string;
  name: string;
  parsedAmount: number;
  parsedUnit: string;
  isWeight: boolean;
  spoonacularId?: number;
  spoonacularName?: string;
  spoonacularImage?: string;
}

export default function ManualAdd() {
  const router = useRouter();
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark);
  const params = useLocalSearchParams<{ destination?: string }>();
  const destination = params.destination || "pantry";
  const { top, bottom } = useSafeAreaInsets();

  const [ingredients, setIngredients] = useState<EditableIngredient[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [amountInputs, setAmountInputs] = useState<string[]>([]);
  const idCounter = useRef(0);

  const generateId = () => {
    idCounter.current += 1;
    return `ingredient-${idCounter.current}`;
  };

  // Start with one empty row for convenience
  useEffect(() => {
    if (ingredients.length === 0) {
      setIngredients([
        {
          id: generateId(),
          name: "",
          parsedAmount: 1,
          parsedUnit: "piece",
          isWeight: false,
        },
      ]);
      setEditingIndex(0);
      setAmountInputs(["1"]);
    }
  }, [ingredients.length]);

  const updateAmount = (index: number, newAmount: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index].parsedAmount = newAmount;
    setIngredients(newIngredients);
    setAmountInputs((prev) => {
      const next = [...prev];
      const isPiece =
        newIngredients[index].parsedUnit.toLowerCase() === "piece";
      next[index] = isPiece ? String(Math.round(newAmount)) : String(newAmount);
      return next;
    });
  };

  const handleIncrement = (index: number) => {
    const current = ingredients[index].parsedAmount;
    updateAmount(index, current + 1);
  };

  const handleDecrement = (index: number) => {
    const current = ingredients[index].parsedAmount;
    if (current > 0) updateAmount(index, current - 1);
  };

  const handleAmountChange = (
    index: number,
    text: string,
    isPiece: boolean
  ) => {
    // Track raw input for controlled editing
    setAmountInputs((prev) => {
      const next = [...prev];
      next[index] = text;
      return next;
    });

    // Validate and update parsed amount only when text is numeric
    const numericPattern = isPiece ? /^\d+$/ : /^\d*(?:\.\d*)?$/;
    if (numericPattern.test(text) && text !== "" && text !== ".") {
      const val = isPiece ? parseInt(text, 10) : parseFloat(text);
      if (!isNaN(val)) updateAmount(index, val);
    }
  };

  const handleNameChange = (index: number, text: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index].name = text;
    setIngredients(newIngredients);
  };

  // unit changes are handled via chips; inline unit edit is removed to avoid accidental switches

  const COMMON_UNITS = [
    { label: "piece", value: "piece", weight: false },
    { label: "g", value: "g", weight: true },
    { label: "kg", value: "kg", weight: true },
    { label: "ml", value: "ml", weight: true },
    { label: "l", value: "l", weight: true },
  ];

  const quickSetUnit = (index: number, nextUnit: string, isWeight: boolean) => {
    const updated = [...ingredients];
    const prevUnit = (updated[index].parsedUnit || "").toLowerCase();
    const amount = updated[index].parsedAmount;

    // Handle simple unit conversions for weight/volume
    let newAmount = amount;
    const nu = nextUnit.toLowerCase();
    if (prevUnit === "g" && nu === "kg") newAmount = amount / 1000;
    else if (prevUnit === "kg" && nu === "g") newAmount = amount * 1000;
    else if (prevUnit === "ml" && nu === "l") newAmount = amount / 1000;
    else if (prevUnit === "l" && nu === "ml") newAmount = amount * 1000;
    // piece or other switches: keep same numeric amount

    updated[index].parsedAmount = newAmount;
    updated[index].parsedUnit = nextUnit;
    updated[index].isWeight = isWeight;
    setIngredients(updated);
  };

  const addNewIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        id: generateId(),
        name: "",
        parsedAmount: 1,
        parsedUnit: "piece",
        isWeight: false,
      },
    ]);
    setEditingIndex(ingredients.length);
  };

  const removeIngredient = (index: number) => {
    Alert.alert("Remove Item", "Remove this ingredient?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const newIngredients = [...ingredients];
          newIngredients.splice(index, 1);
          setIngredients(newIngredients);
          if (editingIndex === index) setEditingIndex(null);
        },
      },
    ]);
  };

  const handleAddToPantry = async () => {
    const cleaned = ingredients
      .map((i) => ({ ...i, name: i.name.trim() }))
      .filter((i) => i.name.length > 0);

    if (cleaned.length === 0) {
      Alert.alert("No items", "Please add at least one item.");
      return;
    }

    const isShoppingList = destination === "shopping_list";

    setIsSaving(true);
    try {
      // 1. Fetch Spoonacular info (images/ids) first
      const ingredientsToParse = cleaned.map(
        (i) => `${i.parsedAmount} ${i.parsedUnit} ${i.name}`
      );

      let parsedResults: any[] = [];
      try {
        const { parseIngredients } = await import("@/lib/spoonacular");
        parsedResults = await parseIngredients(ingredientsToParse);
      } catch (err) {
        console.warn("Failed to fetch spoonacular images:", err);
        // Continue without images if API fails
      }

      // 2. Categorize based on names
      const ingredientNames = cleaned.map((i) => i.name);
      const categorizeRes = await fetch(generateAPIUrl("/api/categorize"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredientNames }),
      });

      if (!categorizeRes.ok) throw new Error("Failed to categorize items");

      const { items: categorizedItems } = await categorizeRes.json();
      const categoryMap = new Map(
        categorizedItems.map((i: any) => [i.name, i.category])
      );

      // Fetch existing items to merge amounts
      const existingItems = await pantryService.getItems(
        isShoppingList ? "shopping_list" : "pantry"
      );

      const itemsToInsert: Omit<
        import("@/features/pantry/types").PantryItem,
        "id" | "user_id" | "created_at" | "updated_at"
      >[] = [];

      const itemsToUpdate: { id: string; amount: number }[] = [];

      cleaned.forEach((item, index) => {
        const name = item.name;
        const category = (categoryMap.get(name) as PantryCategory) || "Other";

        // Find corresponding parsed result if available
        const parsedData = parsedResults[index];
        const spoonacularId = parsedData?.id;
        const spoonacularImage = parsedData?.image;
        const spoonacularName = parsedData?.name || name;

        const existingItem = existingItems.find(
          (existing) =>
            existing.name.toLowerCase() === name.toLowerCase() &&
            existing.unit.toLowerCase() === item.parsedUnit.toLowerCase()
        );

        if (existingItem) {
          itemsToUpdate.push({
            id: existingItem.id,
            amount: existingItem.amount + item.parsedAmount,
          });
        } else {
          itemsToInsert.push({
            name,
            amount: item.parsedAmount,
            unit: item.parsedUnit,
            is_weight: item.isWeight,
            spoonacular_id: spoonacularId,
            spoonacular_name: spoonacularName,
            spoonacular_image: spoonacularImage,
            category,
            status: isShoppingList ? "shopping_list" : "pantry",
            checked: false,
          });
        }
      });

      if (itemsToUpdate.length > 0) {
        await Promise.all(
          itemsToUpdate.map((u) =>
            pantryService.updateItem(u.id, { amount: u.amount })
          )
        );
      }

      if (itemsToInsert.length > 0) {
        await pantryService.addItems(itemsToInsert);
      }

      if (isShoppingList) {
        router.replace({
          pathname: "/shopping-list",
          params: { refresh: Date.now().toString() },
        });
      } else {
        router.replace({
          pathname: "/(app)/pantry",
          params: { refresh: Date.now().toString() },
        });
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save items. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: top, backgroundColor: themeColors.background.primary },
      ]}
    >
      <View
        style={[styles.header, { borderBottomColor: themeColors.border.light }]}
      >
        <Pressable
          style={[
            styles.iconButton,
            {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#f3f4f6",
            },
          ]}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={themeColors.text.primary}
          />
        </Pressable>
        <Text style={[styles.title, { color: themeColors.text.primary }]}>
          Add Ingredients Manually
        </Text>
        <View style={{ width: 42 }} />
      </View>

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={100}
        keyboardShouldPersistTaps="handled"
      >
        {ingredients.length === 0 ? (
          <View style={styles.empty}>
            <Text
              style={[styles.emptyText, { color: themeColors.text.secondary }]}
            >
              No ingredients. Add one below.
            </Text>
          </View>
        ) : (
          ingredients.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.row,
                {
                  backgroundColor: themeColors.background.surface,
                  borderColor: themeColors.border.light,
                },
              ]}
            >
              <View style={styles.rowContent}>
                <View style={styles.nameContainer}>
                  <View style={styles.editNameRow}>
                    <TextInput
                      style={[
                        styles.nameInput,
                        {
                          color: themeColors.text.primary,
                          borderBottomColor: themeColors.accent.lilac,
                        },
                      ]}
                      placeholder="Ingredient name"
                      placeholderTextColor={themeColors.text.tertiary}
                      value={item.name}
                      onChangeText={(text) => handleNameChange(index, text)}
                      onFocus={() => setEditingIndex(index)}
                      onBlur={() => setEditingIndex(null)}
                    />
                    <Pressable
                      style={styles.deleteButton}
                      onPress={() => removeIngredient(index)}
                      accessibilityLabel="Delete ingredient"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color={
                          isDark ? themeColors.semantic.error.main : "#ef4444"
                        }
                      />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.quantityControls}>
                  {item.isWeight ? (
                    <View
                      style={[
                        styles.weightInputWrapper,
                        {
                          backgroundColor: isDark
                            ? themeColors.background.tertiary
                            : "#f9fafb",
                          borderColor: themeColors.border.light,
                        },
                      ]}
                    >
                      <TextInput
                        style={[
                          styles.amountInput,
                          {
                            backgroundColor: isDark
                              ? themeColors.background.surface
                              : Colors.background.surface,
                            borderColor: themeColors.border.light,
                            color: themeColors.text.primary,
                          },
                        ]}
                        value={
                          amountInputs[index] ??
                          Number(item.parsedAmount).toFixed(2)
                        }
                        keyboardType="numeric"
                        onChangeText={(text) =>
                          handleAmountChange(index, text, false)
                        }
                        onBlur={() =>
                          setAmountInputs((prev) => {
                            const next = [...prev];
                            next[index] = Number(
                              ingredients[index].parsedAmount
                            ).toFixed(2);
                            return next;
                          })
                        }
                        returnKeyType="done"
                      />
                      <Text
                        style={[
                          styles.unitStaticText,
                          { color: themeColors.text.secondary },
                        ]}
                      >
                        {item.parsedUnit}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.pieceControls,
                        {
                          backgroundColor: isDark
                            ? themeColors.background.tertiary
                            : "#f9fafb",
                          borderColor: themeColors.border.light,
                        },
                      ]}
                    >
                      <Pressable
                        onPress={() => handleDecrement(index)}
                        style={[
                          styles.pieceBtn,
                          {
                            backgroundColor: isDark
                              ? themeColors.background.surface
                              : "#f3f4f6",
                            borderColor: themeColors.border.light,
                          },
                        ]}
                        hitSlop={8}
                      >
                        <Ionicons
                          name="remove"
                          size={16}
                          color={themeColors.text.secondary}
                        />
                      </Pressable>
                      <TextInput
                        style={[
                          styles.amountInput,
                          {
                            backgroundColor: isDark
                              ? themeColors.background.surface
                              : Colors.background.surface,
                            borderColor: themeColors.border.light,
                            color: themeColors.text.primary,
                          },
                        ]}
                        value={
                          amountInputs[index] ??
                          String(Math.round(item.parsedAmount))
                        }
                        keyboardType="numeric"
                        onChangeText={(text) =>
                          handleAmountChange(index, text, true)
                        }
                        onBlur={() =>
                          setAmountInputs((prev) => {
                            const next = [...prev];
                            next[index] = String(
                              Math.round(ingredients[index].parsedAmount)
                            );
                            return next;
                          })
                        }
                        returnKeyType="done"
                      />
                      <Pressable
                        onPress={() => handleIncrement(index)}
                        style={[
                          styles.pieceBtn,
                          {
                            backgroundColor: isDark
                              ? themeColors.background.surface
                              : "#f3f4f6",
                            borderColor: themeColors.border.light,
                          },
                        ]}
                        hitSlop={8}
                      >
                        <Ionicons
                          name="add"
                          size={16}
                          color={themeColors.text.secondary}
                        />
                      </Pressable>
                    </View>
                  )}
                  <View style={styles.unitChipsRow}>
                    {COMMON_UNITS.map((u) => {
                      const selected =
                        item.parsedUnit.toLowerCase() === u.value.toLowerCase();
                      return (
                        <Pressable
                          key={u.value}
                          onPress={() => quickSetUnit(index, u.value, u.weight)}
                          style={[
                            styles.unitChip,
                            {
                              backgroundColor: isDark
                                ? selected
                                  ? "rgba(120, 73, 182, 0.2)"
                                  : themeColors.background.tertiary
                                : selected
                                ? "#F2EEF8"
                                : "#f9fafb",
                              borderColor: isDark
                                ? selected
                                  ? themeColors.accent.lilac
                                  : themeColors.border.light
                                : selected
                                ? "#7849B6"
                                : "#e5e7eb",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.unitChipText,
                              {
                                color: selected
                                  ? isDark
                                    ? themeColors.accent.lilac
                                    : "#7849B6"
                                  : themeColors.text.secondary,
                                fontWeight: selected ? "600" : "400",
                              },
                            ]}
                          >
                            {u.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>
          ))
        )}

        <Pressable
          style={[
            styles.addButton,
            {
              backgroundColor: isDark
                ? themeColors.background.surface
                : "#f9fafb",
              borderColor: themeColors.border.light,
            },
          ]}
          onPress={addNewIngredient}
        >
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={isDark ? themeColors.accent.lilac : "#7849B6"}
          />
          <Text
            style={[
              styles.addButtonText,
              { color: isDark ? themeColors.accent.lilac : "#7849B6" },
            ]}
          >
            Add ingredient
          </Text>
        </Pressable>
      </KeyboardAwareScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: bottom + 12,
            backgroundColor: themeColors.background.surface,
            borderTopColor: themeColors.border.light,
          },
        ]}
      >
        <Pressable
          style={[
            styles.primaryButton,
            { backgroundColor: isDark ? themeColors.accent.lilac : "#7849B6" },
            isSaving && { opacity: 0.7 },
          ]}
          onPress={handleAddToPantry}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>
                {destination === "shopping_list"
                  ? "Save to Shopping List"
                  : "Save to Pantry"}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.primary },
  scrollView: { flex: 1 },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  title: { color: "#111", fontSize: 16, fontWeight: "600" },
  empty: { padding: 40, alignItems: "center", justifyContent: "center" },
  emptyText: { color: "#6b7280" },
  listContent: { padding: 16, gap: 12, paddingBottom: 120 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  deleteButton: { padding: 4 },
  rowContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    gap: 10,
  },
  nameContainer: { flex: 1, gap: 2, marginRight: 4 },
  editNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  nameInput: {
    flex: 1,
    fontSize: 18,
    color: "#111",
    borderBottomWidth: 2,
    borderBottomColor: "#7849B6",
    paddingVertical: 2,
  },
  quantityControls: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  unitChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
    justifyContent: "flex-start",
    maxWidth: "100%",
  },
  unitChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    flexShrink: 0,
    marginBottom: 6,
  },
  unitChipSelected: {
    borderColor: "#7849B6",
    backgroundColor: "#F2EEF8",
  },
  unitChipText: { fontSize: 12, color: "#52465F" },
  unitChipTextSelected: { color: "#7849B6", fontWeight: "600" },
  weightInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  weightInput: {
    minWidth: 40,
    fontSize: 14,
    textAlign: "right",
    padding: 0,
    color: "#111",
    fontWeight: "600",
  },
  unitTextInput: {
    marginLeft: 6,
    minWidth: 40,
    fontSize: 12,
    color: "#6b7280",
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  unitStaticText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#6b7280",
  },
  pieceControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  pieceBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f3f4f6",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#e5e7eb",
  },
  pieceText: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    minWidth: 24,
    textAlign: "center",
  },
  unitInlineInput: {
    marginLeft: 6,
    minWidth: 40,
    fontSize: 12,
    color: "#6b7280",
    paddingVertical: 0,
  },
  amountInput: {
    minWidth: 60,
    height: 40,
    fontSize: 16,
    lineHeight: 20,
    textAlign: "center",
    textAlignVertical: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    color: "#111",
    fontWeight: "600",
    backgroundColor: Colors.background.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderStyle: "dashed",
  },
  addButtonText: { fontSize: 16, fontWeight: "500", color: "#7849B6" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.surface,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingHorizontal: 16,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  primaryButton: {
    backgroundColor: "#7849B6",
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
