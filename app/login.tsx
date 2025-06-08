import { useAuth } from '@/src/context/AuthContext';
import { Redirect, router } from 'expo-router';
import React from 'react';
import { Image, Pressable, SafeAreaView, Text, View } from 'react-native';

const Login = () => {
    const {session} = useAuth();

    if (session) {
       return <Redirect href='/'/>
    }

    return (
        <SafeAreaView>
            <View style={{ alignItems: 'center', marginTop: 120}}>
                <Image source={require("@/assets/images/Splash-Screen.jpg")} style={{width: 288, height: 254}}/>
                <Text style={{marginTop: 70, fontSize: 24, fontWeight: "regular"}}>Willkommen bei</Text>
                <Text style={{marginTop: 4, fontSize: 40, fontWeight: "bold"}}>Koch Kompass</Text>
            </View>
            <View style={{ alignItems: 'center', marginTop: 50}}>
                <Pressable style={{backgroundColor: '#1DC0AB', width: 290, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 52}} onPress={() => {router.push("/sign-in")}}>
                    <Text style={{fontSize: 24, color: "#fff"}}>Anmelden</Text>
                </Pressable>
                <Pressable style={{borderColor: '#1DC0AB', borderWidth: 2.5, width: 290, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 52, marginTop: 24}} onPress={() => {router.push("/sign-up")}}>
                    <Text style={{fontSize: 24, color: "#000"}}>Registrieren</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    )
}

export default Login;