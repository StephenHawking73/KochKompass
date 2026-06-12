import { View, ActivityIndicator, Text } from "react-native";

export function LoadingScreen({ text = "Lade..." }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10, fontSize: 20 }}>{text}</Text>
    </View>
  );
}