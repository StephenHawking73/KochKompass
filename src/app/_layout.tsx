import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { LoadingScreen } from "@/components/loadingScreen";

import { View, Text, Image, StyleSheet } from "react-native";
import { WeekLayoutProvider } from "@/hooks/useWeekLayout";
import { images } from "@/assets/images";


function RootNavigator() {

    const {
        session,
        loading,
        error,
        isOffline,
    } = useAuth();


    if (loading) {
        return <LoadingScreen />;
    }


    if (isOffline && !session) {
        return (
            <View style={styles.offlineContainer}>
                <Image
                    source={images.noConnection}
                    style={styles.offlineImage}
                    resizeMode="contain"
                />
                <Text style={styles.offlineTitle}>Keine Internetverbindung</Text>
                <Text style={styles.offlineText}>
                    Du bist derzeit offline. Bitte prüfe deine Verbindung, bevor du Änderungen vornimmst.
                    Änderungen werden nicht mit dem Server synchronisiert und können sonst verloren gehen.
                </Text>
            </View>
        );
    }

    if (error && !session) {
        return (
            <View style={styles.offlineContainer}>
                <Image
                    source={images.noConnection}
                    style={styles.offlineImage}
                    resizeMode="contain"
                />
                <Text style={styles.offlineTitle}>Keine Verbindung zum Server</Text>
                <Text style={styles.offlineText}>
                    Der Server konnte nicht erreicht werden. Bitte prüfe deine Verbindung und warte, bis du wieder online bist.
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
                <Stack.Screen name="recipe/[id]"/>
                <Stack.Screen name="recipe/edit"/>
                <Stack.Screen name="recipe-webview"/>
            </Stack.Protected>


            <Stack.Protected guard={!session}>
                <Stack.Screen name="(auth)" />
            </Stack.Protected>

        </Stack>
    );
}

const styles = StyleSheet.create({
    offlineContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#F7F7F7',
    },
    offlineImage: {
        width: 220,
        height: 220,
        marginBottom: 20,
    },
    offlineTitle: {
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
        color: '#1F2937',
    },
    offlineText: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        color: '#4B5563',
        maxWidth: 340,
    },
});

export default function RootLayout() {

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{flex:1}}>
                <ThemeProvider>
                    <AuthProvider>
                        <WeekLayoutProvider>
                            <RootNavigator />
                        </WeekLayoutProvider>
                    </AuthProvider>
                </ThemeProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
}