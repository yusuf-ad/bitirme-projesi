import { getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
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
  function SettingsSectionComponent({ section }: SettingsSectionProps) {
    const { isDark } = useTheme();

    // Memoize theme colors to prevent recalculation
    const Colors = useMemo(() => getThemeColors(isDark), [isDark]);

    return (
      <View style={styles.sectionWrapper}>
        <Text style={[styles.sectionTitle, { color: Colors.text.primary }]}>
          {section.title}
        </Text>
        <View style={styles.sectionItems}>
          {section.items.map((item) => (
            <MenuItemComponent key={item.id} item={item} />
          ))}
        </View>
      </View>
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
