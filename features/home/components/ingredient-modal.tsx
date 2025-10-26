import { Colors } from "@/constants/theme";
import { POPULAR_INGREDIENTS } from "@/lib/constants";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface IngredientModalProps {
  onIngredientsSelect?: (ingredients: typeof POPULAR_INGREDIENTS) => void;
}

export const IngredientModal = forwardRef<
  BottomSheetModal,
  IngredientModalProps
>(({ onIngredientsSelect }, ref) => {
  const { top } = useSafeAreaInsets();
  const [selectedIngredients, setSelectedIngredients] = useState<Set<number>>(
    new Set()
  );

  const screenHeight = Dimensions.get("screen").height - top;
  const INGREDIENT_IMAGE_BASE_URL =
    "https://spoonacular.com/cdn/ingredients_100x100";

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

  const toggleIngredient = useCallback((index: number) => {
    setSelectedIngredients((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedIngredients(new Set());
  }, []);

  const handleApply = useCallback(() => {
    const selectedItems = POPULAR_INGREDIENTS.filter((_, index) =>
      selectedIngredients.has(index)
    );
    onIngredientsSelect?.(selectedItems);
    if (typeof ref !== "function" && ref?.current?.dismiss) {
      ref.current.dismiss();
    }
  }, [selectedIngredients, onIngredientsSelect, ref]);

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
            <Text style={styles.title}>Search by Ingredients</Text>

            <Pressable
              onPress={() =>
                typeof ref !== "function" && ref?.current?.dismiss()
              }
            >
              <AntDesign name="close" size={20} color="black" />
            </Pressable>
          </View>

          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={Colors.lilac[500]}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="What's in your pantry"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>
        </View>

        <View style={{ flex: 1 }}>
          {Platform.OS === "ios" ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 28, paddingTop: 12 }}
            >
              {selectedIngredients.size > 0 && (
                <>
                  <Text style={styles.subtitle}>Selected</Text>
                  <View style={styles.ingredientsContainer}>
                    {POPULAR_INGREDIENTS.map((item, index) => {
                      const isSelected = selectedIngredients.has(index);
                      return isSelected ? (
                        <Pressable
                          key={`selected-${index}`}
                          style={({ pressed }) => [
                            styles.ingredientItem,
                            styles.ingredientItemSelected,
                            pressed && { transform: [{ scale: 0.95 }] },
                          ]}
                          onPress={() => toggleIngredient(index)}
                        >
                          {item.image ? (
                            <Image
                              source={{
                                uri: `${INGREDIENT_IMAGE_BASE_URL}/${item.image}`,
                              }}
                              style={styles.ingredientCircle}
                            />
                          ) : (
                            <View style={styles.ingredientCircle} />
                          )}
                          <Text style={styles.ingredientText}>{item.name}</Text>
                          {isSelected && (
                            <View style={styles.checkmark}>
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color="white"
                              />
                            </View>
                          )}
                        </Pressable>
                      ) : null;
                    })}
                  </View>
                </>
              )}

              <Text style={styles.subtitle}>Popular</Text>

              <View style={styles.ingredientsContainer}>
                {POPULAR_INGREDIENTS.map((item, index) => {
                  const isSelected = selectedIngredients.has(index);
                  return (
                    <Pressable
                      key={`popular-${index}`}
                      style={({ pressed }) => [
                        styles.ingredientItem,
                        isSelected && styles.ingredientItemSelectedPopular,
                        pressed && { transform: [{ scale: 0.95 }] },
                      ]}
                      onPress={() => toggleIngredient(index)}
                    >
                      {item.image ? (
                        <Image
                          source={{
                            uri: `${INGREDIENT_IMAGE_BASE_URL}/${item.image}`,
                          }}
                          style={[
                            styles.ingredientCircle,
                            isSelected && { opacity: 0.75 },
                          ]}
                        />
                      ) : (
                        <View style={styles.ingredientCircle} />
                      )}
                      <Text
                        style={[
                          styles.ingredientText,
                          isSelected && { opacity: 0.75 },
                        ]}
                      >
                        {item.name}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <BottomSheetScrollView showsVerticalScrollIndicator={false}>
              {selectedIngredients.size > 0 && (
                <>
                  <Text style={styles.subtitle}>Selected</Text>
                  <View style={styles.ingredientsContainer}>
                    {POPULAR_INGREDIENTS.map((item, index) => {
                      const isSelected = selectedIngredients.has(index);
                      return isSelected ? (
                        <Pressable
                          key={`selected-${index}`}
                          style={({ pressed }) => [
                            styles.ingredientItem,
                            styles.ingredientItemSelected,
                            pressed && { transform: [{ scale: 0.95 }] },
                          ]}
                          onPress={() => toggleIngredient(index)}
                        >
                          {item.image ? (
                            <Image
                              source={{
                                uri: `${INGREDIENT_IMAGE_BASE_URL}/${item.image}`,
                              }}
                              style={styles.ingredientCircle}
                            />
                          ) : (
                            <View style={styles.ingredientCircle} />
                          )}
                          <Text style={styles.ingredientText}>{item.name}</Text>
                          {isSelected && (
                            <View style={styles.checkmark}>
                              <Ionicons
                                name="checkmark"
                                size={16}
                                color="white"
                              />
                            </View>
                          )}
                        </Pressable>
                      ) : null;
                    })}
                  </View>
                </>
              )}

              <Text style={styles.subtitle}>Popular</Text>

              <View style={styles.ingredientsContainer}>
                {POPULAR_INGREDIENTS.map((item, index) => {
                  const isSelected = selectedIngredients.has(index);
                  return (
                    <Pressable
                      key={`popular-${index}`}
                      style={({ pressed }) => [
                        styles.ingredientItem,
                        isSelected && styles.ingredientItemSelectedPopular,
                        pressed && { transform: [{ scale: 0.95 }] },
                      ]}
                      onPress={() => toggleIngredient(index)}
                    >
                      {item.image ? (
                        <Image
                          source={{
                            uri: `${INGREDIENT_IMAGE_BASE_URL}/${item.image}`,
                          }}
                          style={[
                            styles.ingredientCircle,
                            isSelected && { opacity: 0.75 },
                          ]}
                        />
                      ) : (
                        <View style={styles.ingredientCircle} />
                      )}
                      <Text
                        style={[
                          styles.ingredientText,
                          isSelected && { opacity: 0.75 },
                        ]}
                      >
                        {item.name}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <Ionicons name="checkmark" size={16} color="white" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </BottomSheetScrollView>
          )}
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
});

IngredientModal.displayName = "IngredientModal";

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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 12 : 4,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    marginVertical: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ingredientsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 4,
  },
  ingredientItem: {
    justifyContent: "center",
    alignItems: "center",
    width: "22%",
    position: "relative",
  },
  ingredientItemSelected: {
    backgroundColor: Colors.lilac[100],
    borderRadius: 12,
  },
  ingredientItemSelectedPopular: {
    opacity: 0.75,
  },
  ingredientCircle: {
    height: 52,
    width: 52,
    borderRadius: 999,
    resizeMode: "contain",
    padding: 2,
  },
  ingredientText: {
    fontSize: 16,
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
