import { View, Text, StyleSheet, TextInput, Pressable, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/assets/icons";

export default function Register() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [error, setError] = useState("");

  async function handleRegister() {
    setError("");

    if (!email || !password || !repeatPassword) {
      setError("Bitte fülle alle Felder aus!");
      return;
    }

    if (password !== repeatPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    if (!firstName.trim()) {
      setError("Bitte gib deinen Vornamen ein!")
    }

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }
      }
    });

    if (err) {
      setError(err.message);
      return;
    }

    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            {icons.back({ color: theme.text.primary, size: 25 })}
          </Pressable>

          <View style={styles.content}>
            <Text style={styles.title}>Registrieren</Text>

            <Text style={styles.subtitle}>
              Schön dich kennenzulernen!
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                {icons.person({ size: 18, color: theme.text.op })}

                <TextInput
                  placeholder="Vorname"
                  placeholderTextColor={theme.text.op}
                  value={firstName}
                  onChangeText={setFirstName}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                {icons.person({ size: 18, color: theme.text.op })}

                <TextInput
                  placeholder="Nachname (optional)"
                  placeholderTextColor={theme.text.op}
                  value={lastName}
                  onChangeText={setLastName}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                {icons.mail({ size: 18, color: theme.text.op })}
                <TextInput
                  placeholder="E-Mail"
                  placeholderTextColor={theme.text.op}
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  autoCapitalize="none"
                  keyboardType="email-address"
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

              <View style={styles.inputContainer}>
                {icons.password({ size: 18, color: theme.text.op })}

                <TextInput
                  placeholder="Passwort wiederholen"
                  placeholderTextColor={theme.text.op}
                  secureTextEntry={!showRepeatPassword}
                  value={repeatPassword}
                  onChangeText={setRepeatPassword}
                  style={styles.input}
                />

                <Pressable
                  onPress={() =>
                    setShowRepeatPassword(!showRepeatPassword)
                  }
                >
                  {showRepeatPassword
                    ? icons.eyeOff({ size: 20, color: theme.text.op })
                    : icons.eye({ size: 20, color: theme.text.op })}
                </Pressable>
              </View>
            </View>

            {!!error && <Text style={styles.error}>{error}</Text>}

            <Pressable style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Registrieren</Text>
            </Pressable>

            <View style={styles.separator}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>oder weiter mit</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socials}>
              <Pressable style={styles.socialButton}>
                {icons.google({ size: 20 })}
                <Text style={styles.socialText}>Google</Text>
              </Pressable>

              <Pressable style={styles.socialButton}>
                {icons.apple({ size: 20, color: theme.text.primary })}
                <Text style={styles.socialText}>Apple</Text>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Bereits ein Konto?</Text>

              <Pressable onPress={() => router.replace("/login")}>
                <Text style={styles.register}>Anmelden</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
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
      color: theme.text.primary,
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
      color: theme.text.primary,
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
      color: theme.text.colored,
      fontWeight: "700",
      fontSize: 15,
    },

    error: {
      color: theme.notification,
      marginTop: 12,
      fontSize: 14,
    },
  });