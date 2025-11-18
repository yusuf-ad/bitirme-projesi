import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useMemo } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SupportFeedbackScreen() {
  const { top, bottom } = useSafeAreaInsets();

  const contactOptions = useMemo(
    () => [
      {
        id: "chat",
        title: "Live chat",
        description: "Weekdays 09:00 - 18:00 GMT+3",
        icon: "message-text-outline",
        action: () => Linking.openURL("https://plannedeat.app/support"),
      },
      {
        id: "email",
        title: "Email support",
        description: "support@plannedeat.app",
        icon: "email-outline",
        action: () =>
          Linking.openURL("mailto:support@plannedeat.app?subject=Support request"),
      },
      {
        id: "feedback",
        title: "Product feedback",
        description: "Share an idea or request a feature.",
        icon: "lightbulb-on-outline",
        action: () => Linking.openURL("https://plannedeat.app/feedback"),
      },
    ],
    []
  );

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Support & Feedback</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Need a hand?</Text>
          <Text style={styles.heroDescription}>
            Our meal planning specialists respond in under 2 hours during the day.
          </Text>
        </View>

        <Text style={styles.sectionLabel}>Contact us</Text>
        <View style={styles.card}>
          {contactOptions.map((option, index) => (
            <View key={option.id}>
              <Pressable
                style={styles.listRow}
                onPress={() => {
                  Haptics.selectionAsync();
                  option.action();
                }}
              >
                <View style={styles.iconWrapper}>
                  <MaterialCommunityIcons
                    name={option.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={20}
                    color={Colors.lilac[900]}
                  />
                </View>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>{option.title}</Text>
                  <Text style={styles.rowDescription}>{option.description}</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={Colors.text.secondary}
                />
              </Pressable>
              {index < contactOptions.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Resources</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.listRow}
            onPress={() => Linking.openURL("https://plannedeat.app/help")}
          >
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons
                name="book-open-variant"
                size={20}
                color={Colors.lilac[900]}
              />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Help center</Text>
              <Text style={styles.rowDescription}>
                Troubleshooting, billing and feature guides.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.text.secondary}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={styles.listRow}
            onPress={() => Linking.openURL("https://status.plannedeat.app")}
          >
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons
                name="pulse"
                size={20}
                color={Colors.lilac[900]}
              />
            </View>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Service status</Text>
              <Text style={styles.rowDescription}>
                Live uptime for recipes, auth and AI meal plans.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="open-in-new"
              size={20}
              color={Colors.text.secondary}
            />
          </Pressable>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  heroCard: {
    backgroundColor: Colors.lilac[50],
    borderRadius: 16,
    padding: 20,
    gap: 6,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  heroDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "600",
    textTransform: "uppercase",
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F4F4F7",
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  rowDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#EFEFEF",
  },
});

