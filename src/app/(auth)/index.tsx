import { useTheme } from "@/hooks/useTheme";
import { StyleSheet, View, Text, Image, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "@/assets/images";
import { supabase } from "@/lib/supabase";

async function login() {
    const { data, error } =
        await supabase.auth.signInWithPassword({
            email: "dev@dev.com",
            password: "KochKompass",
        });
    
        console.log("Session:", data.session);
        console.log("Error:", error);
    }

export default function LandingPage(){
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.container}> 
            <View style={styles.header}>
                <Image source={images.appIcon} style={styles.appIcon}/>
                <Text style={styles.headerText}>Koch<Text style={{color: theme.accent.primary}}>Kompass</Text></Text>
                <Image source={images.landing} style={styles.picture}/>

                <Pressable onPress={login}>
                    <Text style={{marginTop: 100}}>DEV LOGIN</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
    },

    header: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 30,
    },

    appIcon: {
        width: 100,
        height: 100,
    },

    picture: {
        marginTop: 30,
        borderRadius: 40,

        width: 100,
        height: 200,
    },

    headerText: {
        fontWeight: "700",
        fontSize: 35,
        color: theme.text.primary,
        letterSpacing: 1,
        
        marginTop: 20,
    },
})