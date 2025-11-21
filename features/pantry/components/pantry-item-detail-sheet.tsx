import { Colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
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
  const snapPoints = useMemo(() => ["60%"], []);

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

  // Reset input value when item changes
  useEffect(() => {
    setInputValue("");
  }, [item?.id]);

  // Format amount for badge display (convert grams to kg)
  const formatBadgeAmount = (amount: number, unit: string): string => {
    const unitLower = unit.toLowerCase();
    if (unitLower === "g" || unitLower === "gram" || unitLower === "grams") {
      const kg = amount / 1000;
      return `${kg.toFixed(1)}kg`;
    }
    return String(Math.round(amount));
  };

  const handleQuantityChange = (delta: number) => {
    if (!item || !onUpdateItem) return;
    const newAmount = Math.max(0, item.amount + delta);
    onUpdateItem(item.id, { amount: newAmount });
  };

  const handleAmountInputChange = (text: string) => {
    // Allow only numbers and decimal point
    const cleanedText = text.replace(/[^0-9.]/g, "");
    setInputValue(cleanedText);
  };

  const handleAmountSubmit = () => {
    if (!item || !onUpdateItem || !inputValue) return;
    const newAmount = parseFloat(inputValue);
    if (!isNaN(newAmount) && newAmount >= 0) {
      onUpdateItem(item.id, { amount: newAmount });
      setInputValue("");
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      enablePanDownToClose
      backgroundStyle={{ borderRadius: 32 }}
      handleIndicatorStyle={{ backgroundColor: Colors.gray[300], width: 40 }}
    >
      <BottomSheetView
        style={[styles.container, { paddingBottom: insets.bottom + 16 }]}
      >
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
                <Text style={styles.title}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => (ref as any)?.current?.dismiss()}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color={Colors.gray[600]} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View
                  style={[styles.statusBadge, { backgroundColor: "#10B981" }]}
                >
                  <Text style={styles.statusText}>GOOD</Text>
                </View>
                <Text style={styles.statLabel}>STATUS</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statValue}>{daysOld}</Text>
                <Text style={styles.statLabel}>DAYS OLD</Text>
              </View>

              <View style={styles.statItem}>
                {item.is_weight ? (
                  // Weight-based items: show text input
                  <View style={styles.quantityInputContainer}>
                    <TextInput
                      style={styles.quantityInput}
                      value={inputValue || String(item.amount)}
                      onChangeText={handleAmountInputChange}
                      onBlur={handleAmountSubmit}
                      onSubmitEditing={handleAmountSubmit}
                      keyboardType="decimal-pad"
                      placeholder={String(item.amount)}
                      returnKeyType="done"
                    />
                    <Text style={styles.unitText}>{item.unit}</Text>
                  </View>
                ) : (
                  // Count-based items: show +/- buttons
                  <View style={styles.quantityControl}>
                    <TouchableOpacity
                      onPress={() => handleQuantityChange(-1)}
                      style={styles.quantityBtn}
                    >
                      <Ionicons
                        name="remove"
                        size={20}
                        color={Colors.lilac[900]}
                      />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>
                      {Math.round(item.amount)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleQuantityChange(1)}
                      style={styles.quantityBtn}
                    >
                      <Ionicons
                        name="add"
                        size={20}
                        color={Colors.lilac[900]}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                <Text style={styles.statLabel}>QUANTITY</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Added Date */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>
                Added on {formatAddedDate(item.created_at)}
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Frozen Toggle */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Frozen</Text>
              <Switch
                trackColor={{
                  false: Colors.gray[200],
                  true: Colors.lilac[900],
                }}
                thumbColor={"white"}
                // value={item.frozen} // Need to add frozen to type
                value={false}
                onValueChange={() => {}}
              />
            </View>

            <View style={styles.divider} />

            {/* Categories */}
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Categories</Text>
              <Text style={styles.categoryValue}>
                RECENTLY ADDED, {item.category.toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1 }} />

            {/* Footer Actions */}
            <View style={styles.footer}>
              <TouchableOpacity style={[styles.footerBtn, styles.detailsBtn]}>
                <Text style={styles.detailsBtnText}>Product Details</Text>
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
            {/* Empty state or loading state if needed, usually this won't be seen for long */}
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

PantryItemDetailSheet.displayName = "PantryItemDetailSheet";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12, // Added top padding to prevent badge cutoff
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
    backgroundColor: Colors.gray[600],
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.gray[800],
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statItem: {
    alignItems: "center",
    gap: 8,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.gray[500],
    fontWeight: "600",
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.gray[800],
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: Colors.lilac[900],
    borderRadius: 24,
    height: 40,
    padding: 4,
    minWidth: 100, // Ensure minimum width to prevent squashing
  },
  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0, // Prevent button from shrinking
  },
  quantityInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: Colors.lilac[900],
    borderRadius: 24,
    height: 40,
    paddingHorizontal: 16,
    minWidth: 100,
    gap: 8,
  },
  quantityInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.lilac[900],
    textAlign: "center",
    padding: 0,
  },
  unitText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray[600],
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 12,
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
  detailsBtn: {
    backgroundColor: Colors.lilac[900],
  },
  detailsBtnText: {
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
