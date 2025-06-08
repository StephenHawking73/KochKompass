import { AuthProvider } from "@/src/context/AuthContext";
import { Slot } from "expo-router";

export default function RootLayout() {
  return <AuthProvider><Slot screenOptions={{headerShown: false}}/></AuthProvider>
}