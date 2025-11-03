import { Colors } from "@/constants/theme";
import { getMealImageUrl, type Meal } from "@/lib/utils";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItemInfo,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface MealSelectionModalHandle {
  present: () => void;
  dismiss: () => void;
}

interface MealSelectionModalProps {
  title?: string;
  meals: Meal[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onDismiss?: () => void;
  onGenerateMore?: () => void;
  isGeneratingMore?: boolean;
}

export const MealSelectionModal = forwardRef<
  MealSelectionModalHandle,
  MealSelectionModalProps
>(
  (
    {
      title,
      meals,
      selectedIndex,
      onSelect,
      onDismiss,
      onGenerateMore,
      isGeneratingMore,
    },
    ref
  ) => {
    const internalRef = useRef<BottomSheetModal>(null);
    const { bottom } = useSafeAreaInsets();

    const snapPoints = useMemo(() => ["58%"], []);
    const safeSelectedIndex = selectedIndex >= meals.length ? 0 : selectedIndex;

    const handleBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      []
    );

    useImperativeHandle(
      ref,
      () => ({
        present: () => internalRef.current?.present(),
        dismiss: () => internalRef.current?.dismiss(),
      }),
      []
    );

    const renderMealCard = useCallback(
      ({ item, index }: ListRenderItemInfo<Meal>) => {
        const isSelected = index === safeSelectedIndex;
        const imageUrl = getMealImageUrl(item);

        return (
          <Pressable
            onPress={() => onSelect(index)}
            style={({ pressed }) => [
              styles.mealCard,
              isSelected && styles.mealCardSelected,
              pressed && styles.mealCardPressed,
            ]}
          >
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.mealImage} />
            ) : (
              <View style={[styles.mealImage, styles.mealPlaceholder]} />
            )}
            <View style={styles.mealInfo}>
              <Text numberOfLines={2} style={styles.mealTitle}>
                {item.title}
              </Text>
              <View style={styles.mealMeta}>
                {item.nutrition?.calories && (
                  <Text style={styles.metaText}>
                    {Math.round(item.nutrition.calories)} cal
                  </Text>
                )}
                {item.readyInMinutes && (
                  <Text style={styles.metaText}>{item.readyInMinutes} min</Text>
                )}
              </View>
            </View>
            {isSelected && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </View>
            )}
          </Pressable>
        );
      },
      [onSelect, safeSelectedIndex]
    );

    const hasMeals = meals.length > 0;

    const generateFooter = useMemo(() => {
      if (!onGenerateMore) return null;

      return (
        <View style={styles.generateWrapper}>
          <Pressable
            onPress={onGenerateMore}
            disabled={isGeneratingMore}
            style={({ pressed }) => [
              styles.generateCard,
              pressed && styles.mealCardPressed,
              isGeneratingMore && styles.generateCardDisabled,
            ]}
          >
            {isGeneratingMore ? (
              <ActivityIndicator color={Colors.lilac[900]} />
            ) : (
              <>
                <View style={styles.generateIconCircle}>
                  <Ionicons
                    name="refresh"
                    size={18}
                    color={Colors.lilac[900]}
                  />
                </View>
                <Text style={styles.generateText}>Generate meal recipe</Text>
              </>
            )}
          </Pressable>
        </View>
      );
    }, [onGenerateMore, isGeneratingMore]);

    return (
      <BottomSheetModal
        ref={internalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={handleBackdrop}
        enableOverDrag={false}
        onDismiss={() => onDismiss?.()}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView
          style={[styles.container, { paddingBottom: bottom + 16 }]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{title ?? "Select a meal"}</Text>
            <Pressable onPress={() => internalRef.current?.dismiss()}>
              <AntDesign name="close" size={20} color={Colors.text.primary} />
            </Pressable>
          </View>

          {hasMeals ? (
            <View style={styles.mealListWrapper}>
              <FlatList
                data={meals}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMealCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.flatListContent}
                ListFooterComponent={generateFooter}
              />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No meals available</Text>
              <CustomButton
                containerStyle={styles.dismissButton}
                onPress={() => internalRef.current?.dismiss()}
              >
                <Text style={styles.dismissText}>Close</Text>
              </CustomButton>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

MealSelectionModal.displayName = "MealSelectionModal";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.select({ ios: 12, android: 4 }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  mealListWrapper: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 4,
    paddingBottom: 12,
    paddingRight: 16,
  },
  mealCard: {
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  mealCardSelected: {
    borderColor: Colors.lilac[500],
  },
  mealCardPressed: {
    transform: [{ scale: 0.97 }],
  },
  mealImage: {
    width: "100%",
    height: 110,
    backgroundColor: Colors.gray[200],
  },
  mealPlaceholder: {
    backgroundColor: Colors.gray[300],
  },
  mealInfo: {
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text.primary,
  },
  mealMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  checkmark: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.lilac[500],
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  dismissButton: {
    backgroundColor: Colors.lilac[900],
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  dismissText: {
    color: "#fff",
    fontWeight: "600",
  },
  handleIndicator: {
    backgroundColor: Colors.gray[300],
  },
  separator: {
    width: 12,
  },
  generateWrapper: {
    flex: 1,
    marginLeft: 12,
    paddingRight: 16,
  },
  generateCard: {
    flex: 1,
    width: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.lilac[900],
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  generateCardDisabled: {
    opacity: 0.7,
  },
  generateIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lilac[100],
    alignItems: "center",
    justifyContent: "center",
  },
  generateText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.lilac[900],
    textAlign: "center",
  },
});
