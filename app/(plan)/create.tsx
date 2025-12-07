import { Colors } from "@/constants/theme";
import { DateModal } from "@/features/meal-plan/components/date-modal";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useMealPlansQuery } from "@/hooks/use-meal-plans-query";

import CustomButton from "@/shared/components/custom-button";
import { MaterialIcons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CreateMealPlan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const startDateModalRef = useRef<BottomSheetModal>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const params = useLocalSearchParams<{ date?: string }>();
  const initialStartDate = (() => {
    if (params?.date) {
      const d = new Date(params.date);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    return new Date(today);
  })();

  const [startDate, setStartDate] = useState<Date>(initialStartDate);

  const { session } = useAuthContext();
  const { data: mealPlanData } = useMealPlansQuery(
    session?.user?.id,
    startDate
  );
  const hasExistingPlan = !!mealPlanData?.plan;

  const formatDateDisplay = (date: Date): { day: string; date: string } => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = daysOfWeek[date.getDay()];
    const month = date.toLocaleDateString("en-US", { month: "short" });
    const dateNum = date.getDate();
    return {
      day: dayName,
      date: `${month}, ${dateNum}`,
    };
  };

  const startDateDisplay = formatDateDisplay(startDate);

  const handleStartDatePress = () => {
    startDateModalRef.current?.present();
  };

  const handleStartDateSelect = (date: Date) => {
    setStartDate(date);
    startDateModalRef.current?.close();
  };

  const handleNext = () => {
    router.push({
      pathname: "/(plan)/select-meals",
      params: {
        startDate: startDate.toISOString(),
      },
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors.background.primary,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Meal plan date</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeButton}>Close</Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.description}>
            We&apos;ll create a meal plan for the day. Feel free to select a
            different date if needed.
          </Text>

          <View style={styles.datesContainer}>
            {/* Date Selection */}
            <View style={styles.dateSection}>
              <Text style={styles.dateLabel}>Date</Text>
              <CustomButton
                containerStyle={styles.dateButton}
                onPress={handleStartDatePress}
              >
                <View style={styles.dateContent}>
                  <Text style={styles.dayText}>{startDateDisplay.day}</Text>
                  <Text style={styles.dateText}>{startDateDisplay.date}</Text>
                </View>
                <MaterialIcons
                  name="expand-more"
                  size={24}
                  color={Colors.text.primary}
                />
              </CustomButton>
            </View>
          </View>

          {hasExistingPlan && (
            <View style={styles.warningContainer}>
              <MaterialIcons
                name="info-outline"
                size={24}
                color={Colors.semantic.warning.dark}
              />
              <Text style={styles.warningText}>
                A meal plan already exists for this date.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          containerStyle={[styles.generateButton]}
          onPress={handleNext}
        >
          <Text style={styles.generateButtonText}>Next</Text>
        </CustomButton>
      </View>

      <DateModal
        ref={startDateModalRef}
        dateType="start"
        currentDate={startDate}
        onDateSelect={handleStartDateSelect}
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  closeButton: {
    fontSize: 16,
    color: Colors.lilac[600],
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    marginBottom: 24,
    fontWeight: "400",
  },
  datesContainer: {
    flexDirection: "row",
    gap: 16,
  },
  dateSection: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.lilac[300],
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dateContent: {
    flex: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "400",
    color: Colors.text.primary,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  generateButton: {
    paddingVertical: 14,
    backgroundColor: Colors.lilac[900],
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.background.primary,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.semantic.warning.light,
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.semantic.warning.main,
  },
  warningText: {
    fontSize: 15,
    color: Colors.semantic.warning.dark,
    flex: 1,
    fontWeight: "500",
    lineHeight: 20,
  },
});
