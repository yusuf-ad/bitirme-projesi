import { Colors } from "@/constants/theme";
import { useLanguage } from "@/hooks/useLanguage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const INTEGRATIONS_KEY = "profile_integrations";

interface IntegrationState {
  appleWatchConnected: boolean;
  appleWatchLastSync?: string;
  partners: Record<string, boolean>;
}

const defaultIntegrations: IntegrationState = {
  appleWatchConnected: false,
  partners: {
    strava: false,
    fitbit: false,
    healthKit: false,
  },
};

export default function IntegrationsScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { focus } = params;
  const { t, locale } = useLanguage();

  const [state, setState] = useState<IntegrationState>(defaultIntegrations);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const stored = await AsyncStorage.getItem(INTEGRATIONS_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load integrations", error);
    } finally {
      setIsReady(true);
    }
  };

  const persistState = async (updated: IntegrationState) => {
    setState(updated);
    await AsyncStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(updated));
  };

  const toggleAppleWatch = async () => {
    Haptics.selectionAsync();
    const connected = !state.appleWatchConnected;
    const updated: IntegrationState = {
      ...state,
      appleWatchConnected: connected,
      appleWatchLastSync: connected ? new Date().toISOString() : undefined,
    };
    await persistState(updated);
  };

  const togglePartner = async (partner: string) => {
    Haptics.selectionAsync();
    const updatedPartners = {
      ...state.partners,
      [partner]: !state.partners[partner],
    };
    await persistState({ ...state, partners: updatedPartners });
  };

  const partnerOptions = useMemo(
    () => [
      {
        id: "strava",
        title: t("integrations.strava"),
        description: t("integrations.stravaDesc"),
      },
      {
        id: "fitbit",
        title: t("integrations.fitbit"),
        description: t("integrations.fitbitDesc"),
      },
      {
        id: "healthKit",
        title: t("integrations.appleHealth"),
        description: t("integrations.appleHealthDesc"),
      },
    ],
    [t]
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
        <Text style={styles.headerTitle}>{t("integrations.title")}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.integrationCard,
            focus === "apple" && styles.integrationCardFocused,
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleWrapper}>
              <MaterialCommunityIcons
                name="watch-variant"
                size={24}
                color={Colors.lilac[900]}
              />
              <View>
                <Text style={styles.cardTitle}>{t("integrations.appleWatch")}</Text>
                <Text style={styles.cardSubtitle}>
                  {t("integrations.appleWatchDesc")}
                </Text>
              </View>
            </View>
            <Switch
              value={isReady ? state.appleWatchConnected : false}
              onValueChange={toggleAppleWatch}
              trackColor={{
                false: Colors.gray[200],
                true: Colors.lilac[200],
              }}
              thumbColor={
                state.appleWatchConnected ? Colors.lilac[900] : "#FFFFFF"
              }
            />
          </View>
          {state.appleWatchConnected && (
            <View style={styles.syncRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={18}
                color="#22C55E"
              />
              <Text style={styles.syncText}>
                {t("integrations.lastSynced")}{" "}
                {state.appleWatchLastSync
                  ? new Date(state.appleWatchLastSync).toLocaleString(locale === "tr" ? "tr-TR" : "en-US")
                  : t("integrations.justNow")}
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.integrationCard,
            focus === "partners" && styles.integrationCardFocused,
          ]}
        >
          <Text style={styles.cardTitle}>{t("integrations.partnerAccounts")}</Text>
          {partnerOptions.map((partner, index) => (
            <View key={partner.id}>
              <View style={styles.partnerRow}>
                <View style={styles.partnerCopy}>
                  <Text style={styles.partnerTitle}>{partner.title}</Text>
                  <Text style={styles.partnerDescription}>
                    {partner.description}
                  </Text>
                </View>
                <Switch
                  value={
                    isReady
                      ? Boolean(state.partners[partner.id])
                      : defaultIntegrations.partners[partner.id]
                  }
                  onValueChange={() => togglePartner(partner.id)}
                  trackColor={{
                    false: Colors.gray[200],
                    true: Colors.lilac[200],
                  }}
                  thumbColor={
                    state.partners[partner.id] ? Colors.lilac[900] : "#FFFFFF"
                  }
                />
              </View>
              {index < partnerOptions.length - 1 && (
                <View style={styles.divider} />
              )}
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
  integrationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  integrationCardFocused: {
    borderColor: Colors.lilac[200],
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  cardTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  syncRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  syncText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  partnerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
  },
  partnerCopy: {
    flex: 1,
  },
  partnerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 2,
  },
  partnerDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
});

