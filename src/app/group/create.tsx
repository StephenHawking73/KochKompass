import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import GroupIconPicker from "@/components/group/GroupIconPicker";
import { icons } from "@/assets/icons";
import { useTheme } from "@/hooks/useTheme";
import { GroupIconName } from "@/lib/groupDesign";
import { useAuth } from "@/providers/AuthProvider";
import { createGroup } from "@/services/groupService";

export default function CreateGroupScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { refreshActiveGroup } = useAuth();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<GroupIconName>("users");
  const [selectedAccent, setSelectedAccent] = useState("#82C05C");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      alert("Bitte gib einen Gruppennamen ein.");
      return;
    }

    try {
      setSaving(true);
      await createGroup(name.trim(), {
        icon: selectedIcon,
        accent_color: selectedAccent,
      });
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
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            {icons.back({ color: theme.text.primary })}
          </Pressable>
          <Text style={styles.title}>Neue Gruppe</Text>
          <View style={{ width: 42 }} />
        </View>

        <Text style={styles.subtitle}>
          Gib deiner Familie oder deinem Haushalt einen Namen und einen eigenen Look.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Gruppenname</Text>
          <TextInput
            style={styles.input}
            placeholder="Familie Müller"
            placeholderTextColor={theme.text.op}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Gruppen-Icon</Text>
          <GroupIconPicker
            selectedIcon={selectedIcon}
            onSelectIcon={setSelectedIcon}
            selectedAccent={selectedAccent}
            onSelectAccent={setSelectedAccent}
          />
        </View>

        <Pressable style={[styles.button, saving && styles.buttonDisabled]} onPress={handleCreate} disabled={saving}>
          {icons.plus({ color: "#fff", size: 18 })}
          <Text style={styles.buttonText}>{saving ? "Erstelle..." : "Gruppe erstellen"}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    padding: 24,
    paddingBottom: 36,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.card.background,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    color: theme.text.primary,
    flex: 1,
    textAlign: "center",
    includeFontPadding: false,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: theme.text.op,
    marginTop: 20,
    marginBottom: 16,
    lineHeight: 22,
  },
  card: {
    backgroundColor: theme.card.background,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    gap: 12,
  },
  label: {
    color: theme.text.primary,
    fontSize: 15,
    fontWeight: "700",
  },
  input: {
    backgroundColor: theme.background,
    color: theme.text.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.tabBar.border ?? "#E5E5E5",
  },
  button: {
    backgroundColor: theme.button?.primary ?? theme.accent.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
