import { Colors } from "@/constants/theme";
import { POPULAR_CUISINES } from "@/lib/constants";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useMemo, useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CuisineModalProps {
  onCuisinesSelect?: (cuisines: string[]) => void;
}

export const CuisineModal = forwardRef<BottomSheetModal, CuisineModalProps>(
  ({ onCuisinesSelect }, ref) => {
    const { top } = useSafeAreaInsets();
    const [selectedCuisines, setSelectedCuisines] = useState<Set<string>>(
      new Set()
    );

    const screenHeight =
      Dimensions.get("screen").height - top - (Platform.OS === "ios" ? 24 : 0);

    const handleSheetChanges = useCallback((index: number) => {
      console.log("handleSheetChanges", index);
    }, []);

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

    const handleClearAll = useCallback(() => {
      setSelectedCuisines(new Set());
    }, []);

    // Filter cuisines based on search query
    const displayCuisines = useMemo(() => {
      return POPULAR_CUISINES;
    }, []);

    // Selected items
    const selectedItems = useMemo(() => {
      return Array.from(selectedCuisines);
    }, [selectedCuisines]);

    // Unselected items from display
    const unselectedItems = useMemo(() => {
      return displayCuisines.filter(
        (cuisine) => !selectedCuisines.has(cuisine.id)
      );
    }, [displayCuisines, selectedCuisines]);

    const handleApply = useCallback(() => {
      const cuisinesToSend = Array.from(selectedCuisines);
      onCuisinesSelect?.(cuisinesToSend);
      if (typeof ref !== "function" && ref?.current?.dismiss) {
        ref.current.dismiss();
      }
    }, [selectedCuisines, onCuisinesSelect, ref]);

    const renderCuisineItem = (
      cuisine: (typeof POPULAR_CUISINES)[0],
      isSelected: boolean
    ) => {
      return (
        <Pressable
          key={`cuisine-${cuisine.id}`}
          style={({ pressed }) => [
            styles.cuisineItem,
            isSelected && styles.cuisineItemSelectedPopular,
            pressed && { transform: [{ scale: 0.95 }] },
          ]}
          onPress={() => toggleCuisine(cuisine.id)}
        >
          {cuisine.flag ? (
            <Text style={[styles.flagEmoji, isSelected && { opacity: 0.75 }]}>
              {cuisine.flag}
            </Text>
          ) : (
            <View
              style={[styles.cuisineCircle, isSelected && { opacity: 0.75 }]}
            />
          )}
          <Text style={[styles.cuisineText, isSelected && { opacity: 0.75 }]}>
            {cuisine.name}
          </Text>
          {isSelected && (
            <View style={styles.checkmark}>
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
          )}
        </Pressable>
      );
    };

    const renderSelectedCuisineItem = (cuisine: string) => {
      const cuisineData = POPULAR_CUISINES.find((c) => c.id === cuisine);
      if (!cuisineData) return null;

      return (
        <Pressable
          key={`selected-${cuisine}`}
          style={({ pressed }) => [
            styles.cuisineItem,
            styles.cuisineItemSelected,
            pressed && { transform: [{ scale: 0.95 }] },
          ]}
          onPress={() => toggleCuisine(cuisine)}
        >
          {cuisineData.flag ? (
            <Text style={styles.flagEmoji}>{cuisineData.flag}</Text>
          ) : (
            <View style={styles.cuisineCircle} />
          )}
          <Text style={styles.cuisineText}>{cuisineData.name}</Text>
          <View style={styles.checkmark}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        </Pressable>
      );
    };

    const ScrollContent = ({ children }: { children: React.ReactNode }) =>
      Platform.OS === "ios" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 28, paddingTop: 12 }}
        >
          {children}
        </ScrollView>
      ) : (
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          {children}
        </BottomSheetScrollView>
      );

    return (
      <BottomSheetModal
        ref={ref}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        enableOverDrag={false}
      >
        <BottomSheetView
          style={[styles.contentContainer, { height: screenHeight }]}
        >
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Search by Cuisine</Text>

              <Pressable
                onPress={() =>
                  typeof ref !== "function" && ref?.current?.dismiss()
                }
              >
                <AntDesign name="close" size={20} color="black" />
              </Pressable>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <ScrollContent>
              {/* Selected Items Section */}
              {selectedItems.length > 0 && (
                <>
                  <Text style={styles.subtitle}>Selected</Text>
                  <View style={styles.cuisinesContainer}>
                    {selectedItems.map((cuisine) =>
                      renderSelectedCuisineItem(cuisine)
                    )}
                  </View>
                </>
              )}

              {/* Main Content Section */}
              <Text style={styles.subtitle}>Cuisines</Text>

              <View style={styles.cuisinesContainer}>
                {unselectedItems.map((cuisine) =>
                  renderCuisineItem(cuisine, false)
                )}
              </View>
            </ScrollContent>
          </View>

          <View style={styles.bottomContainer}>
            <CustomButton
              containerStyle={styles.clearButton}
              onPress={handleClearAll}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
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
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "semibold",
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
  },
  cuisinesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 4,
  },
  cuisineItem: {
    justifyContent: "center",
    alignItems: "center",
    width: "22%",
    position: "relative",
  },
  cuisineItemSelected: {
    backgroundColor: Colors.lilac[100],
    borderRadius: 12,
    paddingVertical: 8,
  },
  cuisineItemSelectedPopular: {
    opacity: 0.75,
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
    paddingVertical: 12,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.lilac[100],
  },
  clearButton: {
    backgroundColor: Colors.gray[100],
    flex: 1,
    width: "auto",
    paddingVertical: 16,
  },
  clearButtonText: {
    color: "black",
    fontWeight: "semibold",
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
