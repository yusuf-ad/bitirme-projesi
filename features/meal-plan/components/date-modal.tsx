import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import WheelPicker from "@quidone/react-native-wheel-picker";
import { forwardRef, useCallback, useState } from "react";
import { StyleSheet } from "react-native";

const data = [...Array(100).keys()].map((index) => ({
  value: index,
  label: index.toString(),
}));

export const DateModal = forwardRef<BottomSheetModal>((props, ref) => {
  const [value, setValue] = useState(0);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  // Callbacks
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

  return (
    <BottomSheetModal
      ref={ref}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.contentContainer}>
        <WheelPicker
          data={data}
          value={value}
          onValueChanged={({ item: { value } }) => setValue(value)}
          enableScrollByTapOnItem={true}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
});

DateModal.displayName = "DateModal";

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
});
