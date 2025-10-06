import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from "react-native";

interface CustomButtonProps extends PressableProps {
  containerStyle?: StyleProp<ViewStyle>;
}

export default function CustomButton({
  containerStyle,
  ...props
}: CustomButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, containerStyle]}
      {...props}
    >
      {props.children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});
