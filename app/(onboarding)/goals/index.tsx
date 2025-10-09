import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const goalOptions = [
  {
    id: "healthy-eating",
    title: "Sağlıklı beslenin",
    icon: require("@/assets/icons/carrot-icon.svg"),
  },
  {
    id: "learn-cooking",
    title: "Yemek yapmayı öğren",
    icon: require("@/assets/icons/chef-icon.svg"),
  },
  {
    id: "lose-weight",
    title: "Kilo verin",
    icon: require("@/assets/icons/scale-icon.svg"),
  },
  {
    id: "gain-weight",
    title: "Kilo alın",
    icon: require("@/assets/icons/weight-icon.svg"),
  },
  {
    id: "try-recipes",
    title: "Yeni tarifler\ndeneyin",
    icon: require("@/assets/icons/recipe-icon.svg"),
  },
  {
    id: "stay-on-diet",
    title: "Diyetime\nsadık kalın",
    icon: require("@/assets/icons/diet-icon.svg"),
  },
  {
    id: "build-muscle",
    title: "Kas yapın",
    icon: require("@/assets/icons/muscle-icon.svg"),
  },
  {
    id: "save-time",
    title: "Zaman\nkazanın",
    icon: require("@/assets/icons/time-icon.svg"),
  },
];

export default function GoalsScreen() {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "healthy-eating",
  ]);

  function toggleGoal(goalId: string) {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((id) => id !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  }

  function handleNext() {
    // TODO: Navigate to next onboarding step
    console.log("Selected goals:", selectedGoals);
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/onboarding-bg.png")}
        style={styles.backgroundImage}
        blurRadius={48}
      >
        {/* Overlay */}
        <View style={styles.overlay} />

        {/* Content */}
        <View style={styles.content}>
          {/* Progress Indicators */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, styles.progressBarActive]} />
            <View style={styles.progressBarGroup}>
              <View style={styles.progressBar} />
              <View style={styles.progressBar} />
              <View style={styles.progressBar} />
            </View>
          </View>

          {/* Title and Description */}
          <Text style={styles.title}>Hedefler</Text>
          <Text style={styles.description}>
            Hedeflerinize ulaşmanıza yardımcı olacak kişiselleştirilmiş öneriler
            sunacağız
          </Text>

          {/* Scrollable Goal Options Grid */}
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.optionsContainer}>
              {/* Row 1 */}
              <View style={styles.row}>
                <GoalOption
                  option={goalOptions[0]}
                  isSelected={selectedGoals.includes(goalOptions[0].id)}
                  onPress={() => toggleGoal(goalOptions[0].id)}
                />
                <GoalOption
                  option={goalOptions[1]}
                  isSelected={selectedGoals.includes(goalOptions[1].id)}
                  onPress={() => toggleGoal(goalOptions[1].id)}
                />
              </View>

              {/* Row 2 */}
              <View style={styles.row}>
                <GoalOption
                  option={goalOptions[2]}
                  isSelected={selectedGoals.includes(goalOptions[2].id)}
                  onPress={() => toggleGoal(goalOptions[2].id)}
                />
                <GoalOption
                  option={goalOptions[3]}
                  isSelected={selectedGoals.includes(goalOptions[3].id)}
                  onPress={() => toggleGoal(goalOptions[3].id)}
                />
              </View>

              {/* Row 3 */}
              <View style={styles.row}>
                <GoalOption
                  option={goalOptions[4]}
                  isSelected={selectedGoals.includes(goalOptions[4].id)}
                  onPress={() => toggleGoal(goalOptions[4].id)}
                />
                <GoalOption
                  option={goalOptions[5]}
                  isSelected={selectedGoals.includes(goalOptions[5].id)}
                  onPress={() => toggleGoal(goalOptions[5].id)}
                />
              </View>

              {/* Row 4 */}
              <View style={styles.row}>
                <GoalOption
                  option={goalOptions[6]}
                  isSelected={selectedGoals.includes(goalOptions[6].id)}
                  onPress={() => toggleGoal(goalOptions[6].id)}
                />
                <GoalOption
                  option={goalOptions[7]}
                  isSelected={selectedGoals.includes(goalOptions[7].id)}
                  onPress={() => toggleGoal(goalOptions[7].id)}
                />
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <CustomButton
            containerStyle={styles.backButton}
            accessibilityLabel="Go Back"
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </CustomButton>

          <CustomButton
            containerStyle={styles.nextButton}
            accessibilityLabel="Next"
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>Next</Text>
          </CustomButton>
        </View>
      </ImageBackground>
    </View>
  );
}

interface GoalOptionProps {
  option: { id: string; title: string; icon: any };
  isSelected: boolean;
  onPress: () => void;
}

function GoalOption({ option, isSelected, onPress }: GoalOptionProps) {
  return (
    <Pressable
      style={[styles.option, isSelected && styles.optionSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      {/* Checkmark for selected option */}
      {isSelected && (
        <View style={styles.checkmarkBadge}>
          <Ionicons
            name="checkmark-circle"
            size={24}
            color={Colors.green[900]}
          />
        </View>
      )}

      <Text style={styles.optionText}>{option.title}</Text>
      <View style={styles.iconPlaceholder} />
      <View style={styles.iconContainer}>
        <Image source={option.icon} style={styles.icon} contentFit="contain" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    flex: 1,
    paddingTop: 28,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 11,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  progressContainer: {
    flexDirection: "row",
    gap: 3,
    padding: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 12,
    marginBottom: 19,
    marginHorizontal: 11,
    height: 24,
  },
  progressBar: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  progressBarActive: {
    backgroundColor: Colors.gray[100],
  },
  progressBarGroup: {
    flex: 3,
    flexDirection: "row",
    gap: 3,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 24,
    lineHeight: 29,
    color: Colors.text.inverse,
    marginBottom: 19,
    marginHorizontal: 11,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19.36,
    color: Colors.text.inverse,
    marginBottom: 33,
    maxWidth: 371,
    marginHorizontal: 11,
  },
  optionsContainer: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  option: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 16,
    minHeight: 140,
    justifyContent: "space-between",
    borderWidth: 3,
    borderColor: "transparent",
    position: "relative",
  },
  optionSelected: {
    borderColor: Colors.green[900],
  },
  optionText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 20,
    lineHeight: 24.2,
    color: "#000000",
  },
  iconPlaceholder: {
    flex: 1,
  },
  iconContainer: {
    alignSelf: "flex-end",
    width: 156,
    height: 54,
  },
  icon: {
    width: "100%",
    height: "100%",
  },
  checkmarkBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  backButton: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(161, 164, 170, 0.5)",
    borderRadius: 8,
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.lilac[900],
    borderRadius: 8,
    paddingVertical: 19,
    paddingHorizontal: 115,
  },
  buttonText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19.36,
    color: Colors.text.inverse,
    textAlign: "center",
  },
});
