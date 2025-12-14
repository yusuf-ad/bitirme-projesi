import { Colors } from "@/constants/theme";
import { POPULAR_CUISINES } from "@/lib/constants";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView
} from "@gorhom/bottom-sheet";
import { forwardRef, memo, useCallback, useEffect, useMemo, useState } from "react";
import {
    Dimensions,
    Pressable,
    StyleSheet,
    Text,
    View
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CuisineModalProps {
  onCuisinesSelect?: (cuisines: string[]) => void;
  initialSelectedCuisines?: string[];
}

// Memoized cuisine item
const CuisineItem = memo(({
  cuisine,
  isSelected,
  onToggle,
  index,
}: {
  cuisine: (typeof POPULAR_CUISINES)[0];
  isSelected: boolean;
  onToggle: (id: string) => void;
  index: number;
}) => (
  <Animated.View
    entering={FadeInDown.delay(index * 40).duration(300)}
    style={styles.cuisineItemWrapper}
  >
    <Pressable
      style={({ pressed }) => [
        styles.cuisineItem,
        isSelected && styles.cuisineItemSelected,
        pressed && styles.cuisineItemPressed,
      ]}
      onPress={() => onToggle(cuisine.id)}
    >
      {cuisine.flag ? (
        <Text style={styles.flagEmoji}>{cuisine.flag}</Text>
      ) : (
        <View style={styles.cuisineCircle} />
      )}
      <Text style={styles.cuisineText}>{cuisine.name}</Text>
      {isSelected && (
        <View style={styles.checkmark}>
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}
    </Pressable>
  </Animated.View>
));

CuisineItem.displayName = "CuisineItem";

export const CuisineModal = forwardRef<BottomSheetModal, CuisineModalProps>(
  ({ onCuisinesSelect, initialSelectedCuisines = [] }, ref) => {
    const { bottom } = useSafeAreaInsets();
    const [selectedCuisines, setSelectedCuisines] = useState<Set<string>>(
      new Set(initialSelectedCuisines)
    );

    // Sync with external state when modal opens
    const initialCuisinesKey = initialSelectedCuisines.join(",");
    useEffect(() => {
      setSelectedCuisines(new Set(initialSelectedCuisines));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialCuisinesKey]);



    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      []
    );

    const toggleCuisine = useCallback((cuisine: string) => {
      setSelectedCuisines((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(cuisine)) {
          newSet.delete(cuisine);
        } else {
          newSet.add(cuisine);
        }
        return newSet;
      });
    }, []);

    const handleReset = useCallback(() => {
      setSelectedCuisines(new Set());
      onCuisinesSelect?.([]);
      if (typeof ref !== "function" && ref?.current?.dismiss) {
        ref.current.dismiss();
      }
    }, [onCuisinesSelect, ref]);

    const selectedItems = useMemo(
      () => Array.from(selectedCuisines),
      [selectedCuisines]
    );

    const unselectedItems = useMemo(
      () => POPULAR_CUISINES.filter((c) => !selectedCuisines.has(c.id)),
      [selectedCuisines]
    );

    const handleApply = useCallback(() => {
      onCuisinesSelect?.(Array.from(selectedCuisines));
      if (typeof ref !== "function" && ref?.current?.dismiss) {
        ref.current.dismiss();
      }
    }, [selectedCuisines, onCuisinesSelect, ref]);

    const handleDismiss = useCallback(() => {
      if (typeof ref !== "function" && ref?.current?.dismiss) {
        ref.current.dismiss();
      }
    }, [ref]);

    return (
      <BottomSheetModal
        ref={ref}
        backdropComponent={renderBackdrop}
        enableOverDrag={false}
        enablePanDownToClose
        enableDynamicSizing
      >
        <BottomSheetView style={[styles.contentContainer, { paddingBottom: Math.max(bottom, 16), minHeight: Dimensions.get("window").height * 0.75 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Search by Cuisine</Text>
            <Pressable
              onPress={handleDismiss}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <AntDesign name="close" size={20} color="black" />
            </Pressable>
          </View>

          {/* Content Area - takes remaining space */}
          <View style={styles.contentArea}>
            {/* Selected Items Section */}
            {selectedItems.length > 0 && (
              <>
                <Text style={styles.subtitle}>Selected</Text>
                <View style={styles.cuisinesContainer}>
                  {selectedItems.map((cuisineId, index) => {
                    const cuisine = POPULAR_CUISINES.find((c) => c.id === cuisineId);
                    if (!cuisine) return null;
                    return (
                      <CuisineItem
                        key={`selected-${cuisineId}`}
                        cuisine={cuisine}
                        isSelected={true}
                        onToggle={toggleCuisine}
                        index={index}
                      />
                    );
                  })}
                </View>
              </>
            )}

            {/* Cuisines Title */}
            <Text style={styles.subtitle}>Cuisines</Text>

            {/* Cuisine Items */}
            <View style={styles.cuisinesContainer}>
              {unselectedItems.map((cuisine, index) => (
                <CuisineItem
                  key={`cuisine-${cuisine.id}`}
                  cuisine={cuisine}
                  isSelected={false}
                  onToggle={toggleCuisine}
                  index={index}
                />
              ))}
            </View>
          </View>

          {/* Bottom Buttons - Fixed at bottom */}
          <View style={styles.bottomContainer}>
            <CustomButton
              containerStyle={styles.clearButton}
              onPress={handleReset}
            >
              <Text style={styles.clearButtonText}>Reset</Text>
            </CustomButton>
            <CustomButton
              containerStyle={styles.applyButton}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply</Text>
            </CustomButton>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

CuisineModal.displayName = "CuisineModal";

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    justifyContent: "space-between",
  },
  contentArea: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  subtitle: {
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cuisinesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 4,
  },
  cuisineItemWrapper: {
    width: "22%",
  },
  cuisineItem: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cuisineItemSelected: {
    backgroundColor: Colors.lilac[100],
    borderRadius: 12,
    paddingVertical: 8,
  },
  cuisineItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  cuisineCircle: {
    height: 52,
    width: 52,
    borderRadius: 999,
    backgroundColor: Colors.lilac[100],
    marginBottom: 4,
  },
  flagEmoji: {
    fontSize: 40,
    marginBottom: 4,
  },
  cuisineText: {
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "center",
  },
  checkmark: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: Colors.lilac[500],
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 16,
  },
  clearButton: {
    backgroundColor: Colors.lilac[100],
    flex: 1,
    width: "auto",
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  clearButtonText: {
    color: Colors.lilac[800],
    fontWeight: "600",
  },
  applyButton: {
    backgroundColor: Colors.lilac[900],
    flex: 1,
    width: "auto",
    paddingVertical: 16,
  },
  applyButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
