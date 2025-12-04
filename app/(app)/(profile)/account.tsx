import { getThemeColors } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
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
  withSpring
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AVATARS = [
  "https://api.dicebear.com/9.x/personas/png?seed=Felix2&skinTone=f5d0c5&mouth=smile",
  "https://api.dicebear.com/9.x/personas/png?seed=Aneka2&skinTone=f5d0c5&mouth=smile",
  "https://api.dicebear.com/9.x/personas/png?seed=Jake2&skinTone=f5d0c5&mouth=smirk",
  "https://api.dicebear.com/9.x/personas/png?seed=Aiden2&skinTone=f5d0c5&mouth=smile",
  "https://api.dicebear.com/9.x/personas/png?seed=Liliana2&skinTone=f5d0c5&mouth=smile",
  "https://api.dicebear.com/9.x/personas/png?seed=Sam2&skinTone=f5d0c5&mouth=smirk",
  "https://api.dicebear.com/9.x/personas/png?seed=Alexander2&skinTone=f5d0c5&mouth=smile",
  "https://api.dicebear.com/9.x/personas/png?seed=Mason2&skinTone=f5d0c5&mouth=smirk",
];

export default function AccountScreen() {
  const { profile, session, refreshProfile } = useAuthContext();
  const { top, bottom } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_url || "");
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setSelectedAvatar(profile.avatar_url || "");
    }
  }, [profile]);

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
        .update({
          full_name: fullName,
          avatar_url: selectedAvatar,
        })
        .eq("id", session.user.id);

      if (error) throw error;
      
      await refreshProfile();
      Alert.alert("Success", "Your profile has been updated!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAvatar = async (newAvatar: string) => {
    if (!session?.user?.id) return;
    Haptics.selectionAsync();
    setSelectedAvatar(newAvatar);
    setIsAvatarModalVisible(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: newAvatar,
        })
        .eq("id", session.user.id);

      if (error) throw error;

      await refreshProfile();
    } catch (error) {
      console.error("Error updating avatar:", error);
      Alert.alert("Error", "Failed to update avatar. Please try again.");
      // Revert to profile avatar if failed
      if (profile?.avatar_url) {
        setSelectedAvatar(profile.avatar_url);
      }
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

    const iconColor = danger ? "#EF4444" : Colors.lilac[600];
    const textColor = danger ? "#EF4444" : Colors.text.primary;

    return (
      <Animated.View entering={FadeInDown.delay(delay).springify()} style={styles.menuItemWrapper}>
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
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.03)",
              },
            ]}
          >
            <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
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
              size={20}
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
          Edit Profile
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
          style={styles.profileCard}
        >
          {/* Avatar */}
          <Pressable
            onPress={() => {
              Haptics.selectionAsync();
              setIsAvatarModalVisible(true);
            }}
          >
            <LinearGradient
                colors={['#A78BFA', '#7C3AED', '#4ADE80']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradientBorder}
            >
                <View style={[styles.avatarContainer, { backgroundColor: Colors.background.secondary }]}>
                    {selectedAvatar ? (
                    <ExpoImage
                        source={{ uri: selectedAvatar }}
                        style={styles.avatarImage}
                        contentFit="cover"
                        transition={200}
                    />
                    ) : (
                    <Text style={[styles.avatarText, { color: Colors.lilac[800] }]}>{getUserInitials()}</Text>
                    )}
                </View>
            </LinearGradient>
            <View style={[styles.editBadge, { backgroundColor: Colors.background.surface }]}>
              <MaterialCommunityIcons
                name="camera-outline"
                size={14}
                color={Colors.text.primary}
              />
            </View>
          </Pressable>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: Colors.text.primary }]}>
              {profile?.full_name || session?.user?.email?.split("@")[0] || "User"}
            </Text>
            <Text style={[styles.profileEmail, { color: Colors.text.secondary }]}>
              {session?.user?.email}
            </Text>
            <View style={[styles.memberBadge, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }]}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={14}
                color={Colors.green[600]}
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
          <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>
            Personal Information
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
                  color={Colors.lilac[600]}
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
              style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }]}
            />

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <View style={styles.fieldHeader}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color={Colors.lilac[600]}
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
                      { backgroundColor: isDark ? Colors.gray[700] : Colors.gray[200] },
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
                    style={[styles.saveBtn, { backgroundColor: Colors.lilac[600] }]}
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
                        <Text style={styles.saveBtnText}>Save Changes</Text>
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
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
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
                    color={Colors.text.primary}
                  />
                  <Text
                    style={[
                      styles.editBtnText,
                      { color: Colors.text.primary },
                    ]}
                  >
                    Edit Information
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </Animated.View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>
            Account Settings
          </Text>
          <View style={styles.settingsGroup}>
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
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>
            Session
          </Text>
          <View style={styles.settingsGroup}>
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
      {/* Avatar Selection Modal */}
      <Modal
        visible={isAvatarModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: Colors.background.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors.text.primary }]}>
                Choose an Avatar
              </Text>
              <Pressable
                onPress={() => setIsAvatarModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={Colors.text.secondary}
                />
              </Pressable>
            </View>

            <View style={styles.avatarGrid}>
              {AVATARS.map((avatar, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.avatarOption,
                    selectedAvatar === avatar && styles.selectedAvatarOption,
                    {
                      borderColor:
                        selectedAvatar === avatar
                          ? Colors.lilac[600]
                          : "transparent",
                    },
                  ]}
                  onPress={() => {
                    handleUpdateAvatar(avatar);
                  }}
                >
                  <ExpoImage
                    source={{ uri: avatar }}
                    style={styles.avatarOptionImage}
                    contentFit="cover"
                    transition={200}
                  />
                  {selectedAvatar === avatar && (
                    <View
                      style={[
                        styles.checkBadge,
                        { backgroundColor: Colors.lilac[600] },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="check"
                        size={12}
                        color="#FFF"
                      />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  profileCard: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarGradientBorder: {
    width: 108,
    height: 108,
    borderRadius: 54,
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
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
  },
  profileInfo: {
    alignItems: "center",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: -0.5,
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
  },
  memberText: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  editCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
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
  settingsGroup: {
    gap: 12,
  },
  menuItemWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
  },
  settingsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  settingsContent: {
    flex: 1,
  },
  settingsLabel: {
    fontSize: 16,
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
    fontSize: 12,
    fontWeight: "500",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  avatarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "center",
  },
  avatarOption: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    padding: 2,
    position: "relative",
  },
  selectedAvatarOption: {
    // Border color handled inline
  },
  avatarOptionImage: {
    width: "100%",
    height: "100%",
    borderRadius: 36,
  },
  checkBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
