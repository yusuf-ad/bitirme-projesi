import { Colors } from "@/constants/theme";
import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const { top } = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar_url || "");
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;

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
      Alert.alert("Success", "Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", `Failed to update profile: ${(error as any).message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
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

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.lilac[100], Colors.background.secondary]}
        style={[styles.headerGradient, { paddingTop: top }]}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color={Colors.text.primary}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Account</Text>
          <Animated.View entering={FadeInRight.delay(300).springify()}>
            <Pressable
              onPress={handleSignOut}
              style={styles.signOutHeaderButton}
              hitSlop={8}
            >
              <Text style={styles.signOutHeaderText}>Sign Out</Text>
              <MaterialCommunityIcons
                name="logout"
                size={16}
                color={Colors.semantic.error.main}
              />
            </Pressable>
          </Animated.View>
        </View>

        <View style={styles.profileHeader}>
          <Pressable
            style={styles.avatarContainer}
            onPress={() => setIsAvatarModalVisible(true)}
          >
            <LinearGradient
              colors={[Colors.lilac[300], Colors.lilac[100]]}
              style={styles.avatarGradient}
            >
              {selectedAvatar ? (
                <Image
                  source={{ uri: selectedAvatar }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <Text style={styles.avatarText}>
                  {getInitials(profile?.full_name || "User")}
                </Text>
              )}
            </LinearGradient>
            <View style={styles.editBadge}>
              <MaterialCommunityIcons
                name="pencil"
                size={14}
                color={Colors.lilac[900]}
              />
            </View>
          </Pressable>
          <Text style={styles.profileName}>
            {profile?.full_name || "User"}
          </Text>
          <Text style={styles.profileEmail}>{session?.user?.email}</Text>
        </View>
      </LinearGradient>

      <Modal
        visible={isAvatarModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAvatarModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose an Avatar</Text>
              <Pressable
                onPress={() => setIsAvatarModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={Colors.text.primary}
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
                  ]}
                  onPress={() => {
                    setSelectedAvatar(avatar);
                    setIsAvatarModalVisible(false);
                  }}
                >
                  <Image
                    source={{ uri: avatar }}
                    style={styles.avatarOptionImage}
                    contentFit="cover"
                  />
                  {selectedAvatar === avatar && (
                    <View style={styles.checkBadge}>
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.text.tertiary}
                autoFocus
              />
            ) : (
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>
                  {profile?.full_name || "Not set"}
                </Text>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color={Colors.green[500]}
                />
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.readOnlyField, styles.disabledField]}>
              <Text style={[styles.readOnlyText, { color: Colors.text.secondary }]}>
                {session?.user?.email}
              </Text>
              <MaterialCommunityIcons
                name="lock"
                size={18}
                color={Colors.text.tertiary}
              />
            </View>
          </View>

          {isEditing ? (
            <View style={styles.actionButtons}>
              <Pressable
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setFullName(profile?.full_name || "");
                  setSelectedAvatar(profile?.avatar_url || "");
                }}
                disabled={isSaving}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  headerGradient: {
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 24,
    height: 44,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  signOutHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  signOutHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.semantic.error.main,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },
  profileHeader: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
    shadowColor: Colors.lilac[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.lilac[900],
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.lilac[900],
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
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
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  scrollView: {
    flex: 1,
    marginTop: -20,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.secondary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.lilac[300],
  },
  readOnlyField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  disabledField: {
    opacity: 0.7,
  },
  readOnlyText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: Colors.gray[100],
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.secondary,
  },
  saveButton: {
    backgroundColor: Colors.lilac[900],
    shadowColor: Colors.lilac[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  editButton: {
    backgroundColor: Colors.lilac[900],
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
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
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
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
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "transparent",
    padding: 2,
  },
  selectedAvatarOption: {
    borderColor: Colors.lilac[600],
  },
  avatarOptionImage: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
    backgroundColor: Colors.lilac[100],
  },
  checkBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.lilac[600],
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
