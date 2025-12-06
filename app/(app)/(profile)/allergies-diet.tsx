import { ProfessionalLoadingScreen } from "@/components/ProfessionalLoadingScreen";
import { Colors } from "@/constants/theme";
import { TasteAllergies } from "@/features/onboarding/sections/taste";
import { useLanguage } from "@/hooks/useLanguage";
import {
    resolveAllergiesFast,
    resolveDietPreferences,
    type DisplayAllergy,
    type DisplayDietPreference
} from "@/lib/allergies-diet-helpers";
import { supabase } from "@/lib/supabase";
import { useOnboarding } from "@/providers/onboarding-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    FlatList,
    Image,
    Modal,
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
  const { t } = useLanguage();
  const [dietItems, setDietItems] = useState<DisplayDietPreference[]>([]);
  const [allergyItems, setAllergyItems] = useState<DisplayAllergy[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [tempSelectedAllergies, setTempSelectedAllergies] = useState<string[]>([]);

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

  const handleEditAllergies = () => {
    setTempSelectedAllergies(onboarding.selectedAllergies);
    setIsEditModalVisible(true);
  };

  const handleSaveAllergies = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user logged in");
        alert("Error: You must be logged in to save allergies");
        return;
      }

      console.log("Saving allergies for user:", user.id);
      console.log("New allergies list:", tempSelectedAllergies);

      // Update local state first
      onboarding.setSelectedAllergies(tempSelectedAllergies);
      
      // Prepare complete taste preferences data
      const tasteData = {
        meal_types: onboarding.selectedMeals,
        cuisines: onboarding.selectedCuisines,
        allergies_dislikes: tempSelectedAllergies, // NEW allergies list
        diet_preferences: onboarding.selectedDietPreferences,
        cooking_skill_level: onboarding.selectedCookingSkill || null,
        diet_nutrition_targets: onboarding.dietNutritionTargets,
        cuisine_dislikes: onboarding.dislikedCuisines,
      };

      // First check if user taste preferences exist
      const { data: existingPrefs, error: fetchError } = await supabase
        .from('user_taste_preferences')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Error fetching taste preferences:", fetchError);
        throw fetchError;
      }

      let result;
      if (!existingPrefs) {
        // Create new taste preferences if they don't exist
        console.log("Creating new user taste preferences");
        result = await supabase
          .from('user_taste_preferences')
          .insert({
            user_id: user.id,
            ...tasteData
          });
      } else {
        // Update existing taste preferences
        console.log("Updating existing user taste preferences");
        result = await supabase
          .from('user_taste_preferences')
          .update(tasteData)
          .eq('user_id', user.id);
      }

      if (result.error) {
        console.error("Supabase error:", result.error);
        alert(`Database error: ${result.error.message}`);
        throw result.error;
      }

      console.log("Successfully saved to Supabase");

      // Also update AsyncStorage for consistency
      await AsyncStorage.setItem(
        "onboarding_taste",
        JSON.stringify(tasteData)
      );

      console.log("Successfully saved allergies to Supabase:", tempSelectedAllergies);
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Error saving allergies:", error);
      alert(`Error saving allergies: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Revert on error
      setTempSelectedAllergies(onboarding.selectedAllergies);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalVisible(false);
    setTempSelectedAllergies(onboarding.selectedAllergies);
  };

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
        <Text style={styles.headerTitle}>{t("allergiesDiet.title")}</Text>
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
                <Text style={styles.sectionTitle}>{t("allergiesDiet.dietPreferences")}</Text>
                <Text style={styles.sectionSubtitle}>
                  {dietItems.length} {dietItems.length !== 1 ? t("allergiesDiet.preferencesSelectedPlural") : t("allergiesDiet.preferencesSelected")} {t("allergiesDiet.selected")}
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
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>{t("allergiesDiet.allergiesTitle")}</Text>
                <Text style={styles.sectionSubtitle}>
                  {allergyItems.length} {allergyItems.length !== 1 ? t("allergiesDiet.itemsAvoidedPlural") : t("allergiesDiet.itemsAvoided")} {t("allergiesDiet.avoided")}
                </Text>
              </View>
              <Pressable onPress={handleEditAllergies} style={styles.editButton}>
                <MaterialCommunityIcons name="pencil" size={20} color="#EF4444" />
              </Pressable>
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
            <Text style={styles.emptyStateTitle}>{t("allergiesDiet.noRestrictions")}</Text>
            <Text style={styles.emptyStateText}>
              {t("allergiesDiet.noRestrictionsDesc")}
            </Text>
            <Pressable
              style={styles.emptyStateButton}
              onPress={() => router.push("/(onboarding)/flow")}
            >
              <Text style={styles.emptyStateButtonText}>{t("allergiesDiet.setPreferences")}</Text>
            </Pressable>
          </View>
        )}

        {/* Add Allergies Button (when no allergies but has diets) */}
        {allergyItems.length === 0 && dietItems.length > 0 && (
          <Pressable
            style={styles.addAllergiesButton}
            onPress={handleEditAllergies}
          >
            <View style={styles.addAllergiesIcon}>
              <MaterialCommunityIcons name="plus" size={24} color="#EF4444" />
            </View>
            <Text style={styles.addAllergiesText}>{t("allergiesDiet.addAllergies")}</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Edit Allergies Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={handleCloseModal} style={styles.modalCloseButton}>
              <MaterialCommunityIcons name="close" size={24} color="#000000" />
            </Pressable>
            <Text style={styles.modalTitle}>{t("allergiesDiet.editAllergies")}</Text>
            <View style={styles.modalHeaderRight} />
          </View>
          <View style={styles.modalContent}>
            <TasteAllergies
              title="Allergies & Dislikes"
              description="What products do you dislike or don't eat?"
              onSelectionChange={setTempSelectedAllergies}
              initialSelection={tempSelectedAllergies}
            />
          </View>
          <View style={styles.modalFooter}>
            <Pressable
              onPress={handleSaveAllergies}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>{t("allergiesDiet.saveChanges")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  editButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    marginLeft: 8,
  },
  addAllergiesButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#FECACA",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
  },
  addAllergiesIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  addAllergiesText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
    fontFamily: "Inter",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E8E3ED",
    backgroundColor: "#FFFFFF",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    fontFamily: "Inter",
  },
  modalHeaderRight: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8E3ED",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButton: {
    backgroundColor: Colors.lilac[900],
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    fontFamily: "Inter",
    letterSpacing: 0.5,
  },
});
