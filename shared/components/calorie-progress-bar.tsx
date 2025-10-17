import { Colors } from "@/constants/theme";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface CalorieProgressBarProps {
  currentValue: number;
  goalValue: number;
  showDecorations?: boolean;
  decorationSpacing?: number;
  decorationColor?: string;
  filledColor?: string;
  emptyColor?: string;
}

export default function CalorieProgressBar({
  currentValue,
  goalValue,
  showDecorations = true,
  decorationSpacing = 16,
  decorationColor = Colors.lilac[600],
  filledColor = Colors.lilac[800],
  emptyColor = Colors.lilac[100],
}: CalorieProgressBarProps) {
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const remainingValue = goalValue - currentValue;
  const progressPercentage = (currentValue / goalValue) * 100;

  // Progress bar üzerinde gösterilecek süsleri hesapla
  const decorations = [];
  if (showDecorations) {
    const filledWidth = (progressBarWidth * progressPercentage) / 100;
    for (
      let i = decorationSpacing;
      i < filledWidth - 10;
      i += decorationSpacing
    ) {
      decorations.push(i);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.remainingText}>
        <Text style={styles.remainingNumber}>{remainingValue}</Text> /
        {goalValue} cal goal
      </Text>

      <View
        style={styles.progressBarContainer}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setProgressBarWidth(width);
        }}
      >
        <View
          style={[
            styles.progressBarFill,
            { flex: progressPercentage, backgroundColor: filledColor },
          ]}
        >
          {showDecorations &&
            decorations.map((position, index) => (
              <View
                key={index}
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: position,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    height: index % 2 === 0 ? 12 : 16,
                    transform: [{ rotate: "30deg" }],
                    width: 5,
                    backgroundColor: decorationColor,
                  }}
                />
              </View>
            ))}
        </View>
        <View style={styles.progressBarGap} />
        <View
          style={[
            styles.progressBarEmpty,
            { flex: 100 - progressPercentage, backgroundColor: emptyColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  remainingText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 21,
    color: Colors.gray[400],
  },
  remainingNumber: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 32,
    lineHeight: 40,
    color: Colors.text.primary,
  },
  progressBarContainer: {
    width: "100%",
    height: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  progressBarFill: {
    height: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  progressBarGap: {
    width: 4,
  },
  progressBarEmpty: {
    height: 12,
    borderRadius: 8,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 18,
    color: Colors.gray[400],
  },
});
