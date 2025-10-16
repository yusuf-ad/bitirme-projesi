import { Colors } from "@/constants/theme";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface MacroCardProps {
  label: string;
  currentValue: number;
  maxValue: number;
  unit: string;
  color: string;
  lightColor: string;
  decorationColor: string;
}

export default function MacroCard({
  label,
  currentValue,
  maxValue,
  unit,
  color,
  lightColor,
  decorationColor,
}: MacroCardProps) {
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  const progressPercentage = (currentValue / maxValue) * 100;

  // Progress bar üzerinde gösterilecek süsleri hesapla
  const decorations = [];
  const decorationSpacing = 16;
  const filledWidth = (progressBarWidth * progressPercentage) / 100;
  for (let i = decorationSpacing; i < filledWidth - 8; i += decorationSpacing) {
    decorations.push(i);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.moreIcon}>⋯</Text>
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.currentValue}>{currentValue}</Text>
        <Text style={styles.maxValue}>
          {" "}
          / {maxValue}
          {unit}
        </Text>
      </View>

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
            { flex: progressPercentage, backgroundColor: color },
          ]}
        >
          {decorations.map((position, index) => (
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
                  backgroundColor: `${decorationColor}`,
                }}
              />
            </View>
          ))}
        </View>
        <View style={styles.progressBarGap} />
        <View
          style={[
            styles.progressBarEmpty,
            {
              flex: 100 - progressPercentage,
              backgroundColor: lightColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.primary,
  },
  moreIcon: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 16,
    color: Colors.gray[300],
    letterSpacing: -1,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currentValue: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 24,
    lineHeight: 32,
    color: Colors.text.primary,
  },
  maxValue: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 20,
    color: Colors.gray[400],
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
});
