import { getThemeColors } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_HEIGHT = 60;
const SCROLL_THRESHOLD = 100;

interface FixedHeaderProps {
  scrollY: Animated.SharedValue<number>;
  scrollViewRef: React.RefObject<Animated.ScrollView | null>;
}

function getUserInitials(
  profile: { full_name?: string | null } | null,
  session: { user?: { email?: string | null } | null } | null
) {
  if (profile?.full_name) {
    return profile.full_name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (session?.user?.email) {
    return session.user.email.slice(0, 2).toUpperCase();
  }
  return "SC";
}

function getUserDisplayName(
  profile: { full_name?: string | null } | null,
  session: { user?: { email?: string | null } | null } | null
) {
  if (profile?.full_name) return profile.full_name;
  if (session?.user?.email) return session.user.email.split("@")[0];
  return "User";
}

export const FixedHeader = React.memo(function FixedHeader({
  scrollY,
  scrollViewRef,
}: FixedHeaderProps) {
  const { profile, session } = useAuthContext();
  const { top } = useSafeAreaInsets();
  const { theme, toggleTheme, isDark } = useTheme();
  const { t } = useLanguage();
  const Colors = getThemeColors(isDark);

  // Scroll to top animation values
  const scrollToTopScale = useSharedValue(1);
  const scrollToTopRotation = useSharedValue(0);

  // Scroll to top with smooth animation and visual feedback
  const scrollToTop = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Trigger bounce animation on avatar
    scrollToTopScale.value = withSpring(
      0.85,
      { damping: 8, stiffness: 400 },
      () => {
        scrollToTopScale.value = withSpring(
          1.1,
          { damping: 6, stiffness: 300 },
          () => {
            scrollToTopScale.value = withSpring(1, {
              damping: 10,
              stiffness: 200,
            });
          }
        );
      }
    );

    // Trigger rotation animation
    scrollToTopRotation.value = withSpring(
      -15,
      { damping: 8, stiffness: 400 },
      () => {
        scrollToTopRotation.value = withSpring(0, {
          damping: 10,
          stiffness: 200,
        });
      }
    );

    // Smooth scroll to top
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  }, [scrollToTopScale, scrollToTopRotation, scrollViewRef]);

  // Animated style for scroll to top button
  const scrollToTopAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scrollToTopScale.value },
        { rotate: `${scrollToTopRotation.value}deg` },
      ],
    };
  });

  // Header background fade in animation (synced with scroll)
  const headerBackgroundStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.5, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    const borderOpacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.8, SCROLL_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      borderBottomWidth: 1,
      borderBottomColor: isDark
        ? `rgba(255,255,255,${borderOpacity * 0.1})`
        : `rgba(0,0,0,${borderOpacity * 0.05})`,
    };
  });

  // Profile avatar animation - slides in from left with scale and rotation
  const profileAvatarStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.6, SCROLL_THRESHOLD * 1.1],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateX = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.6, SCROLL_THRESHOLD * 1.1],
      [-20, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.6, SCROLL_THRESHOLD * 1.1],
      [0.5, 1],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateX }, { scale }],
    };
  });

  // Profile name animation - slides in from right with slight delay
  const profileNameStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.8, SCROLL_THRESHOLD * 1.2],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateX = interpolate(
      scrollY.value,
      [SCROLL_THRESHOLD * 0.8, SCROLL_THRESHOLD * 1.2],
      [15, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateX }],
    };
  });

  // SETTINGS title fade out animation (in header)
  const inContentTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD * 0.6],
      [1, 0],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_THRESHOLD * 0.6],
      [1, 0.9],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  // Animation for theme toggle icon
  const iconRotation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: withSpring(isDark ? "360deg" : "0deg", {
            damping: 15,
            stiffness: 100,
          }),
        },
      ],
    };
  });

  const handleSignOut = useCallback(() => {
    Alert.alert(t("profile.signOut"), t("profile.signOutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.signOut"),
        style: "destructive",
        onPress: async () => {
          try {
            await supabase.auth.signOut();
          } catch (error) {
            Alert.alert(
              t("common.error"),
              "We couldn't sign you out. Please try again."
            );
          }
        },
      },
    ]);
  }, [t]);

  const handleThemeToggle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleTheme();
  }, [toggleTheme]);

  const initials = React.useMemo(
    () => getUserInitials(profile, session),
    [profile?.full_name, session?.user?.email]
  );

  const displayName = React.useMemo(
    () => getUserDisplayName(profile, session),
    [profile?.full_name, session?.user?.email]
  );

  return (
    <View style={[styles.fixedHeader, { paddingTop: top }]}>
      {/* Header Background (fades in on scroll) */}
      <Animated.View
        style={[
          styles.headerBackground,
          {
            height: HEADER_HEIGHT + top,
            backgroundColor: Colors.background.surface,
          },
          headerBackgroundStyle,
        ]}
      />

      {/* Header Content */}
      <View style={styles.headerContent}>
        <Pressable
          onPress={handleThemeToggle}
          hitSlop={12}
          style={styles.headerIconButton}
          accessibilityRole="button"
          accessibilityLabel={
            isDark ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          <View
            style={[
              styles.iconButtonCircle,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
              },
            ]}
          >
            <Animated.View style={iconRotation}>
              <MaterialCommunityIcons
                name={isDark ? "white-balance-sunny" : "moon-waning-crescent"}
                size={20}
                color={isDark ? "#FDB022" : Colors.lilac[800]}
              />
            </Animated.View>
          </View>
        </Pressable>

        {/* Header Center - SETTINGS title or Profile Avatar & Name */}
        <View style={styles.headerTitleContainer}>
          {/* SETTINGS title (visible initially, fades out on scroll) */}
          <Animated.View
            style={[styles.headerSettingsWrapper, inContentTitleStyle]}
          >
            <Text
              style={[
                styles.headerSettingsTitle,
                { color: Colors.text.primary },
              ]}
            >
              {t("profile.settings")}
            </Text>
          </Animated.View>

          {/* Profile Avatar & Name (slides in on scroll) - Tappable to scroll to top */}
          <Pressable
            onPress={scrollToTop}
            style={styles.headerProfileTouchable}
          >
            <Animated.View
              style={[styles.headerProfileRow, profileAvatarStyle]}
            >
              <View
                style={[
                  styles.headerAvatar,
                  { backgroundColor: Colors.text.primary },
                ]}
              >
                <Text
                  style={[
                    styles.headerAvatarText,
                    { color: Colors.text.inverse },
                  ]}
                >
                  {initials}
                </Text>
              </View>
              <Animated.View style={profileNameStyle}>
                <Text
                  style={[
                    styles.headerProfileName,
                    { color: Colors.text.primary },
                  ]}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
              </Animated.View>
            </Animated.View>
          </Pressable>
        </View>

        <Pressable
          onPress={handleSignOut}
          hitSlop={12}
          style={styles.headerIconButton}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <View
            style={[
              styles.iconButtonCircle,
              {
                backgroundColor: isDark
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(239, 68, 68, 0.1)",
              },
            ]}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          </View>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  headerContent: {
    height: HEADER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleContainer: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  headerSettingsWrapper: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  headerSettingsTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerProfileTouchable: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  headerProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  headerAvatarText: {
    fontSize: 12,
    fontWeight: "700",
  },
  headerProfileName: {
    fontSize: 15,
    fontWeight: "600",
    maxWidth: 150,
  },
});
