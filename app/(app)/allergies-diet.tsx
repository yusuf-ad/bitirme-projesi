import { Colors } from "@/constants/theme";
import { useOnboarding } from "@/providers/onboarding-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AllergiesDietScreen() {
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();

  useEffect(() => {
    onboarding.loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (onboarding.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.lilac[900]} />
      </View>
    );
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
        <Text style={styles.headerTitle}>Allergies & Diet</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 20 }]}
      >
        {/* Diet Preferences */}
        {onboarding.selectedDietPreferences.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="leaf"
                size={20}
                color={Colors.lilac[900]}
              />
              <Text style={styles.sectionTitle}>Diet Preferences</Text>
            </View>
            <View style={styles.tagsContainer}>
              {onboarding.selectedDietPreferences.map((diet, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{diet}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Allergies & Dislikes */}
        {onboarding.selectedAllergies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={20}
                color="#EF4444"
              />
              <Text style={styles.sectionTitle}>Allergies & Dislikes</Text>
            </View>
            <View style={styles.tagsContainer}>
              {onboarding.selectedAllergies.map((allergy, index) => (
                <View key={index} style={[styles.tag, styles.allergyTag]}>
                  <Text style={[styles.tagText, styles.allergyTagText]}>
                    {allergy}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {onboarding.selectedDietPreferences.length === 0 &&
          onboarding.selectedAllergies.length === 0 && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="information-outline"
                size={48}
                color={Colors.text.tertiary}
              />
              <Text style={styles.emptyStateText}>
                No dietary restrictions or allergies set
              </Text>
            </View>
          )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
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
  allergyTag: {
    backgroundColor: "#FEE2E2",
  },
  allergyTagText: {
    color: "#DC2626",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    marginTop: 16,
    textAlign: "center",
  },
});
