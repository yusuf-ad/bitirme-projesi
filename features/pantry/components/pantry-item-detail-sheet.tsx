import { Colors } from "@/constants/theme";
import { searchIngredients } from "@/lib/spoonacular";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PantryItem } from "../types";

interface PantryItemDetailSheetProps {
  item: PantryItem | null;
  onClose: () => void;
  onUpdateItem?: (id: string, updates: Partial<PantryItem>) => void;
  onRemoveItem?: (id: string) => void;
}

export const PantryItemDetailSheet = forwardRef<
  BottomSheetModal,
  PantryItemDetailSheetProps
>(({ item, onClose, onUpdateItem, onRemoveItem }, ref) => {
  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  // Use local variables that are safe even if item is null, to prevent crashes during the split-second transition
  const daysOld = useMemo(() => {
    if (!item || !item.created_at) return 0;
    const created = new Date(item.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }, [item]);

  // Format created date for display
  const formatAddedDate = (dateString?: string): string => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const months = [
      "Jan.",
      "Feb.",
      "Mar.",
      "Apr.",
      "May",
      "Jun.",
      "Jul.",
      "Aug.",
      "Sep.",
      "Oct.",
      "Nov.",
      "Dec.",
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Add ordinal suffix (st, nd, rd, th)
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    return `${month} ${getOrdinal(day)}, ${year}`;
  };

  // Local state for text input (for weight-based items)
  const [inputValue, setInputValue] = useState("");
  // Loading state for update operation
  const [isUpdating, setIsUpdating] = useState(false);
  // State for name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  // State for quantity editing
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const quantityInputRef = useRef<TextInput>(null);

  // Reset input value when item changes
  useEffect(() => {
    setInputValue("");
    setIsEditingName(false);
    setEditedName("");
    setIsEditingQuantity(false);
  }, [item?.id]);

  // Handle name edit
  const handleStartEditName = () => {
    if (item) {
      setEditedName(item.name);
      setIsEditingName(true);
    }
  };

  const handleNameSubmit = () => {
    if (!item || !onUpdateItem || !editedName.trim()) {
      setIsEditingName(false);
      return;
    }
    const trimmedName = editedName.trim();
    if (trimmedName !== item.name) {
      onUpdateItem(item.id, { name: trimmedName });
    }
    setIsEditingName(false);
  };

  // Handle update from Spoonacular API
  const handleUpdateFromSpoonacular = async () => {
    if (!item || !onUpdateItem) return;

    setIsUpdating(true);
    try {
      // Search for the ingredient by current name
      const { ingredients } = await searchIngredients(item.name, 0, 1);

      if (ingredients.length === 0) {
        Alert.alert(
          "Not Found",
          "Could not find ingredient information. Please try a different name.",
          [{ text: "OK" }]
        );
        return;
      }

      const firstResult = ingredients[0];

      // Update the item with new data from Spoonacular
      onUpdateItem(item.id, {
        name: firstResult.name,
        spoonacular_id: firstResult.id,
        spoonacular_image: firstResult.image,
        spoonacular_name: firstResult.name,
      });

      Alert.alert("Updated", `Ingredient updated to "${firstResult.name}"`, [
        { text: "OK" },
      ]);
    } catch (error) {
      console.error("Failed to update from Spoonacular:", error);
      Alert.alert(
        "Update Failed",
        "Could not update ingredient. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Determine if we should show weight input based on is_weight OR unit
  const showAsWeight = useMemo(() => {
    if (!item) return false;
    const u = (item.unit || "").toLowerCase();
    return (
      item.is_weight || ["g", "gram", "kg", "ml", "l", "milliliter"].includes(u)
    );
  }, [item]);

  // Format amount for badge display (convert grams to kg, ml to l)
  const formatBadgeAmount = (amount: number, unit: string): string => {
    const unitLower = (unit || "").toLowerCase();
    if (unitLower === "g" || unitLower === "gram" || unitLower === "grams") {
      const kg = amount / 1000;
      return `${kg.toFixed(1)}kg`;
    }
    if (
      unitLower === "ml" ||
      unitLower === "milliliter" ||
      unitLower === "milliliters"
    ) {
      const l = amount / 1000;
      return `${l.toFixed(2)}l`;
    }
    return String(Math.round(amount));
  };

  const handleQuantityChange = (delta: number) => {
    if (!item || !onUpdateItem) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAmount = Math.max(0, item.amount + delta);
    // Update both the item and the input value so TextInput reflects the change
    setInputValue(String(newAmount));
    onUpdateItem(item.id, { amount: newAmount });
  };

  const handleAmountInputChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleanedText = text.replace(/[^0-9.]/g, "");
    setInputValue(cleanedText);
  };

  const handleAmountSubmit = () => {
    if (!item || !onUpdateItem) {
      setIsEditingQuantity(false);
      return;
    }
    const valueToSubmit = inputValue || String(item.amount);
    const newAmount = parseFloat(valueToSubmit);
    if (!isNaN(newAmount) && newAmount >= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onUpdateItem(item.id, { amount: newAmount });
    }
    setInputValue("");
    setIsEditingQuantity(false);
  };

  const handleStartEditQuantity = () => {
    if (item) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setInputValue(String(item.amount));
      setIsEditingQuantity(true);
      // Focus the input after a short delay to ensure it's rendered
      setTimeout(() => {
        quantityInputRef.current?.focus();
      }, 100);
    }
  };

  const handleUnitCycle = () => {
    if (!item || !onUpdateItem) return;

    const u = (item.unit || "").toLowerCase();
    let newUnit = "pcs";
    let newIsWeight = false;

    // Cycle: pcs -> g -> ml -> pcs
    if (u === "g" || u === "gram" || u === "kg") {
      newUnit = "ml";
      newIsWeight = true;
    } else if (u === "ml" || u === "l" || u === "milliliter") {
      newUnit = "pcs";
      newIsWeight = false;
    } else {
      newUnit = "g";
      newIsWeight = true;
    }

    onUpdateItem(item.id, { unit: newUnit, is_weight: newIsWeight });
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      enablePanDownToClose
      backgroundStyle={{ borderRadius: 32 }}
      handleIndicatorStyle={{ backgroundColor: Colors.gray[300], width: 40 }}
    >
      <BottomSheetScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 16 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.contentWrapper}>
            {item ? (
              <>
                {/* Header / Title */}
                <View style={styles.header}>
                  <View style={styles.imageContainer}>
                    <Image
                      source={{
                        uri: `https://spoonacular.com/cdn/ingredients_250x250/${item.spoonacular_image}`,
                      }}
                      style={styles.image}
                      contentFit="contain"
                      transition={200}
                    />
                    <View style={styles.imageBadge}>
                      <Text style={styles.imageBadgeText}>
                        {formatBadgeAmount(item.amount, item.unit)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.titleContainer}>
                    {isEditingName ? (
                      <TextInput
                        style={styles.titleInput}
                        value={editedName}
                        onChangeText={setEditedName}
                        onBlur={handleNameSubmit}
                        onSubmitEditing={handleNameSubmit}
                        autoFocus
                        returnKeyType="done"
                        selectTextOnFocus
                      />
                    ) : (
                      <TouchableOpacity
                        style={styles.titleTouchable}
                        onPress={handleStartEditName}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.title}>{item.name}</Text>
                        <Ionicons
                          name="pencil"
                          size={16}
                          color={Colors.gray[400]}
                          style={styles.titleEditIcon}
                        />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => (ref as any)?.current?.dismiss()}
                      style={styles.closeButton}
                    >
                      <Ionicons
                        name="close"
                        size={24}
                        color={Colors.gray[600]}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Quantity Section - Prominent and Easy to Find */}
                <Pressable
                  style={({ pressed }) => [
                    styles.quantitySection,
                    pressed && styles.quantitySectionPressed,
                  ]}
                  onPress={handleStartEditQuantity}
                  accessibilityLabel="Edit quantity"
                  accessibilityHint="Tap to change the quantity of this item"
                >
                  <View style={styles.quantitySectionLeft}>
                    <Text style={styles.quantitySectionLabel}>Quantity</Text>
                    <Text style={styles.quantitySectionHint}>Tap to edit</Text>
                  </View>

                  {isEditingQuantity ? (
                    // Editing mode: show input with controls
                    <View style={styles.quantityEditContainer}>
                      {!showAsWeight && (
                        <TouchableOpacity
                          onPress={() => handleQuantityChange(-1)}
                          style={styles.quantityEditBtn}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name="remove"
                            size={20}
                            color={Colors.lilac[900]}
                          />
                        </TouchableOpacity>
                      )}
                      <TextInput
                        ref={quantityInputRef}
                        style={styles.quantityEditInput}
                        value={inputValue}
                        onChangeText={handleAmountInputChange}
                        onBlur={handleAmountSubmit}
                        onSubmitEditing={handleAmountSubmit}
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        selectTextOnFocus
                      />
                      <TouchableOpacity
                        onPress={handleUnitCycle}
                        style={styles.unitBadge}
                      >
                        <Text style={styles.unitBadgeText}>{item.unit}</Text>
                      </TouchableOpacity>
                      {!showAsWeight && (
                        <TouchableOpacity
                          onPress={() => handleQuantityChange(1)}
                          style={styles.quantityEditBtn}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                          <Ionicons
                            name="add"
                            size={20}
                            color={Colors.lilac[900]}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    // Display mode: show value with edit icon
                    <View style={styles.quantityDisplayContainer}>
                      <View style={styles.quantityValueContainer}>
                        <Text style={styles.quantityDisplayValue}>
                          {showAsWeight ? item.amount : Math.round(item.amount)}
                        </Text>
                        <Text style={styles.quantityDisplayUnit}>
                          {item.unit}
                        </Text>
                      </View>
                      <View style={styles.quantityEditIcon}>
                        <Ionicons
                          name="pencil"
                          size={16}
                          color={Colors.lilac[900]}
                        />
                      </View>
                    </View>
                  )}
                </Pressable>

                <View style={styles.divider} />

                {/* Days Old Row */}
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Days in pantry</Text>
                  <Text style={styles.rowValue}>{daysOld} days</Text>
                </View>

                <View style={styles.divider} />

                {/* Added Date */}
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Added on</Text>
                  <Text style={styles.rowValue}>
                    {formatAddedDate(item.created_at)}
                  </Text>
                </View>

                <View style={styles.divider} />

                {/* Categories */}
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Categories</Text>
                  <Text style={styles.categoryValue}>
                    {item.category.toUpperCase()}
                  </Text>
                </View>

                <View style={{ flex: 1 }} />

                {/* Footer Actions */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    style={[
                      styles.footerBtn,
                      styles.updateBtn,
                      isUpdating && styles.updateBtnDisabled,
                    ]}
                    onPress={handleUpdateFromSpoonacular}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="refresh" size={20} color="white" />
                        <Text style={styles.updateBtnText}>Update</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.footerBtn, styles.removeBtn]}
                    onPress={() => {
                      onRemoveItem?.(item.id);
                      (ref as any)?.current?.dismiss();
                    }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View
                style={{
                  height: 300,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Empty state or loading state if needed */}
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

PantryItemDetailSheet.displayName = "PantryItemDetailSheet";

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 12, // Added top padding to prevent badge cutoff
  },
  contentWrapper: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    marginTop: 12, // Added margin top for extra safety for the badge
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: 80,
    height: 100,
    borderRadius: 8,
  },
  imageBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: Colors.lilac[900],
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
    zIndex: 10, // Ensure badge is above image
    minWidth: 32, // Ensure minimum width for text like "0.1kg"
  },
  imageBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginLeft: 24,
    paddingTop: 12,
  },
  titleTouchable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.gray[800],
    textTransform: "capitalize",
    flexShrink: 1,
  },
  titleEditIcon: {
    marginTop: 2,
  },
  titleInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.gray[800],
    borderBottomWidth: 2,
    borderBottomColor: Colors.lilac[900],
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  closeButton: {
    padding: 4,
  },
  // Quantity Section Styles
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.lilac[100],
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.lilac[200],
    minHeight: 72,
  },
  quantitySectionPressed: {
    backgroundColor: Colors.lilac[100],
    borderColor: Colors.lilac[400],
  },
  quantitySectionLeft: {
    gap: 4,
  },
  quantitySectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[800],
  },
  quantitySectionHint: {
    fontSize: 12,
    color: Colors.gray[400],
  },
  quantityDisplayContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  quantityValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  quantityDisplayValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.lilac[900],
  },
  quantityDisplayUnit: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.gray[500],
  },
  quantityEditIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lilac[100],
    justifyContent: "center",
    alignItems: "center",
  },
  quantityEditContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: Colors.lilac[900],
  },
  quantityEditBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lilac[100],
    justifyContent: "center",
    alignItems: "center",
  },
  quantityEditInput: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.lilac[900],
    textAlign: "center",
    minWidth: 60,
    padding: 4,
  },
  unitBadge: {
    backgroundColor: Colors.lilac[100],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unitBadgeText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.lilac[900],
  },
  divider: {
    height: 1,
    backgroundColor: Colors.gray[200],
    marginVertical: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 16,
    color: Colors.gray[800],
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 16,
    color: Colors.gray[600],
    fontWeight: "500",
  },
  actionLink: {
    color: Colors.lilac[900],
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.5,
  },
  categoryValue: {
    color: Colors.lilac[900],
    fontWeight: "600",
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  footer: {
    paddingTop: 32,
    flexDirection: "row",
    gap: 16,
  },
  footerBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  updateBtn: {
    backgroundColor: Colors.lilac[900],
  },
  updateBtnDisabled: {
    opacity: 0.6,
  },
  updateBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  removeBtn: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  removeBtnText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 16,
  },
});
