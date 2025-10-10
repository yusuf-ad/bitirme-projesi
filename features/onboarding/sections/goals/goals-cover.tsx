import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

interface GoalsCoverProps {
  title: string;
  description?: string;
}

export function GoalsCover({ title, description }: GoalsCoverProps) {
  return (
    <View style={styles.content}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 267,
  },
  textContainer: {
    paddingHorizontal: 27,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 40,
    lineHeight: 48.4,
    color: Colors.text.inverse,
    marginBottom: 62,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 28,
    color: Colors.text.inverse,
    paddingHorizontal: 4,
    maxWidth: 300,
  },
});
