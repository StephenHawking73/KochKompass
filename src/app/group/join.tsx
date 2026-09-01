import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { useTheme } from "@/hooks/useTheme";
import { joinGroup } from "@/services/groupService";
import { useAuth } from "@/providers/AuthProvider";
import { useAppAlert } from "@/providers/AlertProvider";
import { icons } from "@/assets/icons";

export default function JoinGroupScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { refreshActiveGroup } = useAuth();
  const { showAlert } = useAppAlert();
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  async function handleJoin() {
    if (!code.trim()) {
      return;
    }

    try {
      setJoining(true);
      await joinGroup(code.trim().toUpperCase());
      await refreshActiveGroup();
      router.replace("/group" as any);
    } catch (error: any) {
      showAlert({ title: error?.message ?? "Beitritt fehlgeschlagen." });
    } finally {
      setJoining(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          {icons.back({ color: theme.text.primary })}
        </Pressable>
        <Text style={styles.title}>Einladung beitreten</Text>
        <View style={{ width: 42 }} />
      </View>
      <Text style={styles.subtitle}>Gib den Einladungscode ein.</Text>

      <TextInput
        style={styles.input}
        placeholder="ABC123"
        placeholderTextColor={theme.text.op}
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
      />

      <Pressable style={styles.button} onPress={handleJoin} disabled={joining}>
        <Text style={styles.buttonText}>{joining ? "Beitrete..." : "Gruppe beitreten"}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: theme.card.background },
  title: { fontSize: 25, fontWeight: "700", color: theme.text.primary, flex: 1, textAlign: "center", includeFontPadding: false, lineHeight: 32, flexShrink: 0 },
  subtitle: { fontSize: 15, color: theme.text.op, marginTop: 8, marginBottom: 16 },
  input: { backgroundColor: theme.card.background, color: theme.text.primary, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16 },
  button: { backgroundColor: theme.button?.primary ?? theme.accent.primary, paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
