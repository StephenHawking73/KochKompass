import { AuthProvider } from "@/src/context/AuthContext";
import { Slot } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <AuthProvider>
        <Slot screenOptions={{headerShown: false}}/>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}