import { pantryService } from "@/features/pantry/services/pantry-service";
import { PantryCategory } from "@/features/pantry/types";
import { generateAPIUrl } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
interface EditableIngredient {
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
  const { top, bottom } = useSafeAreaInsets();

  const [ingredients, setIngredients] = useState<EditableIngredient[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [amountInputs, setAmountInputs] = useState<string[]>([]);

  // Start with one empty row for convenience
  useEffect(() => {
    if (ingredients.length === 0) {
      setIngredients([
        {
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

    setIsSaving(true);
    try {
      // Categorize based on names
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

      // Fetch existing pantry to merge amounts
      const existingItems = await pantryService.getItems("pantry");

      const itemsToInsert: Omit<
        import("@/features/pantry/types").PantryItem,
        "id" | "user_id" | "created_at" | "updated_at"
      >[] = [];

      const itemsToUpdate: { id: string; amount: number }[] = [];

      cleaned.forEach((item) => {
        const name = item.name;
        const category = (categoryMap.get(name) as PantryCategory) || "Other";

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
            spoonacular_id: undefined,
            spoonacular_name: undefined,
            spoonacular_image: undefined,
            category,
            status: "pantry" as const,
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

      router.push({
        pathname: "/(app)/pantry",
        params: { refresh: Date.now().toString() },
      });
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save items. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.safeArea, { paddingTop: top }]}>
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color="#111" />
          </Pressable>
          <Text style={styles.title}>Add Ingredients Manually</Text>
          <View style={{ width: 42 }} />
        </View>

        <FlatList
          data={ingredients}
          keyExtractor={(it, idx) => `${it.name}-${idx}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No ingredients. Add one below.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            // const isEditing = editingIndex === index;
            return (
              <View style={styles.row}>
                <View style={styles.rowContent}>
                  <View style={styles.nameContainer}>
                    <View style={styles.editNameRow}>
                      <TextInput
                        style={styles.nameInput}
                        placeholder="Ingredient name"
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
                          color="#ef4444"
                        />
                      </Pressable>
                    </View>
                  </View>

                  <View style={styles.quantityControls}>
                    {item.isWeight ? (
                      <View style={styles.weightInputWrapper}>
                        <TextInput
                          style={styles.amountInput}
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
                        <Text style={styles.unitStaticText}>
                          {item.parsedUnit}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.pieceControls}>
                        <Pressable
                          onPress={() => handleDecrement(index)}
                          style={styles.pieceBtn}
                          hitSlop={8}
                        >
                          <Ionicons name="remove" size={16} color="#4b5563" />
                        </Pressable>
                        <TextInput
                          style={styles.amountInput}
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
                          style={styles.pieceBtn}
                          hitSlop={8}
                        >
                          <Ionicons name="add" size={16} color="#4b5563" />
                        </Pressable>
                        {/* Inline unit input removed to avoid accidental unit changes; use chips below */}
                      </View>
                    )}
                    <View style={styles.unitChipsRow}>
                      {COMMON_UNITS.map((u) => {
                        const selected =
                          item.parsedUnit.toLowerCase() ===
                          u.value.toLowerCase();
                        return (
                          <Pressable
                            key={u.value}
                            onPress={() =>
                              quickSetUnit(index, u.value, u.weight)
                            }
                            style={[
                              styles.unitChip,
                              selected && styles.unitChipSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.unitChipText,
                                selected && styles.unitChipTextSelected,
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
            );
          }}
          ListFooterComponent={
            <Pressable style={styles.addButton} onPress={addNewIngredient}>
              <Ionicons name="add-circle-outline" size={24} color="#7849B6" />
              <Text style={styles.addButtonText}>Add ingredient</Text>
            </Pressable>
          }
        />

        <View style={[styles.footer, { paddingBottom: bottom + 12 }]}>
          <Pressable
            style={[styles.primaryButton, isSaving && { opacity: 0.7 }]}
            onPress={handleAddToPantry}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.primaryButtonText}>Save to Pantry</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  safeArea: { flex: 1 },
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
    backgroundColor: "#fff",
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
    height: 36,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 8,
    color: "#111",
    fontWeight: "600",
    backgroundColor: "#fff",
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
    backgroundColor: "#fff",
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
