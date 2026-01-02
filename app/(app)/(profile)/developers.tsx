import { getThemeColors } from "@/constants/theme";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useMemo } from "react";
import {
    Image,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Developer {
  id: string;
  name: string;
  role: string;
  image: string;
  linkedin?: string;
  github?: string;
  initials: string;
}

export default function DevelopersScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);

  const developers: Developer[] = useMemo(
    () => [
      {
        id: "yusuf",
        name: "Yusuf Ad",
        role: t("developers.fullStack"),
        image: "https://github.com/yusuf-ad.png",
        linkedin: "https://www.linkedin.com/in/yusuf-ad/",
        github: "https://github.com/yusufad",
        initials: "YA",
      },
      {
        id: "yunus",
        name: "Yunus Mert Kök",
        role: t("developers.mobile"),
        image: "https://github.com/YunusKok.png",
        linkedin: "https://www.linkedin.com/in/yunus-mert-k%C3%B6k-494b7a226/",
        github: "https://linkedin.com/in/yunus-mert-kok",
        initials: "YK",
      },
      {
        id: "osman",
        name: "Osman İleri",
        role: t("developers.uiux"),
        image: "https://github.com/osmanileri.png",
        linkedin: "https://www.linkedin.com/in/osman-ileri-944682299/",
        github: "https://github.com/osmanileri",
        initials: "OI",
      },
    ],
    [t]
  );

  return (
    <View
      style={[
        styles.container,
        { paddingTop: top, backgroundColor: Colors.background.primary },
      ]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>
          {t("developers.title")}
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {developers.map((dev) => (
            <View
              key={dev.id}
              style={[
                styles.card,
                {
                  backgroundColor: Colors.background.surface,
                  shadowColor: isDark ? "#000" : "#ccc",
                },
              ]}
            >
              <View style={[styles.avatarContainer, { shadowColor: Colors.lilac[900] }]}>
                <Image
                  source={{ uri: dev.image }}
                  style={[styles.avatar, { borderColor: Colors.lilac[900] }]}
                />
              </View>

              <Text style={[styles.name, { color: Colors.text.primary }]}>
                {dev.name}
              </Text>
              <Text style={[styles.role, { color: Colors.text.secondary }]}>
                {dev.role}
              </Text>

              <View style={styles.socials}>
                {dev.linkedin && (
                  <Pressable
                    onPress={() => Linking.openURL(dev.linkedin!)}
                    style={[styles.socialButton, { backgroundColor: "#0077B5" }]}
                  >
                    <MaterialCommunityIcons
                      name="linkedin"
                      size={24}
                      color="#FFF"
                    />
                  </Pressable>
                )}
                {dev.github && (
                  <Pressable
                    onPress={() => Linking.openURL(dev.github!)}
                    style={[styles.socialButton, { backgroundColor: "#181717" }]}
                  >
                    <MaterialCommunityIcons
                      name="github"
                      size={24}
                      color="#FFF"
                    />
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>
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
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  grid: {
    gap: 16,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 16,
    // Shadow for avatar
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  role: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  socials: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  socialButton: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
