import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

interface HeaderProps {
  firstName: string;
  formattedDate: string;
}

export default function Header({ firstName, formattedDate }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View>
          <Text style={styles.greeting}>Hello, {firstName}!</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.profilePictureContainer}>
          <Image
            source={require("@/assets/images/profile-picture.png")}
            style={styles.profilePicture}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 20,
    color: Colors.text.primary,
    marginBottom: -4,
  },
  date: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 16,
    color: Colors.gray[300],
    marginTop: 10,
  },
  headerRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  profilePictureContainer: {
    width: 36,
    height: 36,
  },
  profilePicture: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
