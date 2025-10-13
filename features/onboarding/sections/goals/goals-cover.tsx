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
    fontWeight: "600",
    fontSize: 48,
    lineHeight: 58,
    color: "#2D3142",
    marginBottom: 42,
    maxWidth: 344,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 28,
    color: "#5D6270",
    maxWidth: 317,
  },
});
