import { ProfessionalLoadingScreen } from "@/components/ProfessionalLoadingScreen";
import { getThemeColors } from "@/constants/theme";
import { TasteAllergies, TasteDietPreferences } from "@/features/onboarding/sections/taste";
import { useHaptics } from "@/hooks/useHaptics";
import { useLanguage } from "@/hooks/useLanguage";
import {
  resolveAllergiesFast,
  resolveDietPreferences,
  type DisplayAllergy,
  type DisplayDietPreference,
} from "@/lib/allergies-diet-helpers";
import { supabase } from "@/lib/supabase";
import { updateUserTastePreferences } from "@/lib/supabase-onboarding";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
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
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AllergiesDietScreen() {
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);
  const { selection } = useHaptics();
  const [dietItems, setDietItems] = useState<DisplayDietPreference[]>([]);
  const [allergyItems, setAllergyItems] = useState<DisplayAllergy[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDietEditModalVisible, setIsDietEditModalVisible] = useState(false);
  const [tempSelectedAllergies, setTempSelectedAllergies] = useState<string[]>([]);
  const [tempSelectedDiets, setTempSelectedDiets] = useState<string[]>([]);

  useEffect(() => {
    onboarding.loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!onboarding.isLoading) {
      const diets = resolveDietPreferences(onboarding.selectedDietPreferences);
      setDietItems(diets);
      const allergies = resolveAllergiesFast(onboarding.selectedAllergies);
      setAllergyItems(allergies);
    }
  }, [onboarding.isLoading, onboarding.selectedDietPreferences, onboarding.selectedAllergies]);

  if (onboarding.isLoading) {
    return <ProfessionalLoadingScreen />;
  }

  const renderDietChip = ({ item }: { item: DisplayDietPreference }) => (
    <View style={[styles.chip, { backgroundColor: Colors.background.surface }]}>
      <Image source={item.image} style={styles.chipImage} />
      <Text style={[styles.chipLabel, { color: Colors.text.primary }]} numberOfLines={1}>
        {item.label}
      </Text>
    </View>
  );

  const renderAllergyChip = ({ item }: { item: DisplayAllergy }) => (
    <View style={[styles.chip, styles.allergyChip]}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.chipImage}
          defaultSource={require("@/assets/images/empty-pantry.png")}
        />
      ) : (
        <View style={styles.allergyChipIcon}>
          <MaterialCommunityIcons name="food-off" size={16} color="#EF4444" />
        </View>
      )}
      <Text style={[styles.chipLabel, styles.allergyChipLabel]} numberOfLines={1}>
        {item.name}
      </Text>
    </View>
  );

  const handleEditDiets = () => {
    selection();
    setTempSelectedDiets(onboarding.selectedDietPreferences);
    setIsDietEditModalVisible(true);
  };

  const handleSaveDiets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user logged in");
        return;
      }

      // Update local state
      onboarding.setSelectedDietPreferences(tempSelectedDiets);
      
      // Save directly to Supabase
      await updateUserTastePreferences(user.id, {
        diet_preferences: tempSelectedDiets,
      });

      setIsDietEditModalVisible(false);
    } catch (error) {
      console.error("Error saving diets:", error);
      setTempSelectedDiets(onboarding.selectedDietPreferences);
    }
  };

  const handleCloseDietModal = () => {
    setIsDietEditModalVisible(false);
    setTempSelectedDiets(onboarding.selectedDietPreferences);
  };

  const handleEditAllergies = () => {
    selection();
    setTempSelectedAllergies(onboarding.selectedAllergies);
    setIsEditModalVisible(true);
  };

  const handleSaveAllergies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user logged in");
        return;
      }

      // Update local state
      onboarding.setSelectedAllergies(tempSelectedAllergies);
      
      // Save directly to Supabase
      await updateUserTastePreferences(user.id, {
        allergies_dislikes: tempSelectedAllergies,
      });

      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Error saving allergies:", error);
      setTempSelectedAllergies(onboarding.selectedAllergies);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalVisible(false);
    setTempSelectedAllergies(onboarding.selectedAllergies);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background.secondary, paddingTop: top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.background.surface }]}>
        <Pressable
          onPress={() => {
            selection();
            router.back();
          }}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>
          {t("allergiesDiet.title")}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View entering={FadeInUp.delay(50).springify()} style={styles.heroSection}>
          <LinearGradient
            colors={[Colors.lilac[100], Colors.lilac[200]]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroEmoji}>🥗</Text>
              <View style={styles.heroTextContainer}>
                <Text style={[styles.heroTitle, { color: Colors.lilac[900] }]}>
                  {t("allergiesDiet.heroTitle") || "Your Diet Profile"}
                </Text>
                <Text style={[styles.heroSubtitle, { color: Colors.text.secondary }]}>
                  {t("allergiesDiet.heroSubtitle") || "Manage your dietary preferences and restrictions"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsContainer}>
          <View style={[styles.statChip, { backgroundColor: `${Colors.lilac[900]}12` }]}>
            <MaterialCommunityIcons name="leaf" size={14} color={Colors.lilac[900]} />
            <Text style={[styles.statChipValue, { color: Colors.lilac[900] }]}>{dietItems.length}</Text>
            <Text style={[styles.statChipLabel, { color: Colors.text.secondary }]}>
              {t("allergiesDiet.diets") || "Diets"}
            </Text>
          </View>
          
          <View style={[styles.statChip, { backgroundColor: "#EF444410" }]}>
            <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#EF4444" />
            <Text style={[styles.statChipValue, { color: "#EF4444" }]}>{allergyItems.length}</Text>
            <Text style={[styles.statChipLabel, { color: Colors.text.secondary }]}>
              {t("allergiesDiet.allergies") || "Allergies"}
            </Text>
          </View>
        </Animated.View>

        {/* Diet Preferences Section */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: `${Colors.lilac[900]}15` }]}>
              <MaterialCommunityIcons name="leaf" size={18} color={Colors.lilac[900]} />
            </View>
            <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>
              {t("allergiesDiet.dietPreferences")}
            </Text>
            <Pressable
              onPress={handleEditDiets}
              style={[styles.editButton, { backgroundColor: `${Colors.lilac[900]}10` }]}
            >
              <MaterialCommunityIcons name="pencil" size={16} color={Colors.lilac[900]} />
              <Text style={[styles.editButtonText, { color: Colors.lilac[900] }]}>
                {t("common.edit") || "Edit"}
              </Text>
            </Pressable>
          </View>
          
          {dietItems.length > 0 ? (
            <FlatList
              data={dietItems}
              renderItem={renderDietChip}
              keyExtractor={(item) => `diet-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipList}
            />
          ) : (
            <Pressable
              onPress={handleEditDiets}
              style={[styles.emptyChipList, { borderColor: Colors.gray[300] }]}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={20} color={Colors.text.secondary} />
              <Text style={[styles.emptyChipText, { color: Colors.text.secondary }]}>
                {t("allergiesDiet.addDiets") || "Add diet preferences"}
              </Text>
            </Pressable>
          )}
        </Animated.View>

        {/* Allergies Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: "#EF444415" }]}>
              <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#EF4444" />
            </View>
            <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>
              {t("allergiesDiet.allergiesTitle")}
            </Text>
            <Pressable
              onPress={handleEditAllergies}
              style={[styles.editButton, { backgroundColor: "#EF444410" }]}
            >
              <MaterialCommunityIcons name="pencil" size={16} color="#EF4444" />
              <Text style={styles.editButtonText}>{t("common.edit") || "Edit"}</Text>
            </Pressable>
          </View>
          
          {allergyItems.length > 0 ? (
            <FlatList
              data={allergyItems}
              renderItem={renderAllergyChip}
              keyExtractor={(item) => `allergy-${item.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipList}
            />
          ) : (
            <Pressable
              onPress={handleEditAllergies}
              style={[styles.emptyChipList, { borderColor: Colors.gray[300] }]}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={20} color={Colors.text.secondary} />
              <Text style={[styles.emptyChipText, { color: Colors.text.secondary }]}>
                {t("allergiesDiet.addAllergies") || "Add allergies or dislikes"}
              </Text>
            </Pressable>
          )}
        </Animated.View>

        {/* Info Card */}
        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.infoCard}>
          <LinearGradient colors={["#FEF3C7", "#FDE68A"]} style={styles.infoGradient}>
            <View style={styles.infoContent}>
              <Text style={styles.infoEmoji}>💡</Text>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoTitle}>{t("allergiesDiet.infoTitle") || "Why this matters"}</Text>
                <Text style={styles.infoText}>
                  {t("allergiesDiet.infoText") || "Your dietary preferences help us filter recipes and create personalized meal plans that work for you."}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Empty State */}
        {dietItems.length === 0 && allergyItems.length === 0 && (
          <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.emptyState}>
            <View style={[styles.emptyStateIcon, { backgroundColor: Colors.lilac[100] }]}>
              <MaterialCommunityIcons name="food-variant" size={40} color={Colors.lilac[900]} />
            </View>
            <Text style={[styles.emptyStateTitle, { color: Colors.text.primary }]}>
              {t("allergiesDiet.noRestrictions")}
            </Text>
            <Text style={[styles.emptyStateText, { color: Colors.text.secondary }]}>
              {t("allergiesDiet.noRestrictionsDesc")}
            </Text>
            <Pressable
              style={[styles.emptyStateButton, { backgroundColor: Colors.lilac[900] }]}
              onPress={() => router.push("/(onboarding)/flow")}
            >
              <Text style={styles.emptyStateButtonText}>{t("allergiesDiet.setPreferences")}</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" onRequestClose={handleCloseModal}>
        <View style={[styles.modalContainer, { backgroundColor: Colors.background.secondary, paddingTop: top }]}>
          <View style={[styles.modalHeader, { backgroundColor: Colors.background.surface }]}>
            <Pressable onPress={handleCloseModal} style={styles.modalCloseButton}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.text.primary} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: Colors.text.primary }]}>
              {t("allergiesDiet.editAllergies")}
            </Text>
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
          <View style={[styles.modalFooter, { paddingBottom: bottom + 16 }]}>
            <Pressable
              onPress={handleSaveAllergies}
              style={[styles.saveButton, { backgroundColor: Colors.lilac[900] }]}
            >
              <Text style={styles.saveButtonText}>{t("allergiesDiet.saveChanges")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Diet Edit Modal */}
      <Modal visible={isDietEditModalVisible} animationType="slide" onRequestClose={handleCloseDietModal}>
        <View style={[styles.modalContainer, { backgroundColor: Colors.background.secondary, paddingTop: top }]}>
          <View style={[styles.modalHeader, { backgroundColor: Colors.background.surface }]}>
            <Pressable onPress={handleCloseDietModal} style={styles.modalCloseButton}>
              <MaterialCommunityIcons name="close" size={24} color={Colors.text.primary} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: Colors.text.primary }]}>
              {t("allergiesDiet.editDiets") || "Edit Diet Preferences"}
            </Text>
            <View style={styles.modalHeaderRight} />
          </View>
          <View style={styles.modalContent}>
            <TasteDietPreferences
              title="Diet Preferences"
              description="Do you follow any specific diet?"
              onSelectionChange={setTempSelectedDiets}
              initialSelection={tempSelectedDiets}
            />
          </View>
          <View style={[styles.modalFooter, { paddingBottom: bottom + 16 }]}>
            <Pressable
              onPress={handleSaveDiets}
              style={[styles.saveButton, { backgroundColor: Colors.lilac[900] }]}
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
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 40,
  },
  content: {
    paddingVertical: 16,
    gap: 16,
  },
  // Hero
  heroSection: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  heroGradient: {
    padding: 14,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroEmoji: {
    fontSize: 28,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  // Stats
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  statChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
  },
  statChipValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  statChipLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  // Section
  section: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },
  chipList: {
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  allergyChip: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  chipImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  allergyChipIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  allergyChipLabel: {
    color: "#DC2626",
  },
  emptyChipList: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
  },
  emptyChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  // Info Card
  infoCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  infoGradient: {
    padding: 14,
  },
  infoContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  infoEmoji: {
    fontSize: 20,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 16,
    color: "#78350F",
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  // Modal
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  modalHeaderRight: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  modalFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
