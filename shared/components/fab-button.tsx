import AntDesign from "@expo/vector-icons/build/AntDesign";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SecondaryActionButton } from "./secondary-action-button";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FabButtonProps {
  currentRouteName: string;
}

interface FabAction {
  iconName: string;
  onPress: () => void;
}

export function FabButton({ currentRouteName }: FabButtonProps) {
  const router = useRouter();
  const isExpanded = useSharedValue(false);

  const handleMainButtonPress = () => {
    isExpanded.value = !isExpanded.value;
  };

  const ANIMATION_DURATION = 300; // Animation duration in ms

  const plusIconStyle = useAnimatedStyle(() => {
    const rotateValue = isExpanded.value ? "45deg" : "0deg";

    return {
      transform: [
        { rotate: withTiming(rotateValue, { duration: ANIMATION_DURATION }) },
      ],
    };
  });

  // Define actions based on the current route
  const getActions = (): FabAction[] => {
    switch (currentRouteName) {
      case "pantry":
        return [
          {
            iconName: "camera",
            onPress: () => {
              // Close FAB first, then navigate
              isExpanded.value = false;
              // Wait for animation to complete before navigation
              setTimeout(() => {
                router.push("/(add)/camera");
              }, ANIMATION_DURATION);
            },
          },
        ];
      case "recipes":
        return [
          {
            iconName: "plus",
            onPress: () => {
              console.log("Add recipe");
              handleMainButtonPress();
            },
          },
        ];
      case "index": // Home
        return [
          {
            iconName: "book", // Example: Add to plan
            onPress: () => {
              // Close FAB first, then navigate
              isExpanded.value = false;
              // Wait for animation to complete before navigation
              setTimeout(() => {
                router.push("/(plan)/create");
              }, ANIMATION_DURATION);
            },
          },
        ];
      case "(profile)":
        return [
          {
            iconName: "gear", // Example: Settings
            onPress: () => {
              console.log("Settings");
              handleMainButtonPress();
            },
          },
        ];
      default:
        return [];
    }
  };

  const actions = getActions();

  return (
    <View style={styles.fabContainer}>
      {/* Secondary Action Buttons */}
      {actions.map((action, index) => (
        <SecondaryActionButton
          key={`${currentRouteName}-${index}`}
          isExpanded={isExpanded}
          index={index + 1} // 1-based index for animation calculation
          iconName={action.iconName}
          onPress={action.onPress}
        />
      ))}

      {/* Main FAB Button */}
      <AnimatedPressable
        onPress={handleMainButtonPress}
        style={styles.mainButton}
      >
        <Animated.View style={plusIconStyle}>
          <AntDesign name="plus" size={24} color="#FFFFFF" />
        </Animated.View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10, // Ensure FAB and its children are above other tab bar items
  },
  mainButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#7849B6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 20,
  },
});
