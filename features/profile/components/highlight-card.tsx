import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get("window");

export interface HighlightCard {
  id: string;
  title: string;
  value: string;
  detail?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  accentColor: string;
  gradientColors: [string, string];
  shadowColor: string;
}

interface HighlightCardProps {
  card: HighlightCard;
  index: number;
}

export const HighlightCardComponent = React.memo(
  function HighlightCardComponent({ card, index }: HighlightCardProps) {
    return (
      <View style={styles.cardWrapper}>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            card.onPress();
          }}
          style={({ pressed }) => [
            styles.highlightCard,
            {
              backgroundColor: card.gradientColors[0],
              transform: [{ scale: pressed ? 0.98 : 1 }],
              shadowColor: card.shadowColor,
            },
          ]}
        >
          <LinearGradient
            colors={card.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.highlightHeader}>
            <View
              style={[
                styles.highlightIcon,
                { backgroundColor: "rgba(255,255,255,0.2)" },
              ]}
            >
              <MaterialCommunityIcons
                name={card.icon}
                size={20}
                color="#FFFFFF"
              />
            </View>
            <Text style={[styles.highlightTitle, { color: "#FFFFFF" }]}>
              {card.title}
            </Text>
          </View>

          <View style={styles.highlightContent}>
            <Text style={[styles.highlightValue, { color: "#FFFFFF" }]}>
              {card.value}
            </Text>
            {card.detail && (
              <Text
                style={[
                  styles.highlightDetail,
                  { color: "rgba(255,255,255,0.8)" },
                ]}
              >
                {card.detail}
              </Text>
            )}
          </View>
        </Pressable>
      </View>
    );
  }
);

interface HighlightCardsProps {
  cards: HighlightCard[];
}

export const HighlightCards = React.memo(function HighlightCards({
  cards,
}: HighlightCardsProps) {
  return (
    <View style={styles.container}>
      {cards.map((card, index) => (
        <HighlightCardComponent key={card.id} card={card} index={index} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },
  cardWrapper: {
    marginRight: 16,
  },
  highlightCard: {
    width: width * 0.42,
    height: 160,
    borderRadius: 24,
    padding: 16,
    justifyContent: "flex-start",
    alignItems: "center",
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  highlightHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  highlightContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  highlightTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.9,
    textAlign: "center",
  },
  highlightValue: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  highlightDetail: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.85,
    lineHeight: 14,
    textAlign: "center",
  },
});
