import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import { useTheme } from "@/hooks/useTheme";
import { getActiveGroup, updateGroupMaxMeat } from "@/services/groupService";
import { icons } from "@/assets/icons";

export default function GroupSettingsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [group, setGroup] = useState<any>(null);
  const [maxMeat, setMaxMeat] = useState(3);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getActiveGroup();
      setGroup(data);
      setMaxMeat(data?.max_meat ?? 3);
    }

    load();
  }, []);

  async function handleSave() {
    if (!group?.id) {
      return;
    }

    try {
      setSaving(true);
      await updateGroupMaxMeat(group.id, maxMeat);
      router.back();
    } catch (error: any) {
      alert(error?.message ?? "Speichern fehlgeschlagen.");
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
        <Text style={styles.title}>Gruppeneinstellungen</Text>
        <View style={{ width: 42 }} />
      </View>
      <Text style={styles.subtitle}>Lege das maximale Fleischlimit pro Woche fest.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Maximale Fleischgerichte pro Woche</Text>
        <View style={styles.counterRow}>
          <Pressable style={styles.counterButton} onPress={() => setMaxMeat((value) => Math.max(0, value - 1))}>
            <Text style={styles.counterText}>-</Text>
          </Pressable>
          <Text style={styles.value}>{maxMeat}</Text>
          <Pressable style={styles.counterButton} onPress={() => setMaxMeat((value) => value + 1)}>
            <Text style={styles.counterText}>+</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "Speichert..." : "Speichern"}</Text>
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
  card: { backgroundColor: theme.card.background, borderRadius: 24, padding: 20, gap: 10 },
  label: { color: theme.text.primary, fontSize: 16, fontWeight: "600" },
  counterRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 8 },
  counterButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.button?.primary ?? theme.accent.primary, alignItems: "center", justifyContent: "center" },
  counterText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  value: { fontSize: 24, fontWeight: "700", color: theme.text.primary, minWidth: 32, textAlign: "center" },
  button: { marginTop: 24, backgroundColor: theme.button?.primary ?? theme.accent.primary, paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
