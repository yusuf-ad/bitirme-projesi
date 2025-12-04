import { Colors } from "@/constants/theme";
import {
    BottomSheetBackdrop,
    BottomSheetFlatList,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useMemo } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AllergiesModal } from "./allergies-modal";
import { BottomActions } from "./bottom-actions";
import { NUM_COLUMNS } from "./constants";
import { FloatingSelectedBar } from "./floating-selected-bar";
import { IngredientItemComponent } from "./ingredient-item";
import { ListEmptyComponent } from "./list-empty";
import { ListHeaderComponent } from "./list-header";
import { ModalHeader } from "./modal-header";
import { SearchBar } from "./search-bar";
import { IngredientItem, IngredientModalProps } from "./types";
import { useIngredientModal } from "./use-ingredient-modal";

export const IngredientModal = forwardRef<
  BottomSheetModal,
  IngredientModalProps
>(({ onIngredientsSelect }, ref) => {
  const { top } = useSafeAreaInsets();
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    hasSearched,
    showAllergies,
    setShowAllergies,
    userAllergies,
    isScrolledDown,
    searchFocused,
    selectedItems,
    selectedKeysSet,
    displayItems,
    searchResults,
    getIngredientKey,
    toggleIngredient,
    handleClearAll,
    handleScroll,
    getIngredientsToSend,
  } = useIngredientModal();

  const screenHeight =
    Dimensions.get("screen").height - top - (Platform.OS === "ios" ? 24 : 0);

  const snapPoints = useMemo(() => ["95%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const handleApply = useCallback(() => {
    const ingredientsToSend = getIngredientsToSend();
    onIngredientsSelect?.(ingredientsToSend);
    if (typeof ref !== "function" && ref?.current?.dismiss) {
      ref.current.dismiss();
    }
  }, [getIngredientsToSend, onIngredientsSelect, ref]);

  const handleClose = useCallback(() => {
    if (typeof ref !== "function" && ref?.current?.dismiss) {
      ref.current.dismiss();
    }
  }, [ref]);

  // Render item for FlatList
  const renderItem = useCallback(
    ({ item }: { item: IngredientItem }) => {
      const key = getIngredientKey(item);
      const isSelected = selectedKeysSet.has(key);
      return (
        <IngredientItemComponent
          item={item}
          isSelected={isSelected}
          onPress={() => toggleIngredient(item)}
        />
      );
    },
    [getIngredientKey, selectedKeysSet, toggleIngredient]
  );

  const keyExtractor = useCallback(
    (item: IngredientItem) => getIngredientKey(item),
    [getIngredientKey]
  );

  // List header component
  const ListHeader = useMemo(
    () => (
      <ListHeaderComponent
        selectedItems={selectedItems}
        isScrolledDown={isScrolledDown}
        hasSearched={hasSearched}
        getIngredientKey={getIngredientKey}
        toggleIngredient={toggleIngredient}
      />
    ),
    [
      selectedItems,
      isScrolledDown,
      hasSearched,
      getIngredientKey,
      toggleIngredient,
    ]
  );

  // List empty component
  const ListEmpty = useMemo(
    () => (
      <ListEmptyComponent
        isSearching={isSearching}
        hasSearched={hasSearched}
        searchResultsCount={searchResults.length}
      />
    ),
    [isSearching, hasSearched, searchResults.length]
  );

  return (
    <BottomSheetModal
      ref={ref}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enableOverDrag={false}
      enablePanDownToClose={false}
      handleIndicatorStyle={styles.handleIndicator}
      backgroundStyle={styles.modalBackground}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
    >
      <BottomSheetView
        style={[styles.contentContainer, { height: screenHeight }]}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <ModalHeader
            userAllergies={userAllergies}
            onShowAllergies={() => setShowAllergies(true)}
            onClose={handleClose}
          />

          {/* Search Bar */}
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearching={isSearching}
            searchFocused={searchFocused}
          />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Floating Selected Bar - Shows when scrolled down */}
          <FloatingSelectedBar
            selectedItems={selectedItems}
            isScrolledDown={isScrolledDown}
            getIngredientKey={getIngredientKey}
            toggleIngredient={toggleIngredient}
          />

          {/* Ingredients FlatList */}
          <BottomSheetFlatList
            data={displayItems}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            numColumns={NUM_COLUMNS}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={ListEmpty}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
            onScroll={(e: { nativeEvent: { contentOffset: { y: number } } }) =>
              handleScroll(e.nativeEvent.contentOffset.y)
            }
            scrollEventThrottle={16}
            removeClippedSubviews={true}
            maxToRenderPerBatch={12}
            windowSize={5}
            initialNumToRender={16}
            getItemLayout={(
              _data: ArrayLike<IngredientItem> | null | undefined,
              index: number
            ) => ({
              length: 100,
              offset: 100 * Math.floor(index / NUM_COLUMNS),
              index,
            })}
          />
        </View>

        {/* Bottom Action Buttons */}
        <BottomActions
          selectedCount={selectedItems.length}
          onClearAll={handleClearAll}
          onApply={handleApply}
        />
      </BottomSheetView>

      {/* Allergies Info Modal */}
      <AllergiesModal
        visible={showAllergies}
        onClose={() => setShowAllergies(false)}
        allergies={userAllergies}
        onNavigateToSettings={handleClose}
      />
    </BottomSheetModal>
  );
});

IngredientModal.displayName = "IngredientModal";

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: Colors.gray[300],
    width: 40,
    height: 4,
  },
  modalBackground: {
    backgroundColor: "#FAFAFA",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  headerContainer: {
    marginBottom: 8,
  },
  mainContent: {
    flex: 1,
    position: "relative",
  },
  flatListContent: {
    paddingBottom: 24,
    paddingTop: 12,
  },
});
