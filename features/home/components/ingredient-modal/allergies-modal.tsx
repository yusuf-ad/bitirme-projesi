import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
} from "react-native-reanimated";
import { AllergiesModalProps } from "./types";

export const AllergiesModal = ({
  visible,
  onClose,
  allergies,
}: AllergiesModalProps) => {
  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={styles.allergiesOverlay}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View
        entering={FadeInDown.springify()}
        exiting={FadeOutDown.duration(200)}
        style={styles.allergiesContainer}
      >
        {/* Allergy Modal Header */}
        <LinearGradient
          colors={["#FEF2F2", "#FFFFFF"]}
          style={styles.allergiesHeaderGradient}
        >
          <View style={styles.allergiesHeader}>
            <View style={styles.allergiesTitleContainer}>
              <View style={styles.allergiesIconWrapper}>
                <LinearGradient
                  colors={["#FCA5A5", "#EF4444"]}
                  style={styles.allergiesIconGradient}
                >
                  <MaterialCommunityIcons
                    name="shield-alert"
                    size={24}
                    color="white"
                  />
                </LinearGradient>
              </View>
              <View>
                <Text style={styles.allergiesTitle}>Allergen Protection</Text>
                <Text style={styles.allergiesSubtitleSmall}>
                  Active filters
                </Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.modalCloseButton,
                pressed && styles.modalCloseButtonPressed,
              ]}
            >
              <AntDesign name="close" size={18} color="#9CA3AF" />
            </Pressable>
          </View>
        </LinearGradient>

        {/* Allergy Count Badge */}
        <View style={styles.allergyCountContainer}>
          <View style={styles.allergyCountBadge}>
            <Text style={styles.allergyCountBadgeText}>
              {allergies.length} allergen{allergies.length !== 1 ? "s" : ""}
            </Text>
          </View>
          <Text style={styles.allergiesSubtitle}>
            automatically filtered from search results
          </Text>
        </View>

        {/* Allergy List */}
        <ScrollView
          style={styles.allergiesList}
          showsVerticalScrollIndicator={false}
        >
          {allergies.map((allergy) => (
            <View key={allergy.id} style={styles.allergyItem}>
              <LinearGradient
                colors={["#FFF5F5", "#FEFEFE"]}
                style={styles.allergyItemGradient}
              >
                {allergy.imageUrl ? (
                  <Image
                    source={{ uri: allergy.imageUrl }}
                    style={styles.allergyImage}
                  />
                ) : (
                  <View style={styles.allergyImagePlaceholder}>
                    <MaterialCommunityIcons
                      name="food-off"
                      size={22}
                      color="#EF4444"
                    />
                  </View>
                )}
                <View style={styles.allergyInfo}>
                  <Text style={styles.allergyName}>{allergy.name}</Text>
                  <View style={styles.allergyStatusRow}>
                    <View style={styles.allergyStatusDot} />
                    <Text style={styles.allergyStatus}>Actively filtered</Text>
                  </View>
                </View>
                <View style={styles.allergyCheckIcon}>
                  <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                </View>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>

        {/* Footer Info */}
        <View style={styles.allergiesFooter}>
          <LinearGradient
            colors={["#F9FAFB", "#F3F4F6"]}
            style={styles.allergiesFooterGradient}
          >
            <View style={styles.allergiesFooterIcon}>
              <Ionicons
                name="information-circle"
                size={20}
                color={Colors.lilac[500]}
              />
            </View>
            <Text style={styles.allergiesNote}>
              Ingredients containing these allergens are automatically hidden to
              keep you safe.
            </Text>
          </LinearGradient>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  allergiesOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  allergiesContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    marginHorizontal: 16,
    maxHeight: "75%",
    width: "92%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 20,
    overflow: "hidden",
  },
  allergiesHeaderGradient: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  allergiesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  allergiesTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  allergiesIconWrapper: {
    borderRadius: 16,
    overflow: "hidden",
  },
  allergiesIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  allergiesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  allergiesSubtitleSmall: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
    marginTop: 2,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseButtonPressed: {
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  allergyCountContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  allergyCountBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  allergyCountBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DC2626",
  },
  allergiesSubtitle: {
    fontSize: 13,
    color: Colors.text.tertiary,
    flex: 1,
  },
  allergiesList: {
    maxHeight: 280,
    paddingHorizontal: 16,
  },
  allergyItem: {
    marginBottom: 10,
    borderRadius: 16,
    overflow: "hidden",
  },
  allergyItemGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  allergyImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  allergyImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  allergyInfo: {
    flex: 1,
  },
  allergyName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  allergyStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  allergyStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  allergyStatus: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
  },
  allergyCheckIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  allergiesFooter: {
    margin: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
  allergiesFooterGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 10,
  },
  allergiesFooterIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.lilac[100],
    alignItems: "center",
    justifyContent: "center",
  },
  allergiesNote: {
    fontSize: 12,
    color: Colors.text.tertiary,
    flex: 1,
    lineHeight: 18,
  },
});
