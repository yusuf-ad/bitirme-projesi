import { Colors } from "@/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, StyleSheet, View } from "react-native";

interface MealSelectionCardProps {
  isSelected: boolean;
  onPress: () => void;
}

export function MealSelectionCard({
  isSelected,
  onPress,
}: MealSelectionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        isSelected ? styles.cardSelected : styles.cardUnselected,
      ]}
    >
      <View>
        {isSelected && (
          <View style={styles.checkboxSelected}>
            <MaterialIcons name="check" size={16} color={Colors.green[600]} />
          </View>
        )}
        {!isSelected && (
          <MaterialIcons name="no-meals" size={24} color={Colors.gray[500]} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 2,
  },
  cardSelected: {
    backgroundColor: "#D2E6CE",
    borderColor: Colors.green[600],
  },
  cardUnselected: {
    backgroundColor: Colors.gray[100],
    borderColor: Colors.gray[200],
    opacity: 0.6,
  },
  checkboxSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
