import { Colors } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type WeightUnit = "kg" | "lbs";

interface BodyWeightProps {
  title: string;
  description?: string;
  onValueChange?: (weight: number, unit: WeightUnit) => void;
  initialValue?: number;
  initialUnit?: WeightUnit;
}

export function BodyWeight({
  title,
  description,
  onValueChange,
  initialValue = 75,
  initialUnit = "kg",
}: BodyWeightProps) {
  const [weight, setWeight] = useState<number>(initialValue);
  const [unit, setUnit] = useState<WeightUnit>(initialUnit);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue.toString());

  function handleEdit() {
    setIsEditing(true);
    setInputValue(weight.toString());
  }

  function handleBlur() {
    const parsedWeight = parseInt(inputValue, 10);
    if (!isNaN(parsedWeight) && parsedWeight > 0) {
      setWeight(parsedWeight);
      onValueChange?.(parsedWeight, unit);
    } else {
      setInputValue(weight.toString());
    }
    setIsEditing(false);
  }

  function handleChangeText(text: string) {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");
    setInputValue(numericText);
  }

  function handleUnitChange(newUnit: WeightUnit) {
    setUnit(newUnit);
    // Convert weight value when switching units
    // This is a simplified conversion, you might want to add more precise logic
    onValueChange?.(weight, newUnit);
  }

  return (
    <View style={styles.content}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      <View style={styles.inputContainer}>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={handleChangeText}
            onBlur={handleBlur}
            keyboardType="number-pad"
            autoFocus
            maxLength={3}
            selectTextOnFocus
          />
        ) : (
          <View style={styles.displayContainer}>
            <View style={styles.displayBox}>
              <Text style={styles.displayText}>{weight}</Text>
            </View>
            <Pressable onPress={handleEdit} style={styles.editButton}>
              <MaterialCommunityIcons
                name="pencil"
                size={28}
                color={Colors.text.secondary}
              />
            </Pressable>
          </View>
        )}

        {/* Unit Toggle */}
        <View style={styles.unitToggleContainer}>
          <Pressable
            style={[
              styles.unitButton,
              styles.unitButtonLeft,
              unit === "kg" && styles.unitButtonActive,
            ]}
            onPress={() => handleUnitChange("kg")}
          >
            <Text
              style={[
                styles.unitButtonText,
                unit === "kg" && styles.unitButtonTextActive,
              ]}
            >
              Kg
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.unitButton,
              styles.unitButtonRight,
              unit === "lbs" && styles.unitButtonActive,
            ]}
            onPress={() => handleUnitChange("lbs")}
          >
            <Text
              style={[
                styles.unitButtonText,
                unit === "lbs" && styles.unitButtonTextActive,
              ]}
            >
              Lbs
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: 27,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 48,
    lineHeight: 58,
    color: Colors.text.inverse,
    marginBottom: 42,
    maxWidth: 344,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 28,
    color: Colors.text.inverse,
    maxWidth: 317,
  },
  inputContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  displayContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  displayBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 32,
    minWidth: 180,
    alignItems: "center",
  },
  displayText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 32,
    lineHeight: 38.73,
    color: Colors.text.primary,
  },
  editButton: {
    padding: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 32,
    minWidth: 180,
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 32,
    lineHeight: 38.73,
    color: Colors.text.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  unitToggleContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: Colors.gray[100],
    borderRadius: 8,
    padding: 4,
    gap: 8,
    width: 371,
    maxWidth: "100%",
  },
  unitButton: {
    flex: 1,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  unitButtonLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  unitButtonRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  unitButtonActive: {
    backgroundColor: Colors.lilac[900],
  },
  unitButtonText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19.36,
    color: Colors.text.primary,
  },
  unitButtonTextActive: {
    color: Colors.text.inverse,
  },
});
