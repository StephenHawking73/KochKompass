import Space from "@/src/components/Space";
import { useAuth } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, SafeAreaView, Text } from "react-native";

export default function Profile() {
    const { signOut, user } = useAuth();

    return(
        <SafeAreaView>
            <Space/>
            <Text style={{fontSize: 24, fontWeight: 'bold', marginLeft: 30, marginTop: 20}}>{user.name}</Text>
            <Pressable onPress={signOut} style={{backgroundColor: "#FF5D96", padding: 10, borderRadius: 10, marginTop: 20, flexDirection: "row", alignItems: "center", marginHorizontal: 20,}}>
                <Ionicons name="log-out-outline" size={24}/>
                <Text style={{marginLeft: 10}}>Log Out!</Text>
            </Pressable>
        </SafeAreaView>
    )
}