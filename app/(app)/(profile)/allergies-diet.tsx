import { ProfessionalLoadingScreen } from "@/components/ProfessionalLoadingScreen";
import { Colors } from "@/constants/theme";
import {
  resolveAllergiesFast,
  resolveDietPreferences,
  type DisplayAllergy,
  type DisplayDietPreference
} from "@/lib/allergies-diet-helpers";
import { useOnboarding } from "@/providers/onboarding-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AllergiesDietScreen() {
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();
  const [dietItems, setDietItems] = useState<DisplayDietPreference[]>([]);
  const [allergyItems, setAllergyItems] = useState<DisplayAllergy[]>([]);

  useEffect(() => {
    onboarding.loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Resolve IDs to display data when onboarding data loads
    if (!onboarding.isLoading) {
      // Resolve diet preferences
      const diets = resolveDietPreferences(onboarding.selectedDietPreferences);
      setDietItems(diets);
      
      // Resolve allergies (fast version without API calls)
      const allergies = resolveAllergiesFast(onboarding.selectedAllergies);
      setAllergyItems(allergies);
    }
  }, [onboarding.isLoading, onboarding.selectedDietPreferences, onboarding.selectedAllergies]);

  if (onboarding.isLoading) {
    return <ProfessionalLoadingScreen />;
  }

  const renderDietItem = ({ item }: { item: DisplayDietPreference }) => (
    <View style={styles.gridItem}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.dietImage} />
      </View>
      <Text style={styles.gridItemLabel} numberOfLines={2}>
        {item.label}
      </Text>
    </View>
  );

  const renderAllergyItem = ({ item }: { item: DisplayAllergy }) => (
    <View style={[styles.gridItem, styles.allergyGridItem]}>
      <View style={[styles.imageContainer, styles.allergyImageContainer]}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.allergyImage}
            defaultSource={require("@/assets/images/empty-pantry.png")}
          />
        ) : (
          <View style={styles.allergyImagePlaceholder}>
            <MaterialCommunityIcons name="food-off" size={24} color="#EF4444" />
          </View>
        )}
      </View>
      <Text style={[styles.gridItemLabel, styles.allergyLabel]} numberOfLines={2}>
        {item.name}
      </Text>
    </View>
  );

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
        {/* Diet Preferences Section */}
        {dietItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="leaf"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Diet Preferences</Text>
                <Text style={styles.sectionSubtitle}>
                  {dietItems.length} preference{dietItems.length !== 1 ? "s" : ""} selected
                </Text>
              </View>
            </View>
            
            <FlatList
              data={dietItems}
              renderItem={renderDietItem}
              numColumns={3}
              keyExtractor={(item) => `diet-${item.id}`}
              scrollEnabled={false}
              contentContainerStyle={styles.gridContainer}
              columnWrapperStyle={styles.gridRow}
            />
          </View>
        )}

        {/* Allergies & Dislikes Section */}
        {allergyItems.length > 0 && (
          <View style={[styles.section, styles.allergySection]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.iconContainer, styles.allergyIconContainer]}>
                <MaterialCommunityIcons
                  name="alert-circle-outline"
                  size={20}
                  color="#FFFFFF"
                />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Allergies & Dislikes</Text>
                <Text style={styles.sectionSubtitle}>
                  {allergyItems.length} item{allergyItems.length !== 1 ? "s" : ""} avoided
                </Text>
              </View>
            </View>
            
            <FlatList
              data={allergyItems}
              renderItem={renderAllergyItem}
              numColumns={3}
              keyExtractor={(item) => `allergy-${item.id}`}
              scrollEnabled={false}
              contentContainerStyle={styles.gridContainer}
              columnWrapperStyle={styles.gridRow}
            />
          </View>
        )}

        {/* Empty State */}
        {dietItems.length === 0 && allergyItems.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyStateIconContainer}>
              <MaterialCommunityIcons
                name="information-outline"
                size={48}
                color={Colors.lilac[500]}
              />
            </View>
            <Text style={styles.emptyStateTitle}>No restrictions set</Text>
            <Text style={styles.emptyStateText}>
              You haven't set any dietary preferences or allergies yet.
            </Text>
            <Pressable 
              style={styles.emptyStateButton}
              onPress={() => router.push("/(onboarding)/flow")}
            >
              <Text style={styles.emptyStateButtonText}>Set Preferences</Text>
            </Pressable>
          </View>
        )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E8E3ED",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.lilac[100],
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    fontFamily: "Inter",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E3ED",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  allergySection: {
    borderColor: "#FEE2E2",
    backgroundColor: "#FFF5F5",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lilac[500],
    alignItems: "center",
    justifyContent: "center",
  },
  allergyIconContainer: {
    backgroundColor: "#EF4444",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    fontFamily: "Inter",
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontFamily: "Inter",
    fontWeight: "500",
  },
  gridContainer: {
    gap: 12,
  },
  gridRow: {
    gap: 12,
  },
  gridItem: {
    flex: 1,
    maxWidth: "31%",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E3ED",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  allergyGridItem: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FECACA",
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.lilac[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  allergyImageContainer: {
    backgroundColor: "#FEE2E2",
  },
  dietImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "cover",
  },
  allergyImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: "cover",
  },
  allergyImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  gridItemLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
    fontFamily: "Inter",
    textAlign: "center",
    lineHeight: 16,
  },
  allergyLabel: {
    color: "#DC2626",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lilac[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    fontFamily: "Inter",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.text.tertiary,
    fontFamily: "Inter",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: Colors.lilac[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter",
  },
});
