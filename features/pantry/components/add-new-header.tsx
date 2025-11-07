import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

interface AddNewHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onAdd: () => void;
  onStarPress: () => void;
}

export function AddNewHeader({
  searchQuery,
  onSearchChange,
  onAdd,
  onStarPress,
}: AddNewHeaderProps) {
  return (
    <View style={styles.addNewContainer}>
      <View style={styles.addNewHeader}>
        <TextInput
          style={styles.addNewInput}
          placeholder="Add new"
          placeholderTextColor={Colors.gray[300]}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
        <Pressable style={styles.iconButton} onPress={onAdd}>
          <Feather name="plus" size={24} color={Colors.lilac[700]} />
        </Pressable>
      </View>
      <Pressable style={styles.starButton} onPress={onStarPress}>
        <Feather name="star" size={24} color={Colors.lilac[900]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  addNewContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  addNewHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 16,
    backgroundColor: Colors.lilac[100],
    borderRadius: 12,
  },
  addNewInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.purple[600],
    fontWeight: "400",
    paddingVertical: 0,
  },
  iconButton: {
    padding: 4,
  },
  starButton: {
    padding: 8,
  },
});

