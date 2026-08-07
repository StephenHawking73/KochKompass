import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons } from "@/assets/icons";
import { LoadingScreen } from "@/components/loadingScreen";

export default function ResetPassword() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mode, setMode] = useState<"request" | "reset">("request");
  const [tokenParams, setTokenParams] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function handleInitialUrl() {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        parseDeepLink(initialUrl);
      }
    }

    handleInitialUrl();

    const subscription = Linking.addEventListener("url", ({ url }) => {
      if (url) {
        parseDeepLink(url);
      }
    });

    return () => subscription.remove();
  }, []);

  function parseDeepLink(url: string) {
    setError("");
    setMessage("");
    setSuccessMessage("");

    const [base, fragment] = url.split("#");
    const params = new URLSearchParams(fragment || "");
    const parsed: Record<string, string> = {};

    for (const [key, value] of params.entries()) {
      parsed[key] = value;
    }

    if (parsed.type === "recovery" || parsed.access_token) {
      setTokenParams(parsed);
      setMode("reset");
      return;
    }

    setMode("request");
  }

  async function handleResetPassword() {
    if (isLoading) return;

    setError("");
    setMessage("");
    setSuccessMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Bitte gib deine E-Mail-Adresse ein.");
      return;
    }

    setIsLoading(true);

    const redirectTo = "kochkompass://reset-password";
    const { error: err } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo,
    });

    if (err) {
      setError(err.message);
      setIsLoading(false);
      return;
    }

    setMessage(
      "Wenn ein Konto mit dieser E-Mail existiert, wurde eine Anleitung zum Zurücksetzen verschickt."
    );
    setIsLoading(false);
  }

  async function handleSetNewPassword() {
    if (isLoading) return;

    setError("");
    setMessage("");
    setSuccessMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Bitte gib ein neues Passwort ein und bestätige es.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Die Passwörter stimmen nicht überein.");
      return;
    }

    setIsLoading(true);

    if (tokenParams.access_token && tokenParams.refresh_token) {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokenParams.access_token,
        refresh_token: tokenParams.refresh_token,
      });

      if (sessionError) {
        setError(sessionError.message);
        setIsLoading(false);
        return;
      }
    }

    const { error: err } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (err) {
      setError(err.message);
      setIsLoading(false);
      return;
    }

    setSuccessMessage("Dein Passwort wurde erfolgreich geändert. Bitte melde dich neu an.");
    setNewPassword("");
    setConfirmPassword("");
    setMode("request");
    setIsLoading(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable style={styles.back} onPress={() => router.back()} disabled={isLoading}>
            {icons.back({ color: theme.text.primary, size: 25 })}
          </Pressable>

          <View style={styles.content}>
            <Text style={styles.title}>Passwort zurücksetzen</Text>

            {mode === "request" ? (
              <>
                <Text style={styles.subtitle}>
                  Gib deine E-Mail-Adresse ein, damit wir dir einen Link zum Zurücksetzen
                  deines Passworts senden können.
                </Text>

                <View style={styles.form}>
                  <View style={[styles.inputContainer, error && styles.inputError]}>
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
                </View>

                {!!message && (
                  <View style={styles.successContainer}>
                    {icons.check?.({
                      size: 18,
                      color: theme.accent.primary,
                    })}
                    <Text style={styles.successText}>{message}</Text>
                  </View>
                )}

                <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleResetPassword} disabled={isLoading}>
                  <Text style={styles.buttonText}>
                    {isLoading ? "Sende E-Mail..." : "E-Mail senden"}
                  </Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.subtitle}>
                  Gib dein neues Passwort ein, um dein Konto wieder zu nutzen.
                </Text>

                <View style={styles.form}>
                  <View style={[styles.inputContainer, error && styles.inputError]}>
                    {icons.password({ size: 18, color: theme.text.op })}
                    <TextInput
                      placeholder="Neues Passwort"
                      placeholderTextColor={theme.text.op}
                      secureTextEntry={!showPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      style={styles.input}
                      editable={!isLoading}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                      {showPassword
                        ? icons.eyeOff({ size: 20, color: theme.text.op })
                        : icons.eye({ size: 20, color: theme.text.op })}
                    </Pressable>
                  </View>

                  <View style={[styles.inputContainer, error && styles.inputError]}>
                    {icons.password({ size: 18, color: theme.text.op })}
                    <TextInput
                      placeholder="Passwort wiederholen"
                      placeholderTextColor={theme.text.op}
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      style={styles.input}
                      editable={!isLoading}
                    />
                    <Pressable onPress={() => setShowConfirmPassword(!showConfirmPassword)} disabled={isLoading}>
                      {showConfirmPassword
                        ? icons.eyeOff({ size: 20, color: theme.text.op })
                        : icons.eye({ size: 20, color: theme.text.op })}
                    </Pressable>
                  </View>
                </View>

                {!!successMessage && (
                  <View style={styles.successContainer}>
                    {icons.check?.({
                      size: 18,
                      color: theme.accent.primary,
                    })}
                    <Text style={styles.successText}>{successMessage}</Text>
                  </View>
                )}

                <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleSetNewPassword} disabled={isLoading}>
                  <Text style={styles.buttonText}>
                    {isLoading ? "Speichere Passwort..." : "Passwort speichern"}
                  </Text>
                </Pressable>
              </>
            )}

            {!!error && (
              <View style={styles.errorContainer}>
                {icons.warning?.({
                  size: 18,
                  color: theme.notification,
                })}
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Bereits ein Konto?</Text>
            <Pressable onPress={() => router.replace("/login")} disabled={isLoading}>
              <Text style={styles.linkText}>Zur Anmeldung</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingScreen text={mode === "reset" ? "Passwort wird zurückgesetzt" : "E-Mail wird gesendet"} visible={isLoading} overlay />
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
      marginTop: 10,
      fontSize: 16,
      lineHeight: 24,
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

    footer: {
      marginTop: 32,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
    },

    footerText: {
      color: theme.text.op,
      fontSize: 15,
    },

    linkText: {
      color: theme.accent.primary,
      fontWeight: "700",
      fontSize: 15,
    },

    errorContainer: {
      marginTop: 20,
      padding: 14,
      borderRadius: 12,
      backgroundColor: `${theme.notification}15`,
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

    successContainer: {
      marginTop: 20,
      padding: 14,
      borderRadius: 12,
      backgroundColor: `${theme.accent.primary}15`,
      borderWidth: 1,
      borderColor: theme.accent.primary,
      flexDirection: "row",
      alignItems: "center",
    },

    successText: {
      flex: 1,
      marginLeft: 10,
      color: theme.text.primary,
      fontSize: 14,
      fontWeight: "500",
    },

    inputError: {
      borderColor: theme.notification,
    },
  });
