import { Colors } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { TabType } from "../types";

interface TabSwitcherProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabSwitcher}>
        <Pressable
          onPress={() => onTabChange("pantry")}
          style={[
            styles.tabButton,
            activeTab === "pantry" && styles.tabButtonActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pantry"
                ? styles.activeTabText
                : styles.inactiveTabText,
            ]}
          >
            Pantry
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onTabChange("groceries")}
          style={[
            styles.tabButton,
            activeTab === "groceries" && styles.tabButtonActive,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "groceries"
                ? styles.activeTabText
                : styles.inactiveTabText,
            ]}
          >
            Groceries
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  tabSwitcher: {
    flexDirection: "row",
    backgroundColor: Colors.background.surface,
    borderRadius: 120,
    padding: 4,
    height: 48,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 120,
  },
  tabButtonActive: {
    backgroundColor: Colors.lilac[200],
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  activeTabText: {
    color: Colors.text.primary,
  },
  inactiveTabText: {
    color: Colors.gray[400],
  },
});

