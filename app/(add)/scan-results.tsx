import { Colors } from "@/constants/theme";
import { pantryService } from "@/features/pantry/services/pantry-service";
import { PantryCategory } from "@/features/pantry/types";
import { generateAPIUrl } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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

// Custom Modal for Unit Selection to replace Alert.alert on Android
const UnitPickerModal = ({
  visible,
  onClose,
  onSelect,
  currentUnit,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (unit: string, isWeight: boolean) => void;
  currentUnit: string;
}) => {
  const options = [
    { label: "Kilogram (kg)", unit: "kg", isWeight: true },
    { label: "Gram (g)", unit: "g", isWeight: true },
    { label: "Liter (L)", unit: "L", isWeight: false },
    { label: "Milliliter (mL)", unit: "mL", isWeight: false },
    { label: "Piece (pcs)", unit: "piece", isWeight: false },
    { label: "Package (pkg)", unit: "pkg", isWeight: false },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Unit</Text>
                <TouchableOpacity onPress={onClose} hitSlop={10}>
                  <Ionicons name="close" size={24} color={Colors.gray[600]} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalOptions}>
                {options.map((opt) => (
                  <TouchableOpacity
                    key={opt.unit}
                    style={[
                      styles.modalOption,
                      currentUnit.toLowerCase() === opt.unit.toLowerCase() &&
                        styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      onSelect(opt.unit, opt.isWeight);
                      onClose();
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        currentUnit.toLowerCase() === opt.unit.toLowerCase() &&
                          styles.modalOptionTextSelected,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {currentUnit.toLowerCase() === opt.unit.toLowerCase() && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={Colors.lilac[600]}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

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

  // Unit picker state
  const [unitPickerVisible, setUnitPickerVisible] = useState(false);
  const [activePickerIndex, setActivePickerIndex] = useState<number | null>(
    null
  );

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

  const changeUnit = (index: number, nextUnit: string, isWeight: boolean) => {
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

  const formatUnit = (unit: string): string => {
    const u = (unit || "").toLowerCase();
    if (u === "liter" || u === "liters" || u === "l") return "L";
    if (u === "milliliter" || u === "milliliters" || u === "ml") return "mL";
    if (u === "gram" || u === "grams" || u === "g") return "g";
    if (u === "kilogram" || u === "kilograms" || u === "kg") return "kg";
    if (u === "piece" || u === "pieces" || u === "pcs") return "pcs";
    if (u === "package" || u === "pkg") return "pkg";
    return unit;
  };

  const handleUnitPress = (index: number) => {
    Keyboard.dismiss();
    setActivePickerIndex(index);
    setUnitPickerVisible(true);
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
        <StatusBar style="dark" />
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
                {/* Horizontal Layout: Image Left */}
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

                {/* Right Content */}
                <View style={styles.rowContent}>
                  <View style={styles.nameHeader}>
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

                  <View style={styles.quantityControlsWrapper}>
                    <View style={styles.amountControl}>
                      {!item.isWeight && (
                        <TouchableOpacity
                          onPress={() => handleDecrement(index)}
                          style={styles.quantityEditBtn}
                        >
                          <Ionicons
                            name="remove"
                            size={18}
                            color={Colors.gray[600]}
                          />
                        </TouchableOpacity>
                      )}
                      <TextInput
                        style={styles.quantityEditInput}
                        value={String(item.parsedAmount)}
                        onChangeText={(text) => handleWeightChange(index, text)}
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        selectTextOnFocus
                      />
                      {!item.isWeight && (
                        <TouchableOpacity
                          onPress={() => handleIncrement(index)}
                          style={styles.quantityEditBtn}
                        >
                          <Ionicons
                            name="add"
                            size={18}
                            color={Colors.gray[600]}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Unit Selector */}
                    <TouchableOpacity
                      onPress={() => handleUnitPress(index)}
                      style={styles.unitBadge}
                    >
                      <Text style={styles.unitBadgeText}>
                        {formatUnit(item.parsedUnit)}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={12}
                        color={Colors.lilac[900]}
                        style={{ marginLeft: 4 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Delete Button - kept absolute but adjusted */}
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => removeIngredient(index)}
                >
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </Pressable>
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

        {/* Render Unit Picker Modal */}
        <UnitPickerModal
          visible={unitPickerVisible}
          onClose={() => setUnitPickerVisible(false)}
          currentUnit={
            activePickerIndex !== null && ingredients[activePickerIndex]
              ? ingredients[activePickerIndex].parsedUnit
              : ""
          }
          onSelect={(unit, isWeight) => {
            if (activePickerIndex !== null) {
              changeUnit(activePickerIndex, unit, isWeight);
            }
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
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
    fontSize: 18,
    fontWeight: "bold",
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
    paddingBottom: 120,
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

  // Row Styles
  row: {
    flexDirection: "row", // Changed to row for compactness
    alignItems: "center",
    backgroundColor: Colors.background.surface,
    borderRadius: 16,
    padding: 12, // Reduced padding
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.lilac[100],
    position: "relative",
  },
  deleteButton: {
    marginLeft: 8,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: 50, // Smaller image
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 12,
  },
  ingredientImage: {
    width: 36,
    height: 36,
    resizeMode: "contain",
  },
  ingredientImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f0fdf4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rowContent: {
    flex: 1,
    gap: 4, // Tighter spacing
  },
  nameHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  displayNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
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
    fontWeight: "bold",
    color: "#111",
    borderBottomWidth: 1,
    borderBottomColor: Colors.lilac[500],
    paddingVertical: 0,
  },
  rowText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111",
    textTransform: "capitalize",
    flex: 1,
  },
  idText: {
    fontSize: 10,
    color: "#9ca3af",
    marginRight: 4,
  },
  quantityControlsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "flex-start",
  },
  amountControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    backgroundColor: Colors.background.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    height: 40,
    overflow: "hidden",
  },
  quantityEditBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityEditInput: {
    height: 40,
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
    minWidth: 40,
    paddingHorizontal: 4,
    backgroundColor: "#fff",
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#e5e7eb",
  },
  unitBadge: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unitBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.lilac[900],
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    borderRadius: 16,
    backgroundColor: "#fff",
    borderStyle: "dashed",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#7849B6",
  },
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
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#7849B6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end", // Bottom sheet style
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.gray[800],
  },
  modalOptions: {
    gap: 8,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  modalOptionSelected: {
    backgroundColor: Colors.lilac[100],
    borderColor: Colors.lilac[200],
  },
  modalOptionText: {
    fontSize: 16,
    color: Colors.gray[700],
    fontWeight: "500",
  },
  modalOptionTextSelected: {
    color: Colors.lilac[900],
    fontWeight: "600",
  },
});
