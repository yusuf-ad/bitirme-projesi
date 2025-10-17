import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface TasteAllergiesProps {
  title: string;
  description?: string;
  onSelectionChange?: (selectedAllergies: string[]) => void;
  initialSelection?: string[];
}

const allergyOptions = [
  { id: "honey", label: "Honey", icon: "🍯" },
  { id: "beef", label: "Beef", icon: "🥩" },
  { id: "avocado", label: "Avocado", icon: "🥑" },
  { id: "milk", label: "Milk", icon: "🥛" },
  { id: "eggs", label: "Eggs", icon: "🥚" },
  { id: "nuts", label: "Nuts", icon: "🥜" },
  { id: "peanuts", label: "Peanuts", icon: "🥜" },
  { id: "shellfish", label: "Shellfish", icon: "🦐" },
  { id: "fish", label: "Fish", icon: "🐟" },
  { id: "soy", label: "Soy", icon: "🫘" },
  { id: "wheat", label: "Wheat", icon: "🌾" },
  { id: "sesame", label: "Sesame", icon: "🌱" },
  { id: "mustard", label: "Mustard", icon: "🟡" },
  { id: "celery", label: "Celery", icon: "🥬" },
  { id: "lupin", label: "Lupin", icon: "🟣" },
  { id: "mollusks", label: "Mollusks", icon: "🦪" },
];

export function TasteAllergies({
  title,
  description,
  onSelectionChange,
  initialSelection = [],
}: TasteAllergiesProps) {
  const [selectedAllergies, setSelectedAllergies] =
    useState<string[]>(initialSelection);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAllergies = allergyOptions.filter((allergy) =>
    allergy.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAllergy = (allergyId: string) => {
    const updatedSelection = selectedAllergies.includes(allergyId)
      ? selectedAllergies.filter((a) => a !== allergyId)
      : [...selectedAllergies, allergyId];

    setSelectedAllergies(updatedSelection);
    onSelectionChange?.(updatedSelection);
  };

  const renderAllergyItem = ({
    item,
  }: {
    item: (typeof allergyOptions)[0];
  }) => {
    const isSelected = selectedAllergies.includes(item.id);

    return (
      <Pressable
        onPress={() => toggleAllergy(item.id)}
        style={[styles.allergyItem, isSelected && styles.allergyItemSelected]}
      >
        <Text style={styles.allergyIcon}>{item.icon}</Text>
        <Text
          style={[
            styles.allergyLabel,
            isSelected && styles.allergyLabelSelected,
          ]}
          numberOfLines={1}
        >
          {item.label}
        </Text>
        {isSelected && (
          <View style={styles.checkmark}>
            <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color="#737780"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="All products"
          placeholderTextColor="#737780"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Common Products Label */}
      {searchQuery === "" && (
        <Text style={styles.sectionLabel}>Common products</Text>
      )}

      {/* Allergies Grid */}
      <FlatList
        data={filteredAllergies}
        renderItem={renderAllergyItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        scrollEnabled={false}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
      />

      {/* Counter */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {selectedAllergies.length} selected
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 20,
  },
  textContainer: {
    marginBottom: 16,
    paddingHorizontal: 15,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 24,
    lineHeight: 29,
    color: "#22252B",
    marginBottom: 8,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19,
    color: "#444955",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E3ED",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    color: "#22252B",
  },
  sectionLabel: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    color: "#000000",
    marginLeft: 15,
    marginBottom: 12,
  },
  gridContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  gridRow: {
    gap: 10,
  },
  allergyItem: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E3ED",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  allergyItemSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#548A6A",
    borderWidth: 2,
  },
  allergyIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  allergyLabel: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
  },
  allergyLabelSelected: {
    color: "#548A6A",
    fontWeight: "600",
  },
  checkmark: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#548A6A",
    alignItems: "center",
    justifyContent: "center",
  },
  counterContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  counterText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    color: "#548A6A",
  },
});
