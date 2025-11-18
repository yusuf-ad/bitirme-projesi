import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
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
  }>();
  const { top, bottom } = useSafeAreaInsets();

  const INGREDIENT_IMAGE_BASE_URL =
    "https://spoonacular.com/cdn/ingredients_100x100";

  const [ingredients, setIngredients] = useState<EditableIngredient[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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

  const handleAddToPantry = () => {
    // TODO: Implement add to pantry logic
    console.log("Adding to pantry:", ingredients);
    router.push("/(app)/pantry");
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
                          {item.parsedAmount}
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
                  </View>
                </View>
              </View>
            );
          }}
          ListFooterComponent={
            <Pressable style={styles.addButton} onPress={addNewIngredient}>
              <Ionicons name="add-circle-outline" size={24} color="#16a34a" />
              <Text style={styles.addButtonText}>Add new ingredient</Text>
            </Pressable>
          }
        />

        <View style={[styles.footer, { paddingBottom: bottom + 12 }]}>
          <Pressable style={styles.primaryButton} onPress={handleAddToPantry}>
            <Text style={styles.primaryButtonText}>Add to Pantry</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
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
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: "#f3f4f6",
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
    color: "#16a34a",
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
    backgroundColor: "#16a34a",
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
