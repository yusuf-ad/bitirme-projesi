import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import LoginTab from "./login-tab";

export const AuthModal = forwardRef<BottomSheetModal>((props, ref) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

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
        <View style={styles.tabContainer}>
          <Pressable style={styles.tab} onPress={() => setActiveTab("signup")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "signup" && styles.activeTabText,
              ]}
            >
              Create Account
            </Text>
            <View
              style={[
                styles.tabIndicator,
                activeTab === "signup" && styles.activeTabIndicator,
                { width: activeTab === "signup" ? 77 : 22 },
              ]}
            />
          </Pressable>
          <Pressable style={styles.tab} onPress={() => setActiveTab("login")}>
            <Text
              style={[
                styles.tabText,
                activeTab === "login" && styles.activeTabText,
              ]}
            >
              Login
            </Text>
            <View
              style={[
                styles.tabIndicator,
                activeTab === "login" && styles.activeTabIndicator,
                { width: activeTab === "login" ? 22 : 77 },
              ]}
            />
          </Pressable>
        </View>

        {activeTab === "login" && <LoginTab />}
        {activeTab === "signup" && <LoginTab />}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

AuthModal.displayName = "AuthModal";

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 36,
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  tabText: {
    marginVertical: 10,
    fontWeight: "bold",
    fontSize: 16,
    color: "#A1A4AA",
  },
  tabIndicator: {
    marginTop: "auto",
    height: 3,
    backgroundColor: "transparent",
  },
  activeTabIndicator: {
    backgroundColor: "#875EC5",
  },
  activeTabText: {
    color: "#875EC5",
  },
});
