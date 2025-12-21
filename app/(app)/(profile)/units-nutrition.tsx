import { NumericInputModal } from "@/components/NumericInputModal";
import { RulerPickerModal } from "@/components/RulerPickerModal";
import { getThemeColors } from "@/constants/theme";
import { DIET_OPTIONS } from "@/features/onboarding/sections/taste/diet-options";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabase";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function UnitsNutritionScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);
  const onboarding = useOnboarding();
  const router = useRouter();
  const { t } = useLanguage();

  const [weight, setWeight] = useState(onboarding.weight?.toString() || "");
  const [height, setHeight] = useState(onboarding.height?.toString() || "");
  const [age, setAge] = useState(onboarding.age?.toString() || "");
  const [gender, setGender] = useState(onboarding.selectedGender || "");

  // Nutrition State
  const selectedDietId = onboarding.selectedDietPreferences?.[0];
  
  // Default values (matching daily-overview.tsx)
  let targetCalories = 2200;
  let targetCarbs = 275;
  let targetProtein = 138;
  let targetFat = 61;

  if (selectedDietId) {
    const customTarget = onboarding.dietNutritionTargets?.[selectedDietId];
    
    if (customTarget) {
        // User has custom targets - use defaults if values are undefined
        targetCalories = customTarget.calories ?? 2200;
        targetCarbs = customTarget.carbs ?? 275;
        targetProtein = customTarget.protein ?? 138;
        targetFat = customTarget.fat ?? 61;
    } else {
        // Fallback to diet option defaults
        const dietOption = DIET_OPTIONS.find(d => d.id === selectedDietId);
        if (dietOption) {
            targetCalories = dietOption.targetCalories ?? 2200;
            targetCarbs = Math.round((targetCalories * (dietOption.defaultMacros?.carbohydrates ?? 0.5)) / 4);
            targetProtein = Math.round((targetCalories * (dietOption.defaultMacros?.protein ?? 0.25)) / 4);
            targetFat = Math.round((targetCalories * (dietOption.defaultMacros?.fat ?? 0.25)) / 9);
        }
    }
  }

  // Derived values (Read-only)
  const calories = targetCalories.toString();
  const protein = targetProtein.toString();
  const carbs = targetCarbs.toString();
  const fat = targetFat.toString();

  // Modal State
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    if (!onboarding.isLoading) {
      setWeight(onboarding.weight?.toString() || "");
      setHeight(onboarding.height?.toString() || "");
      setAge(onboarding.age?.toString() || "");
      setGender(onboarding.selectedGender || "");
    }
  }, [onboarding.isLoading, onboarding.weight, onboarding.height, onboarding.age, onboarding.selectedGender]);

  const handleSaveBodyMetrics = async (updates: { weight?: number; height?: number; age?: number }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No user logged in");
        return;
      }

      // Prepare data
      const currentBodyData = {
        gender: onboarding.selectedGender,
        age: updates.age ?? (parseInt(age) || 0),
        height_cm: updates.height ?? (parseFloat(height) || 0),
        weight_kg: updates.weight ?? (parseFloat(weight) || 0),
      };

      // Update local state via onboarding provider
      if (updates.weight !== undefined) onboarding.setWeight(updates.weight);
      if (updates.height !== undefined) onboarding.setHeight(updates.height);
      if (updates.age !== undefined) onboarding.setAge(updates.age);

      // Check existence
      const { data: existing, error: fetchError } = await supabase
        .from('user_body_metrics')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching body metrics:", fetchError);
        throw fetchError;
      }

      let result;
      if (!existing) {
        console.log("Creating new body metrics");
        result = await supabase.from('user_body_metrics').insert({
          user_id: user.id,
          ...currentBodyData
        });
      } else {
        console.log("Updating existing body metrics");
        result = await supabase
          .from('user_body_metrics')
          .update(currentBodyData)
          .eq('user_id', user.id);
      }

      if (result.error) {
        console.error("Supabase error:", result.error);
        throw result.error;
      }

      // Update AsyncStorage
      await AsyncStorage.setItem("onboarding_body", JSON.stringify(currentBodyData));

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log("Successfully saved body metrics");
    } catch (error) {
      console.error("Error saving body metrics:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: Colors.background.surface }]}>
        {children}
      </View>
    </View>
  );

  const SettingRow = ({ 
    icon, 
    label, 
    value,
    unit,
    onEdit,
    last = false 
  }: { 
    icon: keyof typeof MaterialCommunityIcons.glyphMap; 
    label: string; 
    value: string;
    unit: string;
    onEdit?: () => void;
    last?: boolean; 
  }) => (
    <View style={[styles.row, !last && { borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", borderBottomWidth: 1 }]}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.03)" }]}>
          <MaterialCommunityIcons name={icon} size={20} color={Colors.lilac[900]} />
        </View>
        <Text style={[styles.rowLabel, { color: Colors.text.primary }]}>{label}</Text>
      </View>
      
      <View style={styles.rowRight}>
        <View style={styles.valueWrapper}>
            <Text style={[styles.valueText, { color: Colors.text.primary }]}>{value || "-"}</Text>
            <Text style={[styles.unitText, { color: Colors.text.tertiary }]}>{unit}</Text>
        </View>
        {onEdit && (
            <Pressable 
                onPress={() => {
                    Haptics.selectionAsync();
                    onEdit();
                }}
                style={({pressed}) => [styles.editButton, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)", opacity: pressed ? 0.7 : 1 }]}
            >
                <MaterialCommunityIcons name="pencil" size={16} color={Colors.text.secondary} />
            </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <View 
      style={[styles.container, { backgroundColor: Colors.background.secondary, paddingTop: top }]}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.background.surface, borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }]}>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>{t("unitsNutrition.title")}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom + 40 }]}>
        
        {/* Body Measurements */}
        <Section title={t("unitsNutrition.bodyMeasurements")}>
          <SettingRow 
            icon="weight-kilogram" 
            label={t("unitsNutrition.weight")} 
            value={weight} 
            unit="kg" 
            onEdit={() => setActiveModal('weight')}
          />
          <SettingRow 
            icon="human-male-height" 
            label={t("unitsNutrition.height")} 
            value={height} 
            unit="cm" 
            onEdit={() => setActiveModal('height')}
            last
          />
        </Section>

        {/* Daily Targets */}
        <Section title={t("unitsNutrition.dailyTargets")}>
          <SettingRow 
            icon="fire" 
            label={t("unitsNutrition.calorieGoal")} 
            value={calories} 
            unit="kcal" 
            last
          />
        </Section>

        {/* Macros */}
        <Section title={t("unitsNutrition.macroDistribution")}>
          <SettingRow 
            icon="food-steak" 
            label={t("unitsNutrition.protein")} 
            value={protein} 
            unit="g" 
          />
          <SettingRow 
            icon="barley" 
            label={t("unitsNutrition.carbs")} 
            value={carbs} 
            unit="g" 
          />
          <SettingRow 
            icon="oil" 
            label={t("unitsNutrition.fat")} 
            value={fat} 
            unit="g" 
            last
          />
        </Section>

        {/* Personal Details */}
        <Section title={t("unitsNutrition.personalDetails")}>
          <SettingRow 
            icon="calendar-account" 
            label={t("unitsNutrition.age")} 
            value={age} 
            unit={t("goals.age") === "YAŞ" ? "yıl" : "years"} 
            onEdit={() => setActiveModal('age')}
            last
          />
        </Section>
      </ScrollView>

      {/* Modals */}
      <RulerPickerModal
        visible={activeModal === 'weight'}
        onClose={() => setActiveModal(null)}
        onSave={async (val) => {
            const newVal = parseFloat(val.toString());
            setWeight(newVal.toString());
            await handleSaveBodyMetrics({ weight: newVal });
            setActiveModal(null);
        }}
        title={t("unitsNutrition.editWeight")}
        initialValue={parseFloat(weight) || 75}
        unit="kg"
        min={30}
        max={300}
      />

      <RulerPickerModal
        visible={activeModal === 'height'}
        onClose={() => setActiveModal(null)}
        onSave={async (val) => {
            const newVal = parseFloat(val.toString());
            setHeight(newVal.toString());
            await handleSaveBodyMetrics({ height: newVal });
            setActiveModal(null);
        }}
        title={t("unitsNutrition.editHeight")}
        initialValue={parseFloat(height) || 175}
        unit="cm"
        min={100}
        max={250}
      />

      <NumericInputModal
        visible={activeModal === 'age'}
        onClose={() => setActiveModal(null)}
        onSave={async (val) => {
            const newVal = parseInt(val) || 0;
            setAge(val);
            await handleSaveBodyMetrics({ age: newVal });
            setActiveModal(null);
        }}
        title={t("unitsNutrition.editAge")}
        initialValue={age}
        unit={t("goals.age") === "YAŞ" ? "yıl" : "years"}
      />

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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 24,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
    opacity: 0.7,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  valueWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
  },
  unitText: {
    fontSize: 14,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
