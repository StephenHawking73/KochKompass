import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";


export default function RootLayout() {

    /*const [fontsLoaded] = useFonts({
        LatoRegular: require("@/assets/fonts/Lato/Lato-Regular.ttf"),
        LatoBold: require("@/assets/fonts/Lato/Lato-Bold.ttf"),
        LatoItalic: require("@/assets/fonts/Lato/Lato-Italic.ttf"),
        LatoThin: require("@/assets/fonts/Lato/Lato-Thin.ttf"),
        LatoLight: require("@/assets/fonts/Lato/Lato-Light.ttf"),
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) {
        return null;
    }*/

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