import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

interface SearchPantryHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onAdd: () => void;
  onStarPress: () => void;
}

export function SearchPantryHeader({
  searchQuery,
  onSearchChange,
  onAdd,
  onStarPress,
}: SearchPantryHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchField}>
        <Pressable style={styles.searchIcon} onPress={() => {}}>
          <Feather name="search" size={18} color={Colors.gray[300]} />
        </Pressable>

        <TextInput
          style={styles.searchInput}
          placeholder="Search your pantry"
          placeholderTextColor={Colors.gray[300]}
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
          onSubmitEditing={onAdd}
        />

        <Pressable style={styles.moreButton} onPress={onStarPress}>
          <Feather name="more-vertical" size={20} color={Colors.gray[500]} />
        </Pressable>
      </View>

      <CustomButton
        containerStyle={{
          width: 48,
          height: 48,
          paddingHorizontal: 0,
          paddingVertical: 0,
          backgroundColor: "red",
        }}
        hitSlop={14}
        onPress={() => router.push("/(add)/camera")}
      >
        <FontAwesome
          name="camera"
          size={20}
          color={Colors.lilac[700]}
          onPress={onAdd}
        />
      </CustomButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  searchField: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.lilac[100],
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.purple[600],
    fontWeight: "400",
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
  searchIcon: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  moreButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
});
