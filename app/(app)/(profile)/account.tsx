import { getThemeColors } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AccountScreen() {
  const { profile, session } = useAuthContext();
  const { top, bottom } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isSaving, setIsSaving] = useState(false);

  const getUserInitials = useCallback(() => {
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
    return "U";
  }, [profile, session]);

  const getMemberSinceDate = useCallback(() => {
    if (session?.user?.created_at) {
      const date = new Date(session.user.created_at);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    return "Recently";
  }, [session]);

  const handleSave = async () => {
    if (!session?.user?.id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", session.user.id);

      if (error) throw error;
      Alert.alert("Success", "Your profile has been updated!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
        },
      },
    ]);
  };

  const SettingsItem = ({
    icon,
    label,
    subtitle,
    onPress,
    showChevron = true,
    danger = false,
    delay = 0,
  }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    subtitle?: string;
    onPress: () => void;
    showChevron?: boolean;
    danger?: boolean;
    delay?: number;
  }) => {
    const scale = useSharedValue(1);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const iconColor = danger ? "#EF4444" : Colors.lilac[700];
    const textColor = danger ? "#EF4444" : Colors.text.primary;

    return (
      <Animated.View entering={FadeInDown.delay(delay).springify()}>
        <AnimatedPressable
          style={[
            styles.settingsItem,
            { backgroundColor: Colors.background.surface },
            animatedStyle,
          ]}
          onPressIn={() => {
            scale.value = withSpring(0.98);
          }}
          onPressOut={() => {
            scale.value = withSpring(1);
          }}
          onPress={() => {
            Haptics.selectionAsync();
            onPress();
          }}
        >
          <View
            style={[
              styles.settingsIconContainer,
              {
                backgroundColor: danger
                  ? "rgba(239, 68, 68, 0.1)"
                  : isDark
                  ? Colors.background.tertiary
                  : Colors.lilac[100],
              },
            ]}
          >
            <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
          </View>
          <View style={styles.settingsContent}>
            <Text style={[styles.settingsLabel, { color: textColor }]}>
              {label}
            </Text>
            {subtitle && (
              <Text
                style={[styles.settingsSubtitle, { color: Colors.text.tertiary }]}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {showChevron && (
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.text.tertiary}
            />
          )}
        </AnimatedPressable>
      </Animated.View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors.background.secondary, paddingTop: top },
      ]}
    >
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(50)}
        style={[styles.header, { backgroundColor: Colors.background.surface }]}
      >
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
          style={styles.backButton}
          hitSlop={12}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>
          Account
        </Text>
        <View style={styles.headerRight} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Animated.View
          entering={FadeInUp.delay(100).springify()}
          style={[
            styles.profileCard,
            { backgroundColor: Colors.background.surface },
          ]}
        >
          {/* Avatar */}
          <View
            style={[styles.avatarContainer, { backgroundColor: Colors.lilac[600] }]}
          >
            <Text style={styles.avatarText}>{getUserInitials()}</Text>
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: Colors.text.primary }]}>
              {profile?.full_name || session?.user?.email?.split("@")[0] || "User"}
            </Text>
            <Text style={[styles.profileEmail, { color: Colors.text.secondary }]}>
              {session?.user?.email}
            </Text>
            <View style={styles.memberBadge}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={14}
                color={Colors.green[700]}
              />
              <Text style={[styles.memberText, { color: Colors.text.tertiary }]}>
                Member since {getMemberSinceDate()}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Edit Profile Section */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: Colors.text.secondary }]}>
            Profile Information
          </Text>

          <View
            style={[
              styles.editCard,
              { backgroundColor: Colors.background.surface },
            ]}
          >
            {/* Full Name Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldHeader}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color={Colors.lilac[700]}
                />
                <Text style={[styles.fieldLabel, { color: Colors.text.secondary }]}>
                  Full Name
                </Text>
              </View>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.fieldInput,
                    {
                      color: Colors.text.primary,
                      backgroundColor: isDark
                        ? Colors.background.tertiary
                        : Colors.gray[100],
                      borderColor: Colors.lilac[400],
                    },
                  ]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your name"
                  placeholderTextColor={Colors.text.tertiary}
                  autoCapitalize="words"
                />
              ) : (
                <Text style={[styles.fieldValue, { color: Colors.text.primary }]}>
                  {profile?.full_name || "Not set"}
                </Text>
              )}
            </View>

            <View
              style={[styles.divider, { backgroundColor: Colors.border.light }]}
            />

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldHeader}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={Colors.lilac[700]}
                />
                <Text style={[styles.fieldLabel, { color: Colors.text.secondary }]}>
                  Email Address
                </Text>
              </View>
              <Text style={[styles.fieldValue, { color: Colors.text.primary }]}>
                {session?.user?.email}
              </Text>
            </View>

            {/* Edit/Save Buttons */}
            <View style={styles.editButtonsRow}>
              {isEditing ? (
                <>
                  <Pressable
                    style={[
                      styles.cancelBtn,
                      { backgroundColor: Colors.gray[isDark ? 700 : 200] },
                    ]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setIsEditing(false);
                      setFullName(profile?.full_name || "");
                    }}
                  >
                    <Text
                      style={[styles.cancelBtnText, { color: Colors.text.primary }]}
                    >
                      Cancel
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.saveBtn, { backgroundColor: Colors.lilac[700] }]}
                    onPress={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Text style={styles.saveBtnText}>Saving...</Text>
                    ) : (
                      <>
                        <MaterialCommunityIcons
                          name="check"
                          size={18}
                          color="#FFFFFF"
                        />
                        <Text style={styles.saveBtnText}>Save</Text>
                      </>
                    )}
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={[
                    styles.editBtn,
                    {
                      backgroundColor: isDark
                        ? Colors.lilac[800]
                        : Colors.lilac[100],
                    },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setIsEditing(true);
                  }}
                >
                  <MaterialCommunityIcons
                    name="pencil-outline"
                    size={18}
                    color={isDark ? Colors.lilac[200] : Colors.lilac[800]}
                  />
                  <Text
                    style={[
                      styles.editBtnText,
                      { color: isDark ? Colors.lilac[200] : Colors.lilac[800] },
                    ]}
                  >
                    Edit Profile
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text.secondary }]}>
            Settings
          </Text>
          <SettingsItem
            icon="shield-lock-outline"
            label="Privacy & Security"
            subtitle="Manage your data and permissions"
            onPress={() => router.push("/(app)/(profile)/privacy")}
            delay={300}
          />
          <SettingsItem
            icon="bell-outline"
            label="Notifications"
            subtitle="Meal reminders and updates"
            onPress={() => router.push("/(app)/(profile)/notifications")}
            delay={350}
          />
          <SettingsItem
            icon="help-circle-outline"
            label="Help & Support"
            subtitle="FAQs and contact us"
            onPress={() => router.push("/(app)/(profile)/support-feedback")}
            delay={400}
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text.secondary }]}>
            Session
          </Text>
          <SettingsItem
            icon="logout"
            label="Sign Out"
            subtitle="You can sign back in anytime"
            onPress={handleSignOut}
            showChevron={false}
            danger
            delay={450}
          />
        </View>

        {/* Version */}
        <Animated.View
          entering={FadeInDown.delay(500)}
          style={styles.versionContainer}
        >
          <Text style={[styles.versionText, { color: Colors.text.tertiary }]}>
            PlannedEat v1.0.0
          </Text>
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
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#7849B6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(84, 138, 106, 0.1)",
  },
  memberText: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  editCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  fieldContainer: {
    paddingVertical: 12,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: "600",
    paddingLeft: 28,
  },
  fieldInput: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginLeft: 28,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  editButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  editBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  cancelBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  settingsIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  settingsContent: {
    flex: 1,
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 13,
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
