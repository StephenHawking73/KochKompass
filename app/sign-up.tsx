import Space from '@/src/components/Space';
import { useAuth } from '@/src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';

const SignIn = () => {
    const { signUp } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleSubmit = async () => {
        signUp({email, password, name});
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
            <ScrollView keyboardShouldPersistTaps='handled'>
                <SafeAreaView>
                    <Space/>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={40} color="black" style={{marginTop: 20, marginLeft: 20}}/>
                    </Pressable>

                    <View style={{ alignItems: 'center', marginTop: 60}}>
                        <Image source={require("@/assets/images/Sign-Up.jpg")} style={{width: 288, height: 254}}/>
                    </View>
                    <View style={{marginTop: 50}}>
                        {/* Name Input */}
                        <View style={{borderWidth: 1, borderColor: '#484848', borderRadius: 9, marginHorizontal: 20, height: 45, flexDirection: "row", paddingLeft: 10, alignItems: "center"}}>
                            <Image source={require("@/assets/images/name.png")} style={{width: 31, height: 31}}/>
                            <TextInput placeholder='Name' placeholderTextColor={'#484848'} style={{flex: 1, marginLeft: 10}} value={name} onChangeText={(text) => setName(text)}/>
                        </View>

                        {/* Email Input */}
                        <View style={{borderWidth: 1, borderColor: '#484848', borderRadius: 9, marginHorizontal: 20, height: 45, marginTop: 26, flexDirection: "row", paddingLeft: 10, alignItems: "center"}}>
                            <Image source={require("@/assets/images/email.png")} style={{width: 31, height: 31}}/>
                            <TextInput placeholder='E-Mail' placeholderTextColor={'#484848'} style={{flex: 1, marginLeft: 10}} value={email} onChangeText={(text) => setEmail(text)}/>
                        </View>

                        {/* Password Input */}
                        <View style={{borderWidth: 1, borderColor: '#484848', borderRadius: 9, marginHorizontal: 20, height: 45, marginTop: 26, flexDirection: "row", paddingLeft: 10, alignItems: "center"}}>
                            <Image source={require("@/assets/images/passwort.png")} style={{width: 31, height: 31}}/>
                            <TextInput placeholder='Passwort' placeholderTextColor={'#484848'} secureTextEntry={true} style={{flex: 1, marginLeft: 10}} value={password} onChangeText={(text) => setPassword(text)}/>
                        </View>
                        <Text style={{color: '#484848', fontStyle: "italic", marginLeft: 25, top: 10}}>Min. 8 Zeichen</Text>
                    </View>
                    <View style={{ alignItems: 'center', marginTop: 39}}>
                        <Pressable style={{backgroundColor: "#FFE4E9", width: 290, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 52, marginTop: 24}} onPress={handleSubmit}>
                            <Text style={{fontSize: 24, color: "#000"}}>Registrieren</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </ScrollView>
        </KeyboardAvoidingView>   
    )
}
export default SignIn;