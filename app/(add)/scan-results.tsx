import { pantryService } from "@/features/pantry/services/pantry-service";
import { PantryCategory } from "@/features/pantry/types";
import { generateAPIUrl } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScannedIngredient {
  name: string;
  quantity: string;
  spoonacularId?: number;
  spoonacularName?: string;
  spoonacularImage?: string;
}

interface EditableIngredient extends ScannedIngredient {
  parsedAmount: number;
  parsedUnit: string;
  isWeight: boolean;
}

export default function ScanResults() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    items?: string;
    durationMs?: string;
    llmMs?: string;
    destination?: string;
  }>();
  const destination = params.destination || "pantry";
  const { top, bottom } = useSafeAreaInsets();

  const INGREDIENT_IMAGE_BASE_URL =
    "https://spoonacular.com/cdn/ingredients_100x100";

  const [ingredients, setIngredients] = useState<EditableIngredient[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (params.items) {
      try {
        const parsedItems = JSON.parse(params.items);
        if (Array.isArray(parsedItems)) {
          const mapped = parsedItems.map((item: ScannedIngredient) => {
            // Simple regex to separate number and text
            const match = item.quantity.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
            let amount = 1;
            let unit = "";

            if (match) {
              amount = parseFloat(match[1]);
              unit = match[2].trim();
            } else {
              unit = "piece";
            }

            // Detect if weight/volume or pieces
            const weightUnits = [
              "g",
              "kg",
              "ml",
              "l",
              "oz",
              "lb",
              "mg",
              "gram",
              "grams",
              "kilogram",
              "kilograms",
            ];
            const isWeightUnit =
              weightUnits.includes(unit.toLowerCase()) || unit === "";

            return {
              ...item,
              parsedAmount: amount,
              parsedUnit: unit,
              isWeight: isWeightUnit,
            };
          });
          setIngredients(mapped);
        }
      } catch (e) {
        console.error("Failed to parse items", e);
      }
    }
  }, [params.items]);

  const secondsText = useMemo(() => {
    const ms = Number(params.durationMs ?? params.llmMs ?? 0);
    if (!ms || Number.isNaN(ms)) return null;
    const secs = (ms / 1000).toFixed(1);
    return `${secs}s`;
  }, [params.durationMs, params.llmMs]);

  const updateAmount = (index: number, newAmount: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index].parsedAmount = newAmount;
    newIngredients[
      index
    ].quantity = `${newAmount} ${newIngredients[index].parsedUnit}`;
    setIngredients(newIngredients);
  };

  const handleIncrement = (index: number) => {
    const current = ingredients[index].parsedAmount;
    updateAmount(index, current + 1);
  };

  const handleDecrement = (index: number) => {
    const current = ingredients[index].parsedAmount;
    if (current > 0) {
      updateAmount(index, current - 1);
    }
  };

  const handleWeightChange = (index: number, text: string) => {
    const val = parseFloat(text);
    if (!isNaN(val)) {
      updateAmount(index, val);
    }
  };

  const handleNameChange = (index: number, text: string) => {
    const newIngredients = [...ingredients];
    // Update the display name logic
    if (newIngredients[index].spoonacularName) {
      newIngredients[index].spoonacularName = text;
    } else {
      newIngredients[index].name = text;
    }
    setIngredients(newIngredients);
  };

  const addNewIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        name: "New Item",
        quantity: "1 piece",
        parsedAmount: 1,
        parsedUnit: "piece",
        isWeight: false,
      },
    ]);
    // Automatically start editing the new item
    setEditingIndex(ingredients.length);
  };

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

    // Handle simple conversions
    let newAmount = amount;
    const nu = nextUnit.toLowerCase();
    if (prevUnit === "g" && nu === "kg") newAmount = amount / 1000;
    else if (prevUnit === "kg" && nu === "g") newAmount = amount * 1000;
    else if (prevUnit === "ml" && nu === "l") newAmount = amount / 1000;
    else if (prevUnit === "l" && nu === "ml") newAmount = amount * 1000;

    updated[index].parsedAmount = newAmount;
    updated[index].parsedUnit = nextUnit;
    updated[index].isWeight = isWeight;
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this ingredient?",
      [
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
      ]
    );
  };

  const handleAddToPantry = async () => {
    if (ingredients.length === 0) {
      Alert.alert("No items", "Please add at least one item to save.");
      return;
    }

    const isShoppingList = destination === "shopping_list";

    setIsSaving(true);
    try {
      // 1. Categorize items
      const ingredientNames = ingredients.map(
        (i) => i.spoonacularName || i.name
      );
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

      // 2. Fetch existing items to check for duplicates
      const existingItems = await pantryService.getItems(
        isShoppingList ? "shopping_list" : "pantry"
      );

      const itemsToInsert: Omit<
        import("@/features/pantry/types").PantryItem,
        "id" | "user_id" | "created_at" | "updated_at"
      >[] = [];

      const itemsToUpdate: {
        id: string;
        amount: number;
      }[] = [];

      // 3. Prepare items for DB
      ingredients.forEach((item) => {
        const name = item.spoonacularName || item.name;
        const category = (categoryMap.get(name) as PantryCategory) || "Other";

        // Check if item already exists (same name and similar unit)
        // We do a simple case-insensitive check on name and unit
        const existingItem = existingItems.find(
          (existing) =>
            existing.name.toLowerCase() === name.toLowerCase() &&
            existing.unit.toLowerCase() === item.parsedUnit.toLowerCase()
        );

        if (existingItem) {
          // If exists, add to update list
          itemsToUpdate.push({
            id: existingItem.id,
            amount: existingItem.amount + item.parsedAmount,
          });
        } else {
          // If new, add to insert list
          itemsToInsert.push({
            name,
            amount: item.parsedAmount,
            unit: item.parsedUnit,
            is_weight: item.isWeight,
            spoonacular_id: item.spoonacularId,
            spoonacular_name: item.spoonacularName,
            spoonacular_image: item.spoonacularImage,
            category,
            status: isShoppingList ? "shopping_list" : "pantry",
            checked: false,
          });
        }
      });

      // 4. Save to Supabase
      // Perform updates
      console.log("Saving items...", {
        toUpdate: itemsToUpdate.length,
        toInsert: itemsToInsert.length,
        destination,
      });

      if (itemsToUpdate.length > 0) {
        await Promise.all(
          itemsToUpdate.map((update) =>
            pantryService.updateItem(update.id, { amount: update.amount })
          )
        );
      }

      // Perform inserts
      if (itemsToInsert.length > 0) {
        const inserted = await pantryService.addItems(itemsToInsert);
        console.log("Inserted items:", inserted);
      }

      if (isShoppingList) {
        router.push({
          pathname: "/shopping-list",
          params: { refresh: Date.now().toString() },
        });
      } else {
        router.push({
          pathname: "/(app)/pantry",
          params: { refresh: Date.now().toString() },
        });
      }
    } catch (error) {
      console.error("Error saving items:", error);
      Alert.alert("Error", "Failed to save items to pantry. Please try again.");
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
          <Text style={styles.title}>Detected Ingredients</Text>
          <View style={{ width: 42 }} />
        </View>

        {secondsText && (
          <View style={styles.metaBar}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.metaText}>Scan time: {secondsText}</Text>
          </View>
        )}

        <FlatList
          data={ingredients}
          showsVerticalScrollIndicator={false}
          keyExtractor={(it, idx) => `${it.name}-${idx}`}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No ingredients found</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const displayName = item.spoonacularName || item.name;
            const isEditing = editingIndex === index;

            return (
              <View style={styles.row}>
                {/* Delete Button */}
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => removeIngredient(index)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </Pressable>

                {item.spoonacularImage ? (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri: `${INGREDIENT_IMAGE_BASE_URL}/${item.spoonacularImage}`,
                      }}
                      style={styles.ingredientImage}
                    />
                  </View>
                ) : (
                  <View style={styles.ingredientImagePlaceholder}>
                    <Ionicons name="leaf-outline" size={20} color="#16a34a" />
                  </View>
                )}

                <View style={styles.rowContent}>
                  <View style={styles.nameContainer}>
                    {isEditing ? (
                      <View style={styles.editNameRow}>
                        <TextInput
                          style={styles.nameInput}
                          value={displayName}
                          onChangeText={(text) => handleNameChange(index, text)}
                          autoFocus
                          onBlur={() => setEditingIndex(null)}
                        />
                        <Pressable onPress={() => setEditingIndex(null)}>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#16a34a"
                          />
                        </Pressable>
                      </View>
                    ) : (
                      <View style={styles.displayNameRow}>
                        <Text style={styles.rowText} numberOfLines={1}>
                          {displayName}
                        </Text>
                        <Pressable
                          onPress={() => setEditingIndex(index)}
                          hitSlop={8}
                        >
                          <Ionicons name="pencil" size={14} color="#9ca3af" />
                        </Pressable>
                      </View>
                    )}

                    {item.spoonacularId && !isEditing && (
                      <Text style={styles.idText}>
                        ID: {item.spoonacularId}
                      </Text>
                    )}
                  </View>

                  {/* Quantity Controls */}
                  <View style={styles.quantityControls}>
                    {item.isWeight ? (
                      <View style={styles.weightInputWrapper}>
                        <TextInput
                          style={styles.weightInput}
                          defaultValue={String(item.parsedAmount)}
                          keyboardType="numeric"
                          onChangeText={(text) =>
                            handleWeightChange(index, text)
                          }
                          returnKeyType="done"
                        />
                        <Text style={styles.unitText}>{item.parsedUnit}</Text>
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
                        <Text style={styles.pieceText}>
                          {item.parsedUnit.toLowerCase() === "piece"
                            ? Math.round(item.parsedAmount)
                            : Number(item.parsedAmount).toFixed(2)}
                        </Text>
                        <Pressable
                          onPress={() => handleIncrement(index)}
                          style={styles.pieceBtn}
                          hitSlop={8}
                        >
                          <Ionicons name="add" size={16} color="#4b5563" />
                        </Pressable>
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
              <Text style={styles.addButtonText}>Add new ingredient</Text>
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
                <Text style={styles.primaryButtonText}>
                  {destination === "shopping_list"
                    ? "Add to Shopping List"
                    : "Add to Pantry"}
                </Text>
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  safeArea: {
    flex: 1,
  },
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
  title: {
    color: "#111",
    fontSize: 16,
    fontWeight: "600",
  },
  empty: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#6b7280",
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 120, // Increased padding to account for footer
  },
  metaBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
  },
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
  deleteButton: {
    padding: 4,
  },
  imageContainer: {
    width: 48,
    height: 48,
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  ingredientImage: {
    width: 48,
    height: 48,
    resizeMode: "center",
  },
  ingredientImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  nameContainer: {
    flex: 1,
    gap: 2,
    marginRight: 4,
  },
  displayNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    color: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#16a34a",
    paddingVertical: 0,
  },
  rowText: {
    fontSize: 16,
    color: "#111",
    textTransform: "capitalize",
    fontWeight: "500",
    maxWidth: 120,
  },
  idText: {
    fontSize: 10,
    color: "#9ca3af",
  },
  quantityControls: {
    minWidth: 90,
    alignItems: "flex-end",
  },
  unitChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
    justifyContent: "flex-end",
  },
  unitChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
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
    minWidth: 30,
    fontSize: 14,
    textAlign: "right",
    padding: 0,
    color: "#111",
    fontWeight: "600",
  },
  unitText: {
    marginLeft: 4,
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
  addButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#7849B6",
  },
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
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
