import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { useTheme } from "@/hooks/useTheme";
import { createGroup } from "@/services/groupService";
import { useAuth } from "@/providers/AuthProvider";
import { icons } from "@/assets/icons";

export default function CreateGroupScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { refreshActiveGroup } = useAuth();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      return;
    }

    try {
      setSaving(true);
      await createGroup(name.trim());
      await refreshActiveGroup();
      router.replace("/group" as any);
    } catch (error: any) {
      alert(error?.message ?? "Gruppe konnte nicht erstellt werden.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          {icons.back({ color: theme.text.primary })}
        </Pressable>
        <Text style={styles.title}>Neue Gruppe</Text>
        <View style={{ width: 42 }} />
      </View>
      <Text style={styles.subtitle}>Gib deiner Familie oder deinem Haushalt einen Namen.</Text>

      <TextInput
        style={styles.input}
        placeholder="Familie Müller"
        placeholderTextColor={theme.text.op}
        value={name}
        onChangeText={setName}
      />

      <Pressable style={styles.button} onPress={handleCreate} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "Erstelle..." : "Gruppe erstellen"}</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: theme.card.background },
  title: { fontSize: 30, fontWeight: "700", color: theme.text.primary, flex: 1, textAlign: "center", includeFontPadding: false, lineHeight: 32, flexShrink: 0 },
  subtitle: { fontSize: 15, color: theme.text.op, marginTop: 8, marginBottom: 16 },
  input: { backgroundColor: theme.card.background, color: theme.text.primary, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16 },
  button: { backgroundColor: theme.button?.primary ?? theme.accent.primary, paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
