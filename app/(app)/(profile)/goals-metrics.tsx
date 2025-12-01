import { ProfessionalLoadingScreen } from "@/components/ProfessionalLoadingScreen";
import { Colors } from "@/constants/theme";
import { useOnboarding } from "@/providers/onboarding-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GoalsMetricsScreen() {
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();

  useEffect(() => {
    onboarding.loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (onboarding.isLoading) {
    return <ProfessionalLoadingScreen />;
  }

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
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 20 }]}
      >
        {/* Goals Section */}
        {onboarding.selectedGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="target"
                size={20}
                color={Colors.lilac[900]}
              />
              <Text style={styles.sectionTitle}>Your Goals</Text>
            </View>
            <View style={styles.tagsContainer}>
              {onboarding.selectedGoals.map((goal, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Body Metrics Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="human"
              size={20}
              color={Colors.lilac[900]}
            />
            <Text style={styles.sectionTitle}>Body Metrics</Text>
          </View>

          <View style={styles.metricsGrid}>
            {onboarding.selectedGender && (
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Gender</Text>
                <Text style={styles.metricValue}>
                  {onboarding.selectedGender === "male"
                    ? "Male"
                    : onboarding.selectedGender === "female"
                    ? "Female"
                    : "Prefer not to say"}
                </Text>
              </View>
            )}

            {onboarding.age && (
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Age</Text>
                <Text style={styles.metricValue}>{onboarding.age} years</Text>
              </View>
            )}

            {onboarding.height && (
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Height</Text>
                <Text style={styles.metricValue}>{onboarding.height} cm</Text>
              </View>
            )}

            {onboarding.weight && (
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Weight</Text>
                <Text style={styles.metricValue}>{onboarding.weight} kg</Text>
              </View>
            )}
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
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.lilac[100],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: Colors.lilac[900],
    fontWeight: "500",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#F8F8F8",
    padding: 16,
    borderRadius: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
});
