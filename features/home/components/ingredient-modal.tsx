import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const IngredientModal = forwardRef<BottomSheetModal>((props, ref) => {
  const { top } = useSafeAreaInsets();

  const screenHeight = Dimensions.get("screen").height - top;

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

  return (
    <BottomSheetModal
      ref={ref}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
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
          <Text style={styles.subtitle}>Popular</Text>

          {/* Buraya popüler malzemeler gelecek */}
          <ScrollView>
            <View style={styles.ingredientsContainer}>
              {Array.from({ length: 20 }).map((_, index) => (
                <View style={styles.ingredientItem} key={index}>
                  <View style={styles.ingredientCircle}></View>
                  <Text style={styles.ingredientText}>
                    Ingredient {index + 1}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.bottomContainer}>
          <CustomButton containerStyle={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </CustomButton>
          <CustomButton containerStyle={styles.applyButton}>
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
    paddingVertical: 12,
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
  },
  ingredientItem: {
    justifyContent: "center",
    alignItems: "center",
    width: "22%",
  },
  ingredientCircle: {
    height: 52,
    width: 52,
    borderRadius: 999,
    backgroundColor: Colors.gray[100],
  },
  ingredientText: {
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: "center",
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingBottom: 0,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
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
