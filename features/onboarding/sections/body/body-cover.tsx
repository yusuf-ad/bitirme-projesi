import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

interface BodyCoverProps {
  title: string;
  description?: string;
}

export function BodyCover({ title, description }: BodyCoverProps) {
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
    fontSize: 48,
    lineHeight: 58,
    color: Colors.text.inverse,
    marginBottom: 42,
    maxWidth: 344,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 28,
    color: Colors.text.inverse,
    maxWidth: 317,
  },
});
