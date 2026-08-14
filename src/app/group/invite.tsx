import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import { useTheme } from "@/hooks/useTheme";
import { createInvitation, getActiveGroup } from "@/services/groupService";
import { icons } from "@/assets/icons";

export default function InviteGroupScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const group = await getActiveGroup();
        if (!group?.id) {
          router.replace("/group" as any);
          return;
        }
        const invitation = await createInvitation(group.id);
        setCode(invitation.code);
      } catch (error: any) {
        alert(error?.message ?? "Einladung konnte nicht erstellt werden.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          {icons.back({ color: theme.text.primary })}
        </Pressable>
        <Text style={styles.title}>Einladung erstellen</Text>
        <View style={{ width: 42 }} />
      </View>
      <Text style={styles.subtitle}>Teile diesen Code mit anderen Mitgliedern.</Text>

      {loading ? (
        <Text style={styles.code}>Wird erstellt...</Text>
      ) : (
        <View style={styles.card}>
          <Text style={styles.label}>Dein Einladungscode:</Text>
          <Text style={styles.code}>{code ?? "—"}</Text>
        </View>
      )}

      <Pressable style={styles.button} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Zurück</Text>
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
  card: { backgroundColor: theme.card.background, borderRadius: 24, padding: 20, gap: 8 },
  label: { color: theme.text.op },
  code: { fontSize: 28, fontWeight: "800", color: theme.text.primary },
  link: { fontSize: 14, color: theme.accent.primary, marginTop: 6 },
  button: { marginTop: 24, backgroundColor: theme.button?.primary ?? theme.accent.primary, paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
