import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";

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
    IconComponent: MaleIcon,
  },
  {
    id: "female",
    title: "Female",
    IconComponent: FemaleIcon,
  },
  {
    id: "prefer-not-to-say",
    title: "Prefer not to say",
    IconComponent: PrivacyIcon,
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
    IconComponent: React.ComponentType;
  };
  isSelected: boolean;
  onPress: () => void;
}

function GenderOption({ option, isSelected, onPress }: GenderOptionProps) {
  const { IconComponent } = option;

  return (
    <Pressable
      style={styles.optionWrapper}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <View style={styles.option}>
        <Text style={styles.optionText}>{option.title}</Text>
        <View style={styles.iconContainer}>
          <IconComponent />
        </View>
      </View>
      {isSelected && (
        <View style={styles.checkmarkContainer}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </View>
        </View>
      )}
    </Pressable>
  );
}

// Custom Icon Components
function MaleIcon() {
  return (
    <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <Circle
        cx="24"
        cy="18"
        r="6"
        fill="#008CF8"
        stroke="#006BB8"
        strokeWidth="1.5"
      />
      <Path
        d="M24 26C19.5 26 16.5 29 16.5 33V39H31.5V33C31.5 29 28.5 26 24 26Z"
        fill="#008CF8"
        stroke="#006BB8"
        strokeWidth="1.5"
      />
    </Svg>
  );
}

function FemaleIcon() {
  return (
    <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <Circle
        cx="24"
        cy="18"
        r="6"
        fill="#DA50FF"
        stroke="#B030D0"
        strokeWidth="1.5"
      />
      <Path
        d="M24 26C19.5 26 16.5 29 16.5 33V39H31.5V33C31.5 29 28.5 26 24 26Z"
        fill="#DA50FF"
        stroke="#B030D0"
        strokeWidth="1.5"
      />
    </Svg>
  );
}

function PrivacyIcon() {
  return (
    <Svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <G>
        <Path
          d="M15 20C15 20 16.5 17 24 17C31.5 17 33 20 33 20V21.5C33 21.5 33 24 30 24H18C15 24 15 21.5 15 21.5V20Z"
          fill="#548A6A"
          stroke="#3D6B4F"
          strokeWidth="1.5"
        />
        <Path
          d="M19.5 22.5H28.5V25.5C28.5 25.5 28.5 28.5 24 28.5C19.5 28.5 19.5 25.5 19.5 25.5V22.5Z"
          fill="#548A6A"
          stroke="#3D6B4F"
          strokeWidth="1.5"
        />
        <Circle cx="21" cy="21" r="1.5" fill="#1A1A1A" />
        <Circle cx="27" cy="21" r="1.5" fill="#1A1A1A" />
      </G>
    </Svg>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: 11,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 11,
    marginTop: 262,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 32,
    lineHeight: 40,
    color: "#2D3142",
    marginBottom: 12,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 24,
    color: "#5D6270",
    maxWidth: 371,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 33,
  },
  optionWrapper: {
    position: "relative",
  },
  option: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 20,
    lineHeight: 24.2,
    color: Colors.text.primary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkContainer: {
    position: "absolute",
    top: -8,
    right: -8,
    zIndex: 10,
  },
  checkmarkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2D3E50",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
