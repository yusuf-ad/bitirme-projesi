import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// Pre-calculate card width to avoid recalculation
const CARD_WIDTH = width * 0.42;

// Static gradient positions - defined outside component to prevent recreation
const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 1, y: 1 };

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
  function HighlightCardComponent({ card }: HighlightCardProps) {
    // Memoize the press handler to prevent recreation
    const handlePress = useCallback(() => {
      Haptics.selectionAsync();
      card.onPress();
    }, [card.onPress]);

    // Memoize card style with shadow
    const cardStyle = useMemo(
      () => [
        styles.highlightCard,
        {
          backgroundColor: card.gradientColors[0],
          shadowColor: card.shadowColor,
        },
      ],
      [card.gradientColors, card.shadowColor]
    );

    return (
      <View style={styles.cardWrapper}>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) =>
            pressed ? [cardStyle, styles.cardPressed] : cardStyle
          }
        >
          <LinearGradient
            colors={card.gradientColors}
            start={GRADIENT_START}
            end={GRADIENT_END}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.highlightHeader}>
            <View style={styles.highlightIcon}>
              <MaterialCommunityIcons
                name={card.icon}
                size={20}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.highlightTitle}>{card.title}</Text>
          </View>

          <View style={styles.highlightContent}>
            <Text style={styles.highlightValue}>{card.value}</Text>
            {card.detail && (
              <Text style={styles.highlightDetail}>{card.detail}</Text>
            )}
          </View>
        </Pressable>
      </View>
    );
  },
  // Custom comparison to avoid unnecessary re-renders
  (prevProps, nextProps) => {
    return (
      prevProps.card.id === nextProps.card.id &&
      prevProps.card.value === nextProps.card.value &&
      prevProps.card.detail === nextProps.card.detail &&
      prevProps.card.title === nextProps.card.title
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
    width: CARD_WIDTH,
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
    // Enable rasterization on iOS for better scroll performance
    ...(Platform.OS === "ios" && {
      shouldRasterizeIOS: true,
    }),
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
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
    backgroundColor: "rgba(255,255,255,0.2)",
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
    color: "#FFFFFF",
  },
  highlightValue: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.3,
    textAlign: "center",
    color: "#FFFFFF",
  },
  highlightDetail: {
    fontSize: 11,
    fontWeight: "500",
    opacity: 0.85,
    lineHeight: 14,
    textAlign: "center",
    color: "rgba(255,255,255,0.8)",
  },
});
