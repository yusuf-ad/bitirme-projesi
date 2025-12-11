import { getThemeColors } from "@/constants/theme";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/providers/theme-provider";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface ProfileHeaderProps {
  profile: {
    avatar_url?: string | null;
    full_name?: string | null;
  } | null;
  session: {
    user?: {
      email?: string | null;
      created_at?: string | null;
    } | null;
  } | null;
}

function getUserInitials(
  profile: ProfileHeaderProps["profile"],
  session: ProfileHeaderProps["session"]
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
  profile: ProfileHeaderProps["profile"],
  session: ProfileHeaderProps["session"]
) {
  if (profile?.full_name) return profile.full_name;
  if (session?.user?.email) return session.user.email.split("@")[0];
  return "User";
}

function getMemberSinceDate(session: ProfileHeaderProps["session"]) {
  if (session?.user?.created_at) {
    const date = new Date(session.user.created_at);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }
  return "Recently";
}

export const ProfileHeader = React.memo(function ProfileHeader({
  profile,
  session,
}: ProfileHeaderProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const Colors = getThemeColors(isDark);

  const initials = React.useMemo(
    () => getUserInitials(profile, session),
    [profile?.full_name, session?.user?.email]
  );

  const displayName = React.useMemo(
    () => getUserDisplayName(profile, session),
    [profile?.full_name, session?.user?.email]
  );

  const memberSince = React.useMemo(
    () => getMemberSinceDate(session),
    [session?.user?.created_at]
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      style={styles.profileHeader}
    >
      <LinearGradient
        colors={[Colors.lilac[900], Colors.lilac[900], Colors.lilac[900]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatarGradientBorder}
      >
        <View
          style={[
            styles.avatarContainer,
            { backgroundColor: Colors.background.secondary },
          ]}
        >
          {profile?.avatar_url ? (
            <ExpoImage
              source={{ uri: profile.avatar_url }}
              style={styles.avatarImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <Text style={[styles.avatarText, { color: Colors.lilac[800] }]}>
              {initials}
            </Text>
          )}
        </View>
      </LinearGradient>

      <View style={styles.profileInfo}>
        <Text style={[styles.profileName, { color: Colors.text.primary }]}>
          {displayName}
        </Text>
        <Text
          style={[styles.profileMemberSince, { color: Colors.text.tertiary }]}
        >
          {t("profile.memberSince")} {memberSince}
        </Text>
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  profileHeader: {
    marginHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 12,
  },
  avatarGradientBorder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  profileMemberSince: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.6,
  },
});
