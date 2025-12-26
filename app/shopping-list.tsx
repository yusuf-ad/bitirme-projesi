import { ProfessionalLoadingScreen } from "@/components/ProfessionalLoadingScreen";
import { Colors, getThemeColors } from "@/constants/theme";
import {
    PantryItem,
    PantryItemDetailSheet,
    ShoppingListItemsList,
} from "@/features/pantry";
import { pantryService } from "@/features/pantry/services/pantry-service";
import { useTheme } from "@/providers/theme-provider";
import {
    AttachMenuOverlay,
    AttachMenuProvider,
    useAttachMenu,
} from "@/shared/components/attach-menu";
import { Feather, Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/build/AntDesign";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ShoppingListFab() {
  const { toggleMenu, isOpen, setCurrentRoute } = useAttachMenu();

  useEffect(() => {
    setCurrentRoute("shopping-list");
  }, [setCurrentRoute]);

  const plusIconStyle = useAnimatedStyle(() => {
    const rotateValue = isOpen ? "45deg" : "0deg";
    return {
      transform: [{ rotate: withTiming(rotateValue, { duration: 300 }) }],
    };
  });

  return (
    <AnimatedPressable onPress={toggleMenu} style={styles.fab}>
      <Animated.View style={plusIconStyle}>
        <AntDesign name="plus" size={24} color="#FFFFFF" />
      </Animated.View>
    </AnimatedPressable>
  );
}

export default function ShoppingListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[700];

  const [items, setItems] = useState<PantryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMovingToPantry, setIsMovingToPantry] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [selectedItem, setSelectedItem] = useState<PantryItem | null>(null);

  const fetchItems = async () => {
    try {
      const data = await pantryService.getItems("shopping_list");
      setItems(data);
    } catch (error) {
      console.error("Failed to fetch items:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, [])
  );

  const { shoppingListItems, checkedItems, uncheckedItems } = useMemo(() => {
    const shopping = items.filter((i) => i.status === "shopping_list");
    return {
      shoppingListItems: shopping,
      checkedItems: shopping.filter((i) => i.checked),
      uncheckedItems: shopping.filter((i) => !i.checked),
    };
  }, [items]);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;
      const newChecked = !item.checked;
      // Fire update after state change
      setTimeout(() => {
        pantryService
          .updateItem(id, { checked: newChecked })
          .catch(console.error);
      }, 0);
      return prev.map((i) => (i.id === id ? { ...i, checked: newChecked } : i));
    });
  }, []);

  const handleBackPress = () => {
    router.back();
  };

  const handleSaveToPantry = async () => {
    if (checkedItems.length === 0) {
      Alert.alert("No Items", "Please mark items as purchased first.");
      return;
    }

    setIsMovingToPantry(true);
    try {
      const { movedCount } = await pantryService.moveCheckedItemsToPantry();
      setIsMovingToPantry(false);
      if (movedCount > 0) {
        Alert.alert(
          "Pantry Updated",
          `${movedCount} item${
            movedCount > 1 ? "s" : ""
          } added to your pantry.`,
          [{ text: "OK" }]
        );
        await fetchItems();
      }
    } catch (error) {
      console.error("Failed to move items:", error);
      setIsMovingToPantry(false);
      Alert.alert("Error", "Failed to save items to pantry. Please try again.");
    }
  };

  const handleEditItem = useCallback((id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id) || null;
      setSelectedItem(item);
      bottomSheetRef.current?.present();
      return prev;
    });
  }, []);

  const handleUpdateItem = async (id: string, updates: Partial<PantryItem>) => {
    try {
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem((prev) => (prev ? { ...prev, ...updates } : null));
      }
      await pantryService.updateItem(id, updates);
      await fetchItems();
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      bottomSheetRef.current?.dismiss();
      await pantryService.deleteItem(id);
      await fetchItems();
    } catch (error) {
      console.error("Failed to remove item:", error);
    }
  };

  const handleClearAll = () => {
    if (shoppingListItems.length === 0) return;

    Alert.alert(
      "Clear Shopping List",
      "Are you sure you want to delete all items from your shopping list?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await pantryService.clearShoppingListItems();
              await fetchItems();
            } catch (error) {
              console.error("Failed to clear shopping list:", error);
              Alert.alert(
                "Error",
                "Failed to clear shopping list. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const handleMarkAll = async () => {
    if (uncheckedItems.length === 0) return;

    // Optimistic update
    const previousItems = [...items];
    setItems((prev) =>
      prev.map((i) =>
        i.status === "shopping_list" ? { ...i, checked: true } : i
      )
    );

    try {
      await pantryService.markAllAsChecked();
    } catch (error) {
      console.error("Failed to mark all as checked", error);
      // Revert on error
      setItems(previousItems);
    }
  };

  const handleUnmarkAll = async () => {
    if (checkedItems.length === 0) return;

    // Optimistic update
    const previousItems = [...items];
    setItems((prev) =>
      prev.map((i) =>
        i.status === "shopping_list" ? { ...i, checked: false } : i
      )
    );

    try {
      await pantryService.unmarkAllChecked();
    } catch (error) {
      console.error("Failed to unmark all", error);
      // Revert on error
      setItems(previousItems);
    }
  };

  if (isMovingToPantry) {
    return (
      <ProfessionalLoadingScreen
        title="Updating Pantry"
        subtitle="Moving checked items to your pantry..."
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: themeColors.background.secondary,
        },
      ]}
    >
      {/* Header - pantry-items style */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={handleBackPress}
          hitSlop={12}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={themeColors.text.primary}
          />
        </Pressable>
        <Pressable
          style={styles.titlePressable}
          onPress={handleBackPress}
          hitSlop={8}
        >
          <Text
            style={[styles.headerTitle, { color: themeColors.text.primary }]}
          >
            Groceries
          </Text>
        </Pressable>
        <Text
          style={[styles.headerCount, { color: themeColors.text.tertiary }]}
        >
          {shoppingListItems.length}{" "}
          {shoppingListItems.length === 1 ? "item" : "items"}
        </Text>
      </View>

      {/* Summary bar - simplified */}
      {shoppingListItems.length > 0 && (
        <View
          style={[
            styles.summaryBar,
            { backgroundColor: themeColors.background.surface },
          ]}
        >
          <View style={styles.summaryContent}>
            <Text
              style={[styles.summaryText, { color: themeColors.text.primary }]}
            >
              {checkedItems.length} purchased • {uncheckedItems.length} to buy
            </Text>
            <View style={styles.summaryActions}>
              {/* Mark all / Unmark all button */}
              {uncheckedItems.length > 0 && (
                <Pressable hitSlop={8} onPress={handleMarkAll}>
                  <Text
                    style={[styles.actionButtonText, { color: accentColor }]}
                  >
                    Mark all
                  </Text>
                </Pressable>
              )}
              {checkedItems.length > 0 && (
                <Pressable hitSlop={8} onPress={handleUnmarkAll}>
                  <Text
                    style={[styles.actionButtonText, { color: accentColor }]}
                  >
                    Unmark all
                  </Text>
                </Pressable>
              )}
              <Pressable hitSlop={8} onPress={handleClearAll}>
                <Feather
                  name="trash-2"
                  size={18}
                  color={themeColors.text.secondary}
                />
              </Pressable>
            </View>
          </View>
          {/* Save to pantry button */}
          {checkedItems.length > 0 && (
            <Pressable
              style={[styles.saveButton, { backgroundColor: accentColor }]}
              onPress={handleSaveToPantry}
            >
              <Feather name="check-circle" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save to Pantry</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Content */}
      {isLoading && items.length === 0 ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text
            style={[styles.loadingText, { color: themeColors.text.tertiary }]}
          >
            Loading items...
          </Text>
        </View>
      ) : shoppingListItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather
            name="shopping-cart"
            size={48}
            color={themeColors.text.tertiary}
          />
          <Text
            style={[styles.emptyText, { color: themeColors.text.tertiary }]}
          >
            Your shopping list is empty
          </Text>
        </View>
      ) : (
        <ShoppingListItemsList
          checkedItems={checkedItems}
          uncheckedItems={uncheckedItems}
          onToggleItem={toggleItem}
          onEditItem={handleEditItem}
        />
      )}

      {/* Item Detail Sheet */}
      <PantryItemDetailSheet
        ref={bottomSheetRef}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onUpdateItem={handleUpdateItem}
        onRemoveItem={handleRemoveItem}
      />

      {/* FAB and Attach Menu */}
      <AttachMenuProvider>
        <View style={[styles.fabContainer, { bottom: insets.bottom + 24 }]}>
          <ShoppingListFab />
        </View>
        <AttachMenuOverlay />
      </AttachMenuProvider>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
    marginBottom: 12,
    gap: 12,

    borderBottomWidth: 1,
    borderBottomColor: Colors.lilac[100],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  titlePressable: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
  },
  summaryBar: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  summaryActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  fabContainer: {
    position: "absolute",
    right: 24,
    zIndex: 100,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#7849B6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
