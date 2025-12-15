import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

interface BodyGenderProps {
  title: string;
  description?: string;
  onSelectionChange?: (selectedGender: string) => void;
  initialSelection?: string;
}

const genderOptions = [
  {
    id: "male",
    title: "Male",
    emoji: "👨",
    gradient: ["#E3F2FD", "#BBDEFB"],
    accentColor: "#1976D2",
  },
  {
    id: "female",
    title: "Female",
    emoji: "👩",
    gradient: ["#FCE4EC", "#F8BBD9"],
    accentColor: "#C2185B",
  },
  {
    id: "prefer-not-to-say",
    title: "Prefer not to say",
    emoji: "🙂",
    gradient: ["#F3E5F5", "#E1BEE7"],
    accentColor: "#7B1FA2",
  },
];

export function BodyGender({
  title,
  description,
  onSelectionChange,
  initialSelection,
}: BodyGenderProps) {
  const [selectedGender, setSelectedGender] = useState<string | undefined>(
    initialSelection
  );

  function selectGender(genderId: string) {
    setSelectedGender(genderId);
    onSelectionChange?.(genderId);
  }

  return (
    <View style={styles.content}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.optionsContainer}>
          {genderOptions.map((option) => (
            <GenderOption
              key={option.id}
              option={option}
              isSelected={selectedGender === option.id}
              onPress={() => selectGender(option.id)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

interface GenderOptionProps {
  option: {
    id: string;
    title: string;
    emoji: string;
    gradient: string[];
    accentColor: string;
  };
  isSelected: boolean;
  onPress: () => void;
}

function GenderOption({ option, isSelected, onPress }: GenderOptionProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.optionWrapper,
        pressed && styles.optionPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <LinearGradient
        colors={option.gradient as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.option,
          isSelected && {
            borderColor: option.accentColor,
            shadowColor: option.accentColor,
          },
        ]}
      >
        {/* Selection indicator */}
        {isSelected && (
          <View
            style={[
              styles.checkmarkBadge,
              { backgroundColor: option.accentColor },
            ]}
          >
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          </View>
        )}

        {/* Content */}
        <View style={styles.contentWrapper}>
          <View style={styles.emojiContainer}>
            <Text style={styles.emoji}>{option.emoji}</Text>
          </View>
          <Text
            style={[
              styles.optionText,
              isSelected && { color: option.accentColor },
            ]}
          >
            {option.title}
          </Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: 24,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 48,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 28,
    lineHeight: 36,
    color: "#1A1D26",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    maxWidth: 300,
  },
  optionsContainer: {
    gap: 16,
  },
  optionWrapper: {
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  optionPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  option: {
    borderRadius: 24,
    padding: 24,
    minHeight: 100,
    borderWidth: 3,
    borderColor: "transparent",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  contentWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  emojiContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: {
    fontSize: 36,
  },
  optionText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 20,
    color: "#1A1D26",
    flex: 1,
  },
  checkmarkBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
