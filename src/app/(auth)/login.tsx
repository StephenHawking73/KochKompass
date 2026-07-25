import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native'
import React, { useState } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '@/assets/icons';

export default function login() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    const {data, error: err} = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    console.log("ERR:", err)
    console.log("SESSION:", data.session)
    console.log(email, password);

    if (err){
      setError(err.message);
      return;
    }

    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.back} onPress={() => router.back()}>
        {icons.back({color: theme.text.primary, size: 25})}
      </Pressable>
      
      <View style={styles.content}>
        <Text style={styles.title}>
          Anmelden
        </Text>

        <Text style={styles.subtitle}>
          Schön, dass du zurück bist!
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            {icons.mail({size: 18, color: theme.text.op})}
            <TextInput
              placeholder='E-Mail'
              placeholderTextColor={theme.text.op}
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize='none'
              keyboardType='email-address'
            />
          </View>
          

          <View style={styles.inputContainer}>
            {icons.password({ size: 18, color: theme.text.op })}
            <TextInput
              placeholder="Passwort"
              placeholderTextColor={theme.text.op}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />

            <Pressable onPress={() => setShowPassword(!showPassword)}>
              {showPassword
                ? icons.eyeOff({ size: 20, color: theme.text.op })
                : icons.eye({ size: 20, color: theme.text.op })}
            </Pressable>
          </View>

          <Pressable style={styles.forgot} onPress={() => {}}>
            <Text style={styles.forgotText}>
              Passwort vergessen?
            </Text>
          </Pressable>
        </View>

        {
          !!error &&
          <Text style={styles.error}>
            {error}
          </Text>
        }

        <Pressable style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>
            Anmelden
          </Text>
        </Pressable>

        <View style={styles.separator}>
          <View style={styles.line} />
          <Text style={styles.separatorText}>
            oder weiter mit
          </Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socials}>
          <Pressable style={styles.socialButton}>
            {icons.google({ size: 20 })}
            <Text style={styles.socialText}>Google</Text>
          </Pressable>

          <Pressable style={styles.socialButton}>
            {icons.apple({ size: 20 })}
            <Text style={styles.socialText}>Apple</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Noch kein Konto?
          </Text>

          <Pressable onPress={() => router.push("/register")}>
            <Text style={styles.register}>
              Registrieren
            </Text>
          </Pressable>
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

  back: {
    paddingHorizontal: 28,
    paddingTop: 25,
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
  },

  title: {
    marginTop: 40,
    fontSize: 28,
    fontWeight: "700",
    color: theme.text.primary,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 17,
    fontWeight: "500",
    color: theme.text.op,
  },

  form: {
    marginTop: 40,
    gap: 18,
  },

  inputContainer: {
    height: 58,
    borderWidth: 1,
    borderColor: theme.searchBar.border,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },

  forgot: {
    alignItems: "flex-end",
    marginTop: -6,
  },

  forgotText: {
    color: theme.accent.primary,
    fontWeight: "600",
    fontSize: 15,
  },

  button: {
    marginTop: 30,
    height: 56,

    borderRadius: 14,
    backgroundColor: theme.accent.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },

  line: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: theme.ratingContainer.background,
    backgroundColor: theme.ratingContainer.background,
  },

  separatorText: {
    marginHorizontal: 12,
    color: theme.text.op,
    fontSize: 14,

  },

  socials: {
    flexDirection: "row",
    gap: 14,
    marginTop: 24,
  },

  socialButton: {
    flex: 1,
    height: 56,

    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.searchBar.border,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  socialText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },

  footerText: {
    color: theme.text.op,
    fontSize: 15,
  },

  register: {
    marginLeft: 5,
    color: "#55B233",
    fontWeight: "700",
    fontSize: 15,
  },

  error: {
    color: theme.notification,
    marginTop: 12,
    fontSize: 14,
  },
})