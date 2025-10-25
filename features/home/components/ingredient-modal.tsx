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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
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
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 12,
            paddingBottom: 0,
            borderTopWidth: 1,
            borderTopColor: Colors.gray[100],
          }}
        >
          <CustomButton
            containerStyle={{
              backgroundColor: Colors.gray[100],
              flex: 1,
              width: "auto",
              paddingVertical: 16,
            }}
          >
            <Text
              style={{
                color: "black",
                fontWeight: "semibold",
              }}
            >
              Clear All
            </Text>
          </CustomButton>
          <CustomButton
            containerStyle={{
              backgroundColor: Colors.lilac[900],
              flex: 1,
              width: "auto",
              paddingVertical: 16,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "bold",
              }}
            >
              Apply
            </Text>
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
});
