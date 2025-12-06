import { Colors } from "@/constants/theme";
import { useLanguage } from "@/hooks/useLanguage";
import { StyleSheet, Text, View } from "react-native";

interface EndMessageProps {
  message?: string;
}

export function EndMessage({ message }: EndMessageProps) {
  const { t } = useLanguage();
  
  return (
    <View style={styles.endContainer}>
      <Text style={styles.endText}>{message || t("recipes.endOfResults")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  endContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  endText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontStyle: "italic",
  },
});
