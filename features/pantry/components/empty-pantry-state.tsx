import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";

interface EmptyPantryStateProps {
  onPrefill: () => void;
}

export function EmptyPantryState({ onPrefill }: EmptyPantryStateProps) {
  return (
    <View style={styles.container}>
      <Image
        // Ensure you have an image named 'empty-pantry.png' in your assets/images folder
        source={require("@/assets/images/empty-pantry.png")}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>Your Pantry is empty.</Text>
      <Text style={styles.description}>
        Add your first items or get a quick start by adding the most common
        pantry staples.
      </Text>
      <CustomButton onPress={onPrefill} containerStyle={styles.button}>
        <View style={styles.buttonContent}>
          <Ionicons
            name="sparkles-outline"
            size={20}
            color={Colors.text.primary}
            style={styles.icon}
          />
          <Text style={styles.buttonText}>PRE-FILL MY PANTRY</Text>
        </View>
      </CustomButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  image: {
    width: "100%",
    height: 200,
    marginBottom: 8,
    borderRadius: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.text.primary,
    borderRadius: 30, // Pill shape
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: "auto",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
