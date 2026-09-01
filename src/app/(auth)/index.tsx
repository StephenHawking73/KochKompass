import { useTheme } from "@/hooks/useTheme";
import { StyleSheet, View, Text, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "@/assets/images";
import { router } from "expo-router";

export default function LandingPage(){
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.container}> 
            <View style={styles.content}>
                <View style={styles.header}>
                    <Image 
                        source={images.appIcon} 
                        style={styles.appIcon}
                    />

                    <Text style={styles.headerText}>
                        Koch
                        <Text style={{color: theme.accent.primary}}>
                            Kompass
                        </Text>
                    </Text>

                    <Image source={images.landing} style={styles.picture} resizeMode="cover"/>

                    <Text style={styles.subtitle}>
                        Der smarte Speiseplan für Familien.
                        {"\n"}
                        Gemeinsam planen, kochen und genießen.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <Pressable
                            style={styles.primaryButton}
                            onPress={() => router.push("/login")}
                        >    
                            <Text style={styles.primaryButtonText}>
                                Anmelden
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.secondaryButton}
                            onPress={() => router.push("/register")}
                        >
                            <Text style={styles.secondaryButtonText}>
                                Registrieren
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    )
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.card.background, 
    },

    content: {
        paddingTop: 30,
        paddingBottom: 40,
        paddingHorizontal: 10,
    },

    header: {
        alignItems: "center",
    },

    appIcon: {
        width: 82,
        height: 82,
    },

    headerText: {
        marginTop: 12,
        fontSize: 34,
        fontWeight: "700",
        color: theme.text.primary,
        letterSpacing: 0.5,
    },

    picture: {
        width: "100%",
        height: 240,
        marginTop: 25,
        borderRadius: 20,
    },

    subtitle: {
        marginTop: 20,
        fontSize: 17,
        lineHeight: 26,
        textAlign: "center",
        color: theme.text.op,
    },

    buttonContainer: {
        width: "100%",
        marginTop: 46,
        gap: 14,

        paddingHorizontal: 20
    },

    primaryButton: {
        height: 58,
        borderRadius: 16,
        backgroundColor: theme.accent.primary,
        justifyContent: "center",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        elevation: 4,
    },

    primaryButtonText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "600",
    },

    secondaryButton: {
        height: 58,
        borderRadius: 16,
        backgroundColor: theme.card.background,
        borderWidth: 2,
        borderColor: theme.button.border,

        justifyContent: "center",
        alignItems: "center",
    },

    secondaryButtonText: {
        color: theme.text.primary,
        fontSize: 20,
        fontWeight: "600",
    },
})