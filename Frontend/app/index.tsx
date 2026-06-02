import { View, Text } from "react-native";

export default function Home() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "pink",
      }}
    >
      <Text style={{ fontSize: 32, fontWeight: "bold" }}>
        Shero ❤️
      </Text>
    </View>
  );
}