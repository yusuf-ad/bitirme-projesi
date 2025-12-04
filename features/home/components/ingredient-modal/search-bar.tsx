import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { SearchBarProps } from "./types";

interface SearchBarComponentProps extends SearchBarProps {
  searchFocused: SharedValue<number>;
}

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  isSearching,
  searchFocused,
}: SearchBarComponentProps) => {
  const searchBarAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      searchFocused.value,
      [0, 1],
      [Colors.lilac[200], Colors.lilac[500]]
    ),
    shadowOpacity: withTiming(searchFocused.value * 0.15),
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(200).springify()}
      style={[styles.searchBar, searchBarAnimatedStyle]}
    >
      <View style={styles.searchIconWrapper}>
        <Ionicons name="search" size={18} color={Colors.lilac[500]} />
      </View>
      <TextInput
        style={styles.searchInput}
        placeholder="What's in your pantry?"
        placeholderTextColor={Colors.gray[400]}
        value={searchQuery}
        onChangeText={setSearchQuery}
        onFocus={() => {
          searchFocused.value = withTiming(1, { duration: 200 });
        }}
        onBlur={() => {
          searchFocused.value = withTiming(0, { duration: 200 });
        }}
      />
      {searchQuery.length > 0 && !isSearching && (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <Pressable
            onPress={() => setSearchQuery("")}
            style={styles.clearSearchButton}
          >
            <AntDesign name="close-circle" size={16} color={Colors.gray[400]} />
          </Pressable>
        </Animated.View>
      )}
      {isSearching && (
        <Animated.View entering={FadeIn} exiting={FadeOut}>
          <ActivityIndicator size="small" color={Colors.lilac[500]} />
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 8,
    borderWidth: 1.5,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: Colors.lilac[500],
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  searchIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.lilac[100],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
    fontWeight: "500",
  },
  clearSearchButton: {
    padding: 4,
  },
});
