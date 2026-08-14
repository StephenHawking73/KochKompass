import { View, Text, StyleSheet, TextInput, Pressable, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/assets/icons";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import DevelopmentNotice from "@/components/DevelopmentNotice";
import { getDevelopmentMessage } from "@/assets/messages";
import { LoadingScreen } from "@/components/loadingScreen";

WebBrowser.maybeCompleteAuthSession();

export default function Register() {
  const message = getDevelopmentMessage("auth");

  const theme = useTheme();
  const styles = createStyles(theme);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  const [showDev, setShowDev] = useState(false);

  async function handleRegister() {
    if (isLoading) return;

    setError("");
    setIsLoading(true);

    if (!email || !password || !repeatPassword) {
      setError("Bitte fülle alle Felder aus!");
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      setIsLoading(false);
      return;
    }

    if (!firstName.trim()) {
      setError("Bitte gib deinen Vornamen ein!");
      setIsLoading(false);
      return;
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
      setIsLoading(false);
      return;
    }

    router.replace("/(tabs)");
  }

  async function handleGoogleRegister() {
    if (isLoading) return;

    setError("");
    setIsLoading(true);

    const redirectTo = AuthSession.makeRedirectUri();

    const { data, error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });


    if (err) {
      setError("Google Anmeldung fehlgeschlagen.");
      setIsLoading(false);
      return;
    }


    const result = await WebBrowser.openAuthSessionAsync(
      data.url,
      redirectTo
    );


    if (result.type === "success") {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.exchangeCodeForSession(
          result.url
        );


      if (sessionError) {
        setError(sessionError.message);
        setIsLoading(false);
        return;
      }


      const user = sessionData.user;


      // Profil erstellen
      await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          username:
            user.user_metadata.full_name?.split(" ")[0] ?? "",
          full_name:
            user.user_metadata.full_name ?? "",
          email: user.email,
        });


      router.replace("/(tabs)");
    }

    setIsLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable style={styles.back} onPress={() => router.back()} disabled={isLoading}>
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
                  editable={!isLoading}
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
                  editable={!isLoading}
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
                  editable={!isLoading}
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
                  editable={!isLoading}
                />

                <Pressable onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
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
                  editable={!isLoading}
                />

                <Pressable
                  onPress={() =>
                    setShowRepeatPassword(!showRepeatPassword)
                  }
                  disabled={isLoading}
                >
                  {showRepeatPassword
                    ? icons.eyeOff({ size: 20, color: theme.text.op })
                    : icons.eye({ size: 20, color: theme.text.op })}
                </Pressable>
              </View>
            </View>

            {!!error && (
              <View style={styles.errorContainer}>
                {icons.warning?.({
                  size: 18,
                  color: theme.notification,
                })}
                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}

            <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleRegister} disabled={isLoading}>
              <Text style={styles.buttonText}>{isLoading ? "Wird registriert..." : "Registrieren"}</Text>
            </Pressable>

            <View style={styles.separator}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>oder weiter mit</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socials}>
              <Pressable style={styles.socialButton} onPress={() => setShowDev(true)} disabled={isLoading}>
                {icons.google({ size: 20 })}
                <Text style={styles.socialText}>Google</Text>
              </Pressable>

              <Pressable style={styles.socialButton} onPress={() => setShowDev(true)} disabled={isLoading}>
                {icons.apple({ size: 20, color: theme.text.primary })}
                <Text style={styles.socialText}>Apple</Text>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Bereits ein Konto?</Text>

              <Pressable onPress={() => router.replace("/login")} disabled={isLoading}>
                <Text style={styles.register}>Anmelden</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <DevelopmentNotice
        visible = {showDev}
        title = {message.title}
        message= {message.message}
        onClose={() => setShowDev(false)}
      />

      <LoadingScreen text="Registrierung läuft" visible={isLoading} overlay />
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

    buttonDisabled: {
      opacity: 0.7,
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

    errorContainer: {
      marginTop: 20,
      padding: 14,
      borderRadius: 12,
      backgroundColor: `${theme.notification}15`, // leicht transparent
      borderWidth: 1,
      borderColor: theme.notification,
      flexDirection: "row",
      alignItems: "center",
    },

    errorText: {
      flex: 1,
      marginLeft: 10,
      color: theme.notification,
      fontSize: 14,
      fontWeight: "500",
    },

    inputError: {
      borderColor: theme.notification,
    }
  });
