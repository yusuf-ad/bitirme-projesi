import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface TasteCuisinesProps {
  title: string;
  description?: string;
  onSelectionChange?: (selectedCuisines: string[]) => void;
  initialSelection?: string[];
}

const cuisineOptions = [
  {
    id: "turkish",
    label: "Turkish",
    description: "Rich flavors & traditions",
    image: require("@/assets/images/grilled-chicken.png"),
  },
  {
    id: "italian",
    label: "Italian",
    description: "Pasta, risotto, pizza",
    image: require("@/assets/images/italian-breakfast.png"),
  },
  {
    id: "mediterranean",
    label: "Mediterranean",
    description: "Fresh, healthy & colorful",
    image: require("@/assets/images/spaghetti-carbonara.png"),
  },
  {
    id: "asian",
    label: "Asian",
    description: "Stir-fry, noodles & spices",
    image: require("@/assets/images/grilled-chicken.png"),
  },
  {
    id: "american",
    label: "American",
    description: "Classic comfort food",
    image: require("@/assets/images/italian-breakfast.png"),
  },
  {
    id: "mexican",
    label: "Mexican",
    description: "Bold & flavorful",
    image: require("@/assets/images/spaghetti-carbonara.png"),
  },
  {
    id: "indian",
    label: "Indian",
    description: "Aromatic & spicy",
    image: require("@/assets/images/grilled-chicken.png"),
  },
  {
    id: "french",
    label: "French",
    description: "Elegant & refined",
    image: require("@/assets/images/italian-breakfast.png"),
  },
  {
    id: "japanese",
    label: "Japanese",
    description: "Delicate & precise",
    image: require("@/assets/images/spaghetti-carbonara.png"),
  },
];

export function TasteCuisines({
  title,
  description,
  onSelectionChange,
  initialSelection = [],
}: TasteCuisinesProps) {
  const [likedCuisines, setLikedCuisines] =
    useState<string[]>(initialSelection);
  const [dislikedCuisines, setDislikedCuisines] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const toggleCuisine = (cuisineId: string, like: boolean) => {
    if (like) {
      // Like button pressed
      const updatedSelection = likedCuisines.includes(cuisineId)
        ? likedCuisines.filter((c) => c !== cuisineId)
        : [...likedCuisines, cuisineId];

      setLikedCuisines(updatedSelection);
      onSelectionChange?.(updatedSelection);

      // Auto scroll to next card
      setTimeout(() => {
        if (currentIndex < cuisineOptions.length - 1) {
          flatListRef.current?.scrollToIndex({
            index: currentIndex + 1,
            animated: true,
          });
        }
      }, 300);
    } else {
      // Dislike button pressed
      const updatedDisliked = dislikedCuisines.includes(cuisineId)
        ? dislikedCuisines.filter((c) => c !== cuisineId)
        : [...dislikedCuisines, cuisineId];

      setDislikedCuisines(updatedDisliked);

      // Auto scroll to next card
      setTimeout(() => {
        if (currentIndex < cuisineOptions.length - 1) {
          flatListRef.current?.scrollToIndex({
            index: currentIndex + 1,
            animated: true,
          });
        }
      }, 300);
    }
  };

  const renderCuisineCard = ({
    item,
  }: {
    item: (typeof cuisineOptions)[0];
  }) => {
    const isLiked = likedCuisines.includes(item.id);
    const isDisliked = dislikedCuisines.includes(item.id);

    return (
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          {/* Background Image */}
          <Image source={item.image} style={styles.cardImage} />

          {/* Gradient Overlay */}
          <View style={styles.cardOverlay} />

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={styles.cuisineLabel}>{item.label}</Text>
            <Text style={styles.cuisineDescription}>{item.description}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable
              style={[
                styles.actionButton,
                styles.dislikeButton,
                isDisliked && styles.dislikeButtonActive,
              ]}
              onPress={() => toggleCuisine(item.id, false)}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={isDisliked ? "#FFFFFF" : "#E63946"}
              />
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                styles.likeButton,
                isLiked && styles.likeButtonActive,
              ]}
              onPress={() => toggleCuisine(item.id, true)}
            >
              <MaterialCommunityIcons
                name="heart"
                size={24}
                color={isLiked ? "#FFFFFF" : "#548A6A"}
                fill={isLiked ? "#548A6A" : "none"}
              />
            </Pressable>
          </View>

          {/* Liked Badge */}
          {isLiked && (
            <View style={[styles.badge, styles.likedBadge]}>
              <MaterialCommunityIcons name="heart" size={16} color="#FFFFFF" />
              <Text style={styles.badgeText}>Liked</Text>
            </View>
          )}

          {/* Disliked Badge */}
          {isDisliked && (
            <View style={[styles.badge, styles.dislikedBadge]}>
              <MaterialCommunityIcons name="close" size={16} color="#FFFFFF" />
              <Text style={styles.badgeText}>Disliked</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + 16));
    setCurrentIndex(index);
  };

  return (
    <View style={styles.content}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      <FlatList
        ref={flatListRef}
        data={cuisineOptions}
        renderItem={renderCuisineCard}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        nestedScrollEnabled
      />

      {/* Counter */}
      <View style={styles.counterContainer}>
        <View style={styles.counterItem}>
          <Text style={styles.counterLabel}>Liked</Text>
          <Text style={styles.counterValue}>{likedCuisines.length}</Text>
        </View>
        <View style={styles.counterDivider} />
        <View style={styles.counterItem}>
          <Text style={styles.counterLabel}>Disliked</Text>
          <Text style={styles.counterValue}>{dislikedCuisines.length}</Text>
        </View>
      </View>
    </View>
  );
}

const CARD_WIDTH = 320;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 20,
  },
  textContainer: {
    marginBottom: 24,
    paddingHorizontal: 15,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 24,
    lineHeight: 29,
    color: "#22252B",
    marginBottom: 8,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19,
    color: "#444955",
  },
  listContent: {
    paddingHorizontal: 4,
    gap: 16,
  },
  cardContainer: {
    width: CARD_WIDTH,
  },
  card: {
    width: "100%",
    height: 420,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FAF9FB",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  cardContent: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
  },
  cuisineLabel: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 32,
    lineHeight: 39,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cuisineDescription: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 17,
    color: "#E8E3ED",
  },
  actionButtons: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  dislikeButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E63946",
  },
  dislikeButtonActive: {
    backgroundColor: "#E63946",
    borderColor: "#E63946",
  },
  likeButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#548A6A",
  },
  likeButtonActive: {
    backgroundColor: "#548A6A",
    borderColor: "#548A6A",
  },
  badge: {
    position: "absolute",
    top: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  likedBadge: {
    right: 12,
    backgroundColor: "#548A6A",
  },
  dislikedBadge: {
    left: 12,
    backgroundColor: "#E63946",
  },
  badgeText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 12,
    color: "#FFFFFF",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 24,
  },
  counterItem: {
    alignItems: "center",
  },
  counterLabel: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: "#888888",
    marginBottom: 4,
  },
  counterValue: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 20,
    color: "#22252B",
  },
  counterDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#E8E3ED",
  },
});
