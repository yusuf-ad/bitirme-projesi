import { Colors } from "@/constants/theme";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SvgXml } from "react-native-svg";

// SVG Icons as strings
const silverwareIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" fill="#875EC5"/>
</svg>`;

const preferencesIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#875EC5"/>
</svg>`;

const chartPieIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M11.5 2v9.5H2c0 5.52 4.48 10 10 10s10-4.48 10-10-4.48-10-10-10zm1 17.93c-3.95-.49-7-3.85-7-7.93h8v8.93zm0-10.43V3c4.39.54 7.85 4.01 8.39 8.39h-8.39z" fill="#875EC5"/>
</svg>`;

interface MealPlanEmptyStateProps {
  onCreatePress: () => void;
}

export function MealPlanEmptyState({ onCreatePress }: MealPlanEmptyStateProps) {
  return (
    <>
      {/* Hero Image */}
      <View style={styles.imageContainer}>
        <View style={styles.imageWrapper}>
          <Image
            source={require("../../../assets/images/meal-plan-hero.png")}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Features List */}
      <View style={styles.featuresList}>
        {/* Feature 1 */}
        <View style={styles.featureItem}>
          <SvgXml xml={silverwareIcon} width={24} height={24} />
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureText}>
              Meals for breakfast, lunch, and dinner
            </Text>
          </View>
        </View>

        {/* Feature 2 */}
        <View style={styles.featureItem}>
          <SvgXml xml={preferencesIcon} width={24} height={24} />
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureText}>
              Tailored to your goals and preferences
            </Text>
          </View>
        </View>

        {/* Feature 3 */}
        <View style={styles.featureItem}>
          <SvgXml xml={chartPieIcon} width={24} height={24} />
          <View style={styles.featureTextContainer}>
            <Text style={styles.featureText}>
              Balanced proteins, fats, carbs and fiber
            </Text>
          </View>
        </View>
      </View>

      {/* Create Meal Plan Button */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            pressed && styles.createButtonPressed,
          ]}
          onPress={onCreatePress}
        >
          <Text style={styles.buttonText}>+ Create meal plan</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  imageWrapper: {
    backgroundColor: "#F5F2F7",
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
    aspectRatio: 1,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  featuresList: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 24,
    color: "#120F1A",
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  createButton: {
    backgroundColor: Colors.lilac[600],

    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  createButtonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 24,
    color: "#120F1A",
    textAlign: "center",
  },
});
