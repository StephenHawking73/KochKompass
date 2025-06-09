import { useAuth } from '@/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';

const SignIn = () => {
    const { session, signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async () => {
        signIn({email, password});
    };

    if (session) return <Redirect href={"/"}/>
    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
            <ScrollView keyboardShouldPersistTaps='handled'>
                <SafeAreaView>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={40} color="black" style={{marginTop: 20, marginLeft: 20}}/>
                    </Pressable>

                    <View style={{ alignItems: 'center', marginTop: 60}}>
                        <Image source={require("@/assets/images/Sign-In.png")} style={{width: 288, height: 254}}/>
                    </View>
                    <View style={{marginTop: 70}}>
                        <View style={{borderWidth: 1, borderColor: '#484848', borderRadius: 9, marginHorizontal: 20, height: 45}}>
                            <Image source={require("@/assets/images/email.png")} style={{width: 31, height: 31, left: 10, top: 7}}/>
                            <TextInput placeholder='E-Mail' placeholderTextColor={'#484848'} style={{left: 50, bottom: 17}} value={email} onChangeText={(text) => setEmail(text)}/>
                        </View>
                        <View style={{borderWidth: 1, borderColor: '#484848', borderRadius: 9, marginHorizontal: 20, height: 45, marginTop: 26}}>
                            <Image source={require("@/assets/images/passwort.png")} style={{width: 31, height: 31, left: 10, top: 5}}/>
                            <TextInput placeholder='Passwort' placeholderTextColor={'#484848'} secureTextEntry={true} style={{left: 50, bottom: 17}} value={password} onChangeText={(text) => setPassword(text)}/>
                        </View>
                    </View>
                    <View style={{ alignItems: 'center', marginTop: 80}}>
                        <Pressable style={{backgroundColor: "#C8EEFB", width: 290, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 52, marginTop: 24}} onPress={handleSubmit}>
                            <Text style={{fontSize: 24, color: "#000"}}>Anmelden</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </ScrollView>
        </KeyboardAvoidingView>   
    )
}
export default SignIn;