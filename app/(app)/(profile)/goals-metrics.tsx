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
                  <View style={[styles.goalIconContainer, isSelected && styles.goalIconContainerSelected]}>
                    <Image
                      source={option.icon}
                      style={styles.goalIcon}
                      contentFit="contain"
                    />
                    {isEditing && isSelected && (
                      <View style={styles.checkmarkBadge}>
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={16}
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
            {/* Hologram Image */}
            <Image
              source={bodyImageSource}
              style={[
                styles.hologramImage,
                { transform: [{ scaleY: scaleY }] }
              ]}
              contentFit="contain"
            />

            {/* Scanning Line Animation */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{
                    translateY: scanAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 300] // Adjust based on container height
                    })
                  }]
                }
              ]}
            />

            {/* Metrics Overlay */}
            <View style={styles.metricsOverlay}>
               {/* Left Side Metrics */}
               <View style={styles.metricLeft}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabelHolo}>HEIGHT</Text>
                    <Text style={styles.metricValueHolo}>{onboarding.height || "--"} <Text style={styles.unit}>cm</Text></Text>
                    <View style={styles.connectorLeft} />
                  </View>
                  <View style={[styles.metricItem, { marginTop: 40 }]}>
                    <Text style={styles.metricLabelHolo}>WEIGHT</Text>
                    <Text style={styles.metricValueHolo}>{onboarding.weight || "--"} <Text style={styles.unit}>kg</Text></Text>
                    <View style={styles.connectorLeft} />
                  </View>
                  <View style={[styles.metricItem, { marginTop: 40 }]}>
                    <Text style={styles.metricLabelHolo}>BODY FAT</Text>
                    <Text style={styles.metricValueHolo}>{bodyFat > 0 ? bodyFat.toFixed(1) : "--"} <Text style={styles.unit}>%</Text></Text>
                    <View style={styles.connectorLeft} />
                  </View>
               </View>

               {/* Right Side Metrics */}
               <View style={styles.metricRight}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabelHolo}>AGE</Text>
                    <Text style={styles.metricValueHolo}>{onboarding.age || "--"} <Text style={styles.unit}>yo</Text></Text>
                    <View style={styles.connectorRight} />
                  </View>
                  <View style={[styles.metricItem, { marginTop: 40 }]}>
                    <Text style={styles.metricLabelHolo}>GENDER</Text>
                    <Text style={styles.metricValueHolo}>
                      {onboarding.selectedGender === "male" ? "MALE" : 
                       onboarding.selectedGender === "female" ? "FEMALE" : "--"}
                    </Text>
                    <View style={styles.connectorRight} />
                  </View>
                   <View style={[styles.metricItem, { marginTop: 40 }]}>
                    <Text style={styles.metricLabelHolo}>IDEAL</Text>
                    <Text style={styles.metricValueHolo}>
                      {idealWeightMin.toFixed(0)}-{idealWeightMax.toFixed(0)} <Text style={styles.unit}>kg</Text>
                    </Text>
                    <View style={styles.connectorRight} />
                  </View>
               </View>
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
    gap: 16,
    justifyContent: "space-between", // Better spacing for 2 columns
  },
  goalItem: {
    alignItems: "center",
    width: (width - 48 - 16) / 2, // 2 columns: (screen width - padding - gap) / 2
    gap: 12,
    marginBottom: 16,
  },
  goalItemUnselected: {
    opacity: 0.4,
  },
  goalIconContainer: {
    width: 100, // Significantly larger
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#F8F9FA", // Light background to frame the icon slightly without heavy borders
    borderRadius: 50, // Circular
  },
  goalIconContainerSelected: {
    backgroundColor: Colors.lilac[100], // Highlight selected background
  },
  goalIcon: {
    width: "70%", // Icon takes up most of the container
    height: "70%",
  },
  checkmarkBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text.secondary,
    textAlign: "center",
  },
  goalTitleSelected: {
    color: Colors.lilac[900],
    fontWeight: "700",
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
    backgroundColor: "#050510", // Deep dark blue/black
    borderRadius: 16,
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#1A1A30",
  },
  hologramImage: {
    width: "80%",
    height: "90%",
    opacity: 0.9,
  },
  scanLine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#00FFFF", // Cyan scan line
    shadowColor: "#00FFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  metricsOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  metricLeft: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  metricRight: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  metricItem: {
    marginBottom: 20,
    position: "relative",
  },
  metricLabelHolo: {
    color: "#4A90E2", // Tech blue
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 2,
  },
  metricValueHolo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    textShadowColor: "rgba(74, 144, 226, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  unit: {
    fontSize: 12,
    color: "#8899A6",
    fontWeight: "500",
  },
  connectorLeft: {
    position: "absolute",
    right: -15,
    top: "50%",
    width: 10,
    height: 1,
    backgroundColor: "#4A90E2",
    opacity: 0.5,
  },
  connectorRight: {
    position: "absolute",
    left: -15,
    top: "50%",
    width: 10,
    height: 1,
    backgroundColor: "#4A90E2",
    opacity: 0.5,
  },
});
