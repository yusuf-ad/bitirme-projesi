import { getThemeColors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { useLanguage } from "@/hooks/useLanguage";
import { POPULAR_CUISINES } from "@/lib/constants";
import { supabase } from "@/lib/supabase";
import { updateUserTastePreferences } from "@/lib/supabase-onboarding";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const cuisineDescriptions: Record<string, { description: string; image: any; emoji: string }> = {
  american: {
    description: "Classic comfort food",
    emoji: "🍔",
    image: { uri: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" },
  },
  asian: {
    description: "Stir-fry, noodles & spices",
    emoji: "🥢",
    image: { uri: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80" },
  },
  chinese: {
    description: "Wok-fired & flavorful",
    emoji: "🥡",
    image: { uri: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80" },
  },
  french: {
    description: "Elegant & sophisticated",
    emoji: "🥐",
    image: { uri: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80" },
  },
  greek: {
    description: "Mediterranean classics",
    emoji: "🥗",
    image: { uri: "https://images.unsplash.com/photo-1539136788836-5699e78bfc75?auto=format&fit=crop&w=800&q=80" },
  },
  indian: {
    description: "Spicy & aromatic",
    emoji: "🍛",
    image: { uri: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=800&q=80" },
  },
  italian: {
    description: "Pasta, risotto, pizza",
    emoji: "🍝",
    image: { uri: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?auto=format&fit=crop&w=800&q=80" },
  },
  japanese: {
    description: "Delicate & precise",
    emoji: "🍣",
    image: { uri: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80" },
  },
  mediterranean: {
    description: "Fresh, healthy & colorful",
    emoji: "🫒",
    image: { uri: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80" },
  },
  mexican: {
    description: "Bold & vibrant",
    emoji: "🌮",
    image: { uri: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80" },
  },
  middleeastern: {
    description: "Aromatic & flavorful",
    emoji: "🧆",
    image: { uri: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=800&q=80" },
  },
  thai: {
    description: "Sweet, sour & spicy",
    emoji: "🍜",
    image: { uri: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80" },
  },
  korean: {
    description: "Bold flavors & fermented",
    emoji: "🍲",
    image: { uri: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=800&q=80" },
  },
  spanish: {
    description: "Tapas & paella",
    emoji: "🥘",
    image: { uri: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=800&q=80" },
  },
};

const cuisineOptions = POPULAR_CUISINES.map((cuisine) => ({
  id: cuisine.id,
  label: cuisine.name,
  description: cuisineDescriptions[cuisine.id]?.description || "Delicious cuisine",
  emoji: cuisineDescriptions[cuisine.id]?.emoji || "🍽️",
  image: cuisineDescriptions[cuisine.id]?.image || { uri: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80" },
}));

const CARD_WIDTH = 260;

export default function TastePreferencesScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);
  const { t } = useLanguage();
  const { selection } = useHaptics();
  const onboarding = useOnboarding();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [likedCuisines, setLikedCuisines] = useState<string[]>([]);
  const [dislikedCuisines, setDislikedCuisines] = useState<string[]>([]);

  useEffect(() => {
    onboarding.loadOnboardingData();
  }, []);

  useEffect(() => {
    if (onboarding.selectedCuisines) {
      setLikedCuisines(onboarding.selectedCuisines);
    }
    if (onboarding.dislikedCuisines) {
      setDislikedCuisines(onboarding.dislikedCuisines);
    }
  }, [onboarding.selectedCuisines, onboarding.dislikedCuisines]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const saveToSupabase = (liked: string[], disliked: string[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await updateUserTastePreferences(user.id, {
            cuisines: liked,
            cuisine_dislikes: disliked,
          });
        }
      } catch (error) {
        console.error("Failed to save cuisines:", error);
      }
    }, 1000);
  };

  const toggleCuisine = (cuisineId: string, like: boolean) => {
    selection();

    if (like) {
      const isCurrentlyLiked = likedCuisines.includes(cuisineId);

      if (isCurrentlyLiked) {
        const newLiked = likedCuisines.filter((c) => c !== cuisineId);
        setLikedCuisines(newLiked);
        onboarding.setSelectedCuisines(newLiked);
        saveToSupabase(newLiked, dislikedCuisines);
      } else {
        const newLiked = [...likedCuisines, cuisineId];
        let newDisliked = dislikedCuisines;
        
        if (dislikedCuisines.includes(cuisineId)) {
          newDisliked = dislikedCuisines.filter((c) => c !== cuisineId);
          setDislikedCuisines(newDisliked);
          onboarding.setDislikedCuisines(newDisliked);
        }
        
        setLikedCuisines(newLiked);
        onboarding.setSelectedCuisines(newLiked);
        saveToSupabase(newLiked, newDisliked);

        setTimeout(() => {
          if (currentIndex < cuisineOptions.length - 1) {
            flatListRef.current?.scrollToIndex({
              index: currentIndex + 1,
              animated: true,
            });
          }
        }, 300);
      }
    } else {
      const isCurrentlyDisliked = dislikedCuisines.includes(cuisineId);

      if (isCurrentlyDisliked) {
        const newDisliked = dislikedCuisines.filter((c) => c !== cuisineId);
        setDislikedCuisines(newDisliked);
        onboarding.setDislikedCuisines(newDisliked);
        saveToSupabase(likedCuisines, newDisliked);
      } else {
        const newDisliked = [...dislikedCuisines, cuisineId];
        let newLiked = likedCuisines;
        
        if (likedCuisines.includes(cuisineId)) {
          newLiked = likedCuisines.filter((c) => c !== cuisineId);
          setLikedCuisines(newLiked);
          onboarding.setSelectedCuisines(newLiked);
        }
        
        setDislikedCuisines(newDisliked);
        onboarding.setDislikedCuisines(newDisliked);
        saveToSupabase(newLiked, newDisliked);

        setTimeout(() => {
          if (currentIndex < cuisineOptions.length - 1) {
            flatListRef.current?.scrollToIndex({
              index: currentIndex + 1,
              animated: true,
            });
          }
        }, 300);
      }
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (CARD_WIDTH + 12));
    setCurrentIndex(index);
  };

  const progress = ((likedCuisines.length + dislikedCuisines.length) / cuisineOptions.length) * 100;

  const renderCuisineCard = ({ item, index }: { item: typeof cuisineOptions[0]; index: number }) => {
    const isLiked = likedCuisines.includes(item.id);
    const isDisliked = dislikedCuisines.includes(item.id);

    return (
      <View style={styles.cardContainer}>
        <View style={[styles.card, { backgroundColor: Colors.background.surface }]}>
          <Image source={item.image} style={styles.cardImage} />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.cardGradient}
          />
          
          {/* Card Number */}
          <View style={styles.cardNumber}>
            <Text style={styles.cardNumberText}>{index + 1}/{cuisineOptions.length}</Text>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cuisineEmoji}>{item.emoji}</Text>
            <Text style={styles.cuisineLabel}>{item.label}</Text>
            <Text style={styles.cuisineDescription}>{item.description}</Text>
          </View>

          <View style={styles.actionButtons}>
            <Pressable
              style={[
                styles.actionButton,
                styles.dislikeButton,
                { backgroundColor: isDark ? Colors.background.surface : "#FFFFFF" },
                isDisliked && styles.dislikeButtonActive,
              ]}
              onPress={() => toggleCuisine(item.id, false)}
            >
              <MaterialCommunityIcons
                name={isDisliked ? "thumb-down" : "thumb-down-outline"}
                size={24}
                color={isDisliked ? "#FFFFFF" : "#E63946"}
              />
            </Pressable>

            <Pressable
              style={[
                styles.actionButton,
                styles.likeButton,
                { backgroundColor: isDark ? Colors.background.surface : "#FFFFFF" },
                isLiked && styles.likeButtonActive,
              ]}
              onPress={() => toggleCuisine(item.id, true)}
            >
              <MaterialCommunityIcons
                name={isLiked ? "heart" : "heart-outline"}
                size={24}
                color={isLiked ? "#FFFFFF" : Colors.lilac[900]}
              />
            </Pressable>
          </View>

          {isLiked && (
            <View style={[styles.badge, styles.likedBadge, { backgroundColor: Colors.lilac[900] }]}>
              <MaterialCommunityIcons name="heart" size={12} color="#FFFFFF" />
              <Text style={styles.badgeText}>{t("common.liked")}</Text>
            </View>
          )}

          {isDisliked && (
            <View style={[styles.badge, styles.dislikedBadge]}>
              <MaterialCommunityIcons name="close" size={12} color="#FFFFFF" />
              <Text style={styles.badgeText}>{t("common.disliked")}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.background.secondary, paddingTop: top }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors.background.surface }]}>
        <Pressable
          onPress={() => {
            selection();
            router.back();
          }}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>
          {t("tastePreferencesPage.title")}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View entering={FadeInUp.delay(50).springify()} style={styles.heroSection}>
          <LinearGradient
            colors={isDark ? [Colors.lilac[900], Colors.background.tertiary] : [Colors.lilac[100], Colors.lilac[200]]}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroEmoji}>🍽️</Text>
              <View style={styles.heroTextContainer}>
                <Text style={[styles.heroTitle, { color: isDark ? Colors.lilac[100] : Colors.lilac[900] }]}>
                  {t("tastePreferencesPage.heroTitle") || "Your Taste Profile"}
                </Text>
                <Text style={[styles.heroSubtitle, { color: Colors.text.secondary }]}>
                  {t("tastePreferencesPage.heroSubtitle") || "Help us personalize your meal recommendations"}
                </Text>
              </View>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: Colors.text.secondary }]}>
                  {t("tastePreferencesPage.progress") || "Progress"}
                </Text>
                <Text style={[styles.progressValue, { color: isDark ? Colors.lilac[300] : Colors.lilac[900] }]}>
                  {Math.round(progress)}%
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)" }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${progress}%`, backgroundColor: isDark ? Colors.lilac[400] : Colors.lilac[900] }
                  ]} 
                />
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Stats Row */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsContainer}>
          <View style={[styles.statChip, { backgroundColor: isDark ? "rgba(124, 58, 237, 0.2)" : `${Colors.lilac[900]}12` }]}>
            <MaterialCommunityIcons name="heart" size={14} color={isDark ? Colors.lilac[300] : Colors.lilac[900]} />
            <Text style={[styles.statChipValue, { color: isDark ? Colors.lilac[300] : Colors.lilac[900] }]}>{likedCuisines.length}</Text>
            <Text style={[styles.statChipLabel, { color: Colors.text.secondary }]}>{t("common.liked")}</Text>
          </View>
          
          <View style={[styles.statChip, { backgroundColor: isDark ? "rgba(239, 68, 68, 0.2)" : "#E6394610" }]}>
            <MaterialCommunityIcons name="close-circle" size={14} color={isDark ? "#F87171" : "#E63946"} />
            <Text style={[styles.statChipValue, { color: isDark ? "#F87171" : "#E63946" }]}>{dislikedCuisines.length}</Text>
            <Text style={[styles.statChipLabel, { color: Colors.text.secondary }]}>{t("common.disliked")}</Text>
          </View>
          
          <View style={[styles.statChip, { backgroundColor: isDark ? "rgba(34, 197, 94, 0.2)" : "#22C55E10" }]}>
            <MaterialCommunityIcons name="help-circle-outline" size={14} color={isDark ? "#4ADE80" : "#22C55E"} />
            <Text style={[styles.statChipValue, { color: isDark ? "#4ADE80" : "#22C55E" }]}>
              {cuisineOptions.length - likedCuisines.length - dislikedCuisines.length}
            </Text>
            <Text style={[styles.statChipLabel, { color: Colors.text.secondary }]}>
              {t("tastePreferencesPage.remaining") || "Left"}
            </Text>
          </View>
        </Animated.View>

        {/* Cuisines Section */}
        <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>
              {t("tastePreferencesPage.favoriteCuisines")}
            </Text>
            <View style={styles.swipeHint}>
              <MaterialCommunityIcons name="gesture-swipe-horizontal" size={16} color={Colors.text.secondary} />
              <Text style={[styles.swipeHintText, { color: Colors.text.secondary }]}>
                {t("tastePreferencesPage.swipeHint") || "Swipe to explore"}
              </Text>
            </View>
          </View>

          <FlatList
            ref={flatListRef}
            data={cuisineOptions}
            renderItem={renderCuisineCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 12}
            decelerationRate="fast"
            contentContainerStyle={styles.listContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          />

          {/* Dot Indicators */}
          <View style={styles.dotsContainer}>
            {cuisineOptions.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === currentIndex ? Colors.lilac[900] : (isDark ? Colors.gray[700] : Colors.gray[300]),
                    width: index === currentIndex ? 20 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>

        {/* Tip Card */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.tipCard}>
          <LinearGradient
            colors={isDark ? [Colors.gray[700], Colors.gray[800]] : ["#FEF3C7", "#FDE68A"]}
            style={styles.tipGradient}
          >
            <View style={styles.tipContent}>
              <Text style={styles.tipEmoji}>💡</Text>
              <View style={styles.tipTextContainer}>
                <Text style={[styles.tipTitle, isDark && { color: Colors.text.primary }]}>
                  {t("tastePreferencesPage.tipTitle") || "Pro Tip"}
                </Text>
                <Text style={[styles.tipText, isDark && { color: Colors.text.secondary }]}>
                  {t("tastePreferencesPage.tipText") || "The more cuisines you rate, the better we can personalize your meal suggestions!"}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 40,
  },
  content: {
    paddingVertical: 16,
    gap: 20,
  },
  // Hero Section
  heroSection: {
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  heroGradient: {
    padding: 14,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  heroEmoji: {
    fontSize: 28,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  progressContainer: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  // Stats
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  statChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 4,
  },
  statChipValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  statChipLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  // Section
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  swipeHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  swipeHintText: {
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  cardContainer: {
    width: CARD_WIDTH,
  },
  card: {
    width: "100%",
    height: 320,
    borderRadius: 20,
    overflow: "hidden",
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
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardNumber: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardNumberText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  cardContent: {
    position: "absolute",
    bottom: 70,
    left: 16,
    right: 16,
  },
  cuisineEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  cuisineLabel: {
    fontWeight: "700",
    fontSize: 24,
    lineHeight: 28,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cuisineDescription: {
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 16,
    color: "rgba(255,255,255,0.8)",
  },
  actionButtons: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 16,
  },
  actionButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    borderColor: "#8B5CF6",
  },
  likeButtonActive: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
  },
  badge: {
    position: "absolute",
    top: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  likedBadge: {
    right: 12,
  },
  dislikedBadge: {
    left: 12,
    backgroundColor: "#E63946",
  },
  badgeText: {
    fontWeight: "600",
    fontSize: 10,
    color: "#FFFFFF",
  },
  // Dots
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingTop: 16,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  // Tip Card
  tipCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  tipGradient: {
    padding: 16,
  },
  tipContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
    color: "#78350F",
  },
});
