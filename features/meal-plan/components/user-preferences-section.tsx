import { Colors } from "@/constants/theme";
import {
  DisplayAllergy,
  DisplayDietPreference,
} from "@/lib/allergies-diet-helpers";
import { MaterialIcons } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { InfoChip } from "./ai-generator-chips";

// Allergy Card Component with image
function AllergyCard({ allergy }: { allergy: DisplayAllergy }) {
  return (
    <View style={styles.allergyCard}>
      {allergy.imageUrl ? (
        <Image
          source={{ uri: allergy.imageUrl }}
          style={styles.allergyImage}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.allergyImage, styles.allergyImagePlaceholder]}>
          <MaterialIcons name="no-food" size={20} color={Colors.gray[400]} />
        </View>
      )}
      <Text style={styles.allergyName} numberOfLines={2}>
        {allergy.name}
      </Text>
    </View>
  );
}

// Diet Preference Card Component with image
function DietCard({ diet }: { diet: DisplayDietPreference }) {
  const imageSource =
    typeof diet.image === "object" && "uri" in diet.image
      ? diet.image
      : diet.image;

  return (
    <View style={styles.dietCard}>
      <Image source={imageSource} style={styles.dietImage} resizeMode="cover" />
      <Text style={styles.dietName} numberOfLines={2}>
        {diet.label}
      </Text>
    </View>
  );
}

// Goal display info
export interface DisplayGoal {
  id: string;
  title: string;
}

// Cooking skill display info
export interface DisplayCookingSkill {
  id: string;
  emoji: string;
  label: string;
}

interface UserPreferencesSectionProps {
  allergies: DisplayAllergy[];
  dietPreferences: DisplayDietPreference[];
  cuisines: string[];
  dislikedCuisines?: string[];
  goals?: DisplayGoal[];
  cookingSkill?: DisplayCookingSkill | null;
}

export function UserPreferencesSection({
  allergies,
  dietPreferences,
  cuisines,
  dislikedCuisines = [],
  goals = [],
  cookingSkill,
}: UserPreferencesSectionProps) {
  const hasPreferences =
    allergies.length > 0 ||
    dietPreferences.length > 0 ||
    cuisines.length > 0 ||
    dislikedCuisines.length > 0 ||
    goals.length > 0 ||
    !!cookingSkill;

  if (!hasPreferences) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your Preferences</Text>
      <Text style={styles.sectionSubtitle}>Based on your profile settings</Text>

      {/* Goals */}
      {goals.length > 0 && (
        <View style={styles.preferenceGroup}>
          <Text style={styles.preferenceLabel}>Your Goals</Text>
          <View style={styles.infoChipsContainer}>
            {goals.map((goal) => (
              <InfoChip
                key={goal.id}
                label={goal.title.replace("\n", " ")}
                variant="positive"
              />
            ))}
          </View>
        </View>
      )}

      {/* Cooking Skill */}
      {cookingSkill && (
        <View style={styles.preferenceGroup}>
          <Text style={styles.preferenceLabel}>Cooking Skill</Text>
          <View style={styles.cookingSkillChip}>
            <Text style={styles.cookingSkillEmoji}>{cookingSkill.emoji}</Text>
            <Text style={styles.cookingSkillLabel}>{cookingSkill.label}</Text>
          </View>
        </View>
      )}

      {/* Allergies */}
      {allergies.length > 0 && (
        <View style={styles.preferenceGroup}>
          <Text style={styles.preferenceLabel}>Allergies & Dislikes</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalCardsContainer}
          >
            {allergies.map((allergy) => (
              <AllergyCard key={allergy.id} allergy={allergy} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Diet Preferences */}
      {dietPreferences.length > 0 && (
        <View style={styles.preferenceGroup}>
          <Text style={styles.preferenceLabel}>Diet</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalCardsContainer}
          >
            {dietPreferences.map((diet) => (
              <DietCard key={diet.id} diet={diet} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Cuisines */}
      {cuisines.length > 0 && (
        <View style={styles.preferenceGroup}>
          <Text style={styles.preferenceLabel}>Favorite Cuisines</Text>
          <View style={styles.infoChipsContainer}>
            {cuisines.map((cuisine) => (
              <InfoChip key={cuisine} label={cuisine} />
            ))}
          </View>
        </View>
      )}

      {/* Disliked Cuisines */}
      {dislikedCuisines.length > 0 && (
        <View style={styles.preferenceGroup}>
          <Text style={styles.preferenceLabel}>Disliked Cuisines</Text>
          <View style={styles.infoChipsContainer}>
            {dislikedCuisines.map((cuisine) => (
              <InfoChip key={cuisine} label={cuisine} variant="negative" />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: -8,
  },
  preferenceGroup: {
    gap: 8,
  },
  preferenceLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text.secondary,
  },
  infoChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  horizontalCardsContainer: {
    gap: 8,
  },
  allergyCard: {
    alignItems: "center",
    gap: 8,
    width: 64,
  },
  allergyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background.surface,
    borderWidth: 2,
    borderColor: Colors.semantic.error.light,
  },
  allergyImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  allergyName: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text.primary,
    textAlign: "center",
  },
  dietCard: {
    alignItems: "center",
    gap: 8,
    width: 100,
  },
  dietImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
  },
  dietName: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text.primary,
    textAlign: "center",
  },
  cookingSkillChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.lilac[100],
    borderRadius: 99,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.lilac[300],
  },
  cookingSkillEmoji: {
    fontSize: 18,
  },
  cookingSkillLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.lilac[900],
  },
});
