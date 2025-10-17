import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

interface MacroCardProps {
  label: string;
  currentValue: number;
  maxValue: number;
  unit: string;
}

export default function MacroCard({
  label,
  currentValue,
  maxValue,
  unit,
}: MacroCardProps) {
  const progressPercentage = (currentValue / maxValue) * 100;

  return (
    <View style={styles.card}>
      <View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              {
                height: `${progressPercentage}%`,
              },
            ]}
          />
        </View>
      </View>

      <View>
        <Text style={styles.label}>{label}</Text>

        <View style={styles.valueContainer}>
          <Text style={styles.currentValue}>{currentValue}</Text>
          <Text style={styles.maxValue}>
            {" "}
            /{maxValue}
            {unit}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.background.surface,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarContainer: {
    width: 6,
    height: 32,
    backgroundColor: Colors.lilac[100],
    borderRadius: 24,
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: Colors.lilac[800],
    borderRadius: 24,
  },
  label: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.primary,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currentValue: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 14,
    color: Colors.text.primary,
  },
  maxValue: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    color: Colors.gray[400],
  },
});
