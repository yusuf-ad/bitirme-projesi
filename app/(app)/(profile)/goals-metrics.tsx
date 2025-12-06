import { ProfessionalLoadingScreen } from "@/components/ProfessionalLoadingScreen";
import { Colors } from "@/constants/theme";
import {
  conflictingGoals,
  goalOptions,
} from "@/features/onboarding/sections/goals/goals-content";
import { useOnboarding } from "@/providers/onboarding-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function GoalsMetricsScreen() {
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [localGoals, setLocalGoals] = useState<string[]>([]);
  
  // Animation for scanning line
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    onboarding.loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalGoals(onboarding.selectedGoals);
  }, [onboarding.selectedGoals]);

  useEffect(() => {
    const startScan = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    startScan();
  }, [scanAnim]);

  const handleToggleGoal = (goalId: string) => {
    let newSelection: string[];

    if (localGoals.includes(goalId)) {
      // Deselect the goal
      newSelection = localGoals.filter((id) => id !== goalId);
    } else {
      // Select the goal and remove any conflicting goals
      const conflictingGoalIds = conflictingGoals[goalId] || [];
      newSelection = [
        ...localGoals.filter((id) => !conflictingGoalIds.includes(id)),
        goalId,
      ];
    }
    setLocalGoals(newSelection);
  };

  const handleSave = async () => {
    await onboarding.saveGoals(localGoals);
    setIsEditing(false);
  };

  if (onboarding.isLoading) {
    return <ProfessionalLoadingScreen />;
  }

  // Calculations
  const heightInMeters = (onboarding.height || 175) / 100;
  const currentWeight = onboarding.weight || 75;
  const bmi = currentWeight / (heightInMeters * heightInMeters);

  const idealWeightMin = 18.5 * (heightInMeters * heightInMeters);
  const idealWeightMax = 24.9 * (heightInMeters * heightInMeters);

  const age = onboarding.age || 25;
  const isMale = onboarding.selectedGender === "male";
  // Deurenberg formula
  const bodyFat = (1.20 * bmi) + (0.23 * age) - (10.8 * (isMale ? 1 : 0)) - 5.4;

  const isMuscularGoal = localGoals.includes("build-muscle");
  
  let bodyImageSource = require("@/assets/images/hologram-body-normal.png");
  
  if (currentWeight > idealWeightMax) {
    bodyImageSource = require("@/assets/images/hologram-body-overweight.png");
  } else if (currentWeight < idealWeightMin) {
    bodyImageSource = require("@/assets/images/hologram-body-skinny.png");
  } else if (isMuscularGoal) {
     // Within ideal range and wants to build muscle
    bodyImageSource = require("@/assets/images/hologram-body-muscular.png");
  }
  // else Normal (default)

  // Scale down if height is less than 170cm
  const scaleY = (onboarding.height || 175) < 170 ? 0.9 : 1.0;

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Goals & Metrics</Text>
        <Pressable
          onPress={isEditing ? handleSave : () => setIsEditing(true)}
          style={styles.editButton}
        >
          <MaterialCommunityIcons
            name={isEditing ? "check" : "pencil-outline"}
            size={24}
            color={Colors.lilac[900]}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="target"
              size={20}
              color={Colors.lilac[900]}
            />
            <Text style={styles.sectionTitle}>Your Goals</Text>
          </View>

          <View style={styles.goalsGrid}>
            {(isEditing ? goalOptions : goalOptions.filter(g => localGoals.includes(g.id))).map((option) => {
              const isSelected = localGoals.includes(option.id);
              
              if (!isEditing && !isSelected) return null;

              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.goalItem,
                    isEditing && !isSelected && styles.goalItemUnselected
                  ]}
                  onPress={isEditing ? () => handleToggleGoal(option.id) : undefined}
                  disabled={!isEditing}
                >
                  <View style={[
                    styles.goalIconCircle,
                    isSelected && styles.goalIconCircleSelected
                  ]}>
                    <Image
                      source={option.icon}
                      style={styles.goalIcon}
                      contentFit="contain"
                    />
                    {isEditing && isSelected && (
                      <View style={styles.checkmarkBadge}>
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={18}
                          color={Colors.green[900]}
                        />
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.goalTitle,
                      isSelected && styles.goalTitleSelected,
                    ]}
                    numberOfLines={2}
                  >
                    {option.title.replace("\n", " ")}
                  </Text>
                </Pressable>
              );
            })}
            {!isEditing && localGoals.length === 0 && (
               <Text style={styles.emptyText}>No goals selected.</Text>
            )}
          </View>
        </View>

        {/* Body Metrics Section - Hologram */}
        <View style={styles.hologramSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="human"
              size={20}
              color={Colors.lilac[900]}
            />
            <Text style={styles.sectionTitle}>Body Metrics</Text>
          </View>

          <View style={styles.hologramContainer}>
            {/* Hologram Image - Full Background */}
            <Image
              source={bodyImageSource}
              style={[
                styles.hologramImage,
                { transform: [{ scaleY: scaleY }] }
              ]}
              contentFit="cover"
            />

            {/* Scanning Line Animation */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{
                    translateY: scanAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 340]
                    })
                  }]
                }
              ]}
            />

            {/* Metrics Overlay */}
            <View style={styles.metricsOverlay}>
               {/* Left Side Metrics */}
               <View style={styles.metricLeft}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabelHolo}>HEIGHT</Text>
                    <Text style={styles.metricValueHolo}>{onboarding.height || "--"}<Text style={styles.unit}> cm</Text></Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabelHolo}>WEIGHT</Text>
                    <Text style={styles.metricValueHolo}>{onboarding.weight || "--"}<Text style={styles.unit}> kg</Text></Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricLabelHolo}>BODY FAT</Text>
                    <Text style={styles.metricValueHolo}>{bodyFat > 0 ? bodyFat.toFixed(1) : "--"}<Text style={styles.unit}> %</Text></Text>
                  </View>
               </View>

               {/* Right Side Metrics */}
               <View style={styles.metricRight}>
                  <View style={[styles.metricCard, styles.metricCardRight]}>
                    <Text style={styles.metricLabelHolo}>AGE</Text>
                    <Text style={styles.metricValueHolo}>{onboarding.age || "--"}<Text style={styles.unit}> yo</Text></Text>
                  </View>
                  <View style={[styles.metricCard, styles.metricCardRight]}>
                    <Text style={styles.metricLabelHolo}>GENDER</Text>
                    <Text style={styles.metricValueHolo}>
                      {onboarding.selectedGender === "male" ? "M" : 
                       onboarding.selectedGender === "female" ? "F" : "--"}
                    </Text>
                  </View>
                  <View style={[styles.metricCard, styles.metricCardRight]}>
                    <Text style={styles.metricLabelHolo}>IDEAL</Text>
                    <Text style={styles.metricValueHolo}>
                      {idealWeightMin.toFixed(0)}-{idealWeightMax.toFixed(0)}<Text style={styles.unit}> kg</Text>
                    </Text>
                  </View>
               </View>
            </View>

            {/* BMI Badge */}
            <View style={styles.bmiBadge}>
              <Text style={styles.bmiLabel}>BMI</Text>
              <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  editButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  // Goals Styles
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 20,
  },
  goalItem: {
    width: (width - 72) / 4,
    alignItems: "center",
  },
  goalItemUnselected: {
    opacity: 0.4,
  },
  goalIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  goalIconCircleSelected: {
    backgroundColor: "#F0EDFF",
    borderColor: Colors.lilac[400],
  },
  goalIcon: {
    width: 56,
    height: 56,
  },
  checkmarkBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#fff",
    borderRadius: 10,
    zIndex: 10,
  },
  goalTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 16,
  },
  goalTitleSelected: {
    color: Colors.lilac[900],
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontStyle: "italic",
    textAlign: "center",
    width: "100%",
    marginTop: 20,
  },
  // Hologram Styles
  hologramSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
  },
  hologramContainer: {
    height: 400,
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
  },
  hologramImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 1,
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#00FFFF",
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 5,
    zIndex: 10,
  },
  metricsOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 35,
    zIndex: 5,
  },
  metricLeft: {
    justifyContent: "space-between",
  },
  metricRight: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  metricCard: {
    backgroundColor: "rgba(0, 20, 40, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#00FFFF",
  },
  metricCardRight: {
    borderLeftWidth: 0,
    borderRightWidth: 2,
    borderRightColor: "#00FFFF",
    alignItems: "flex-end",
  },
  metricLabelHolo: {
    color: "#00FFFF",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 2,
    opacity: 0.8,
  },
  metricValueHolo: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    textShadowColor: "rgba(0, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  unit: {
    fontSize: 11,
    color: "#66CCCC",
    fontWeight: "500",
  },
  bmiBadge: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    backgroundColor: "rgba(0, 255, 255, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 255, 255, 0.3)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 5,
  },
  bmiLabel: {
    color: "#00FFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  bmiValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
