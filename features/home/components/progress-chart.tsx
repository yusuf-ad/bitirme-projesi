import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

interface ProgressChartProps {
  type: "fat" | "protein" | "carb";
  percentage: number;
}

export default function ProgressChart({
  type,
  percentage,
}: ProgressChartProps) {
  const getLabel = () => {
    switch (type) {
      case "fat":
        return "Fat";
      case "protein":
        return "Pro";
      case "carb":
        return "Carb";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "fat":
        return require("@/assets/icons/progress-fat.svg");
      case "protein":
        return require("@/assets/icons/progress-protein.svg");
      case "carb":
        return require("@/assets/icons/progress-carb.svg");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={getIcon()} style={styles.chart} />
      <View style={styles.labelContainer}>
        <Text style={styles.percentage}>{percentage}%</Text>
        <Text style={styles.label}>{getLabel()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    position: "relative",
  },
  chart: {
    width: 64,
    height: 64,
    position: "absolute",
  },
  labelContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -19.55 }, { translateY: -17 }],
    justifyContent: "center",
    alignItems: "center",
    width: 39.11,
  },
  percentage: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 18,
    color: Colors.text.primary,
    textAlign: "center",
  },
  label: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 9,
    lineHeight: 11,
    color: Colors.gray[400],
    textAlign: "center",
  },
});
