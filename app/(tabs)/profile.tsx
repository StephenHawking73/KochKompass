import { useAuth } from "@/src/context/AuthContext";
import { Pressable, SafeAreaView, Text } from "react-native";

export default function Profile() {
    const { signOut, user } = useAuth();

    return(
        <SafeAreaView>
            <Text>Profil</Text>
            <Pressable onPress={signOut} style={{backgroundColor: "#C8EEFB", padding: 10, borderRadius: 5, marginTop: 20}}>
                <Text>Log Out!</Text>
            </Pressable>
        </SafeAreaView>
    )
}