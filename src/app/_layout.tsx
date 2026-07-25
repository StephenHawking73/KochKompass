import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { LoadingScreen } from "@/components/loadingScreen";

import { View, Text } from "react-native";


function RootNavigator() {

    const {
        session,
        loading,
        error
    } = useAuth();


    if (loading) {
        return <LoadingScreen />;
    }


    if (error) {
        return (
            <View>
                <Text>
                    Keine Verbindung zum Server möglich.
                </Text>
            </View>
        );
    }


    return (
        <Stack screenOptions={{
            headerShown:false
        }}>

            <Stack.Protected guard={!!session}>
                <Stack.Screen name="(tabs)" />
            </Stack.Protected>


            <Stack.Protected guard={!session}>
                <Stack.Screen name="(auth)" />
            </Stack.Protected>

        </Stack>
    );
}



export default function RootLayout() {

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{flex:1}}>
                <ThemeProvider>
                    <AuthProvider>
                        <RootNavigator />
                    </AuthProvider>
                </ThemeProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}