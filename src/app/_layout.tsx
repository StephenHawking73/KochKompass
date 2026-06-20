import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{flex: 1}}>
                <ThemeProvider>
                    <Stack screenOptions={{headerShown: false}}/>
                    {/* Auth */}
                </ThemeProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}