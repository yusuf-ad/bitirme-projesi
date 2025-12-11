import { getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { MenuItem, MenuItemComponent } from "./menu-item";

export interface SettingsSection {
  id: string;
  title: string;
  items: MenuItem[];
}

interface SettingsSectionProps {
  section: SettingsSection;
  sectionIndex: number;
}

export const SettingsSectionComponent = React.memo(
  function SettingsSectionComponent({
    section,
    sectionIndex,
  }: SettingsSectionProps) {
    const { isDark } = useTheme();
    const Colors = getThemeColors(isDark);

    return (
      <Animated.View
        style={styles.sectionWrapper}
        entering={FadeInDown.delay(400 + sectionIndex * 100).springify()}
      >
        <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>
          {section.title}
        </Text>
        <View style={styles.sectionItems}>
          {section.items.map((item, index) => (
            <MenuItemComponent key={item.id} item={item} index={index} />
          ))}
        </View>
      </Animated.View>
    );
  }
);

interface SettingsSectionsProps {
  sections: SettingsSection[];
}

export const SettingsSections = React.memo(function SettingsSections({
  sections,
}: SettingsSectionsProps) {
  return (
    <View style={styles.container}>
      {sections.map((section, index) => (
        <SettingsSectionComponent
          key={section.id}
          section={section}
          sectionIndex={index}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    gap: 24,
  },
  sectionWrapper: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionItems: {
    gap: 12,
  },
});
