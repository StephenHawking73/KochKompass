import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import GroupIconPicker from "@/components/group/GroupIconPicker";
import { icons } from "@/assets/icons";
import { useTheme } from "@/hooks/useTheme";
import { GroupIconName, hexToRgba, normalizeGroupIcon, renderGroupIcon } from "@/lib/groupDesign";
import { getActiveGroup, getActiveGroupContext, getGroupMembers, GroupSummary, updateGroupSettings } from "@/services/groupService";
import { useAppAlert } from "@/providers/AlertProvider";

export default function GroupSettingsScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { showAlert } = useAppAlert();
  const [group, setGroup] = useState<GroupSummary | null>(null);
  const [groupName, setGroupName] = useState("");
  const [maxMeat, setMaxMeat] = useState(3);
  const [selectedIcon, setSelectedIcon] = useState<GroupIconName>("users");
  const [selectedAccent, setSelectedAccent] = useState("#82C05C");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const context = await getActiveGroupContext();
        const data = await getActiveGroup();

        if (!data?.id) {
          router.replace("/group" as any);
          return;
        }

        const members = await getGroupMembers(data.id);
        const currentMember = members.find((member) => member.user_id === context.userId);

        if (currentMember?.role !== "admin") {
          showAlert({ title: "Keine Berechtigung", message: "Nur Admins können Gruppeneinstellungen bearbeiten." });
          router.replace("/group" as any);
          return;
        }

        setGroup(data);
        setGroupName(data.name ?? "");
        setMaxMeat(data.max_meat ?? 3);
        setSelectedIcon(normalizeGroupIcon(data.icon));
        setSelectedAccent(data.accent_color ?? theme.accent.primary);
      } catch (error: any) {
        showAlert({ title: error?.message ?? "Gruppeneinstellungen konnten nicht geladen werden." });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [theme.accent.primary]);

  async function handleSave() {
    if (!group?.id) {
      return;
    }

    if (!groupName.trim()) {
      showAlert({ title: "Bitte gib einen Gruppennamen ein." });
      return;
    }

    try {
      setSaving(true);
      await updateGroupSettings(group.id, {
        name: groupName.trim(),
        max_meat: maxMeat,
        icon: selectedIcon,
        accent_color: selectedAccent,
        design_variant: "fresh",
      });
      router.back();
    } catch (error: any) {
      showAlert({ title: error?.message ?? "Speichern fehlgeschlagen." });
    } finally {
      setSaving(false);
    }
  }

  const previewAccent = selectedAccent || theme.accent.primary;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            {icons.back({ color: theme.text.primary })}
          </Pressable>
          <Text style={styles.title}>Gruppeneinstellungen</Text>
          <View style={{ width: 42 }} />
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={theme.accent.primary} />
            <Text style={styles.mutedText}>Lädt...</Text>
          </View>
        ) : (
          <>
            <View style={[styles.previewCard, { borderColor: hexToRgba(previewAccent, 0.22) }]}>
              <View style={[styles.previewIcon, { backgroundColor: hexToRgba(previewAccent, 0.16) }]}>
                {renderGroupIcon(selectedIcon, { color: previewAccent, size: 32 })}
              </View>
              <View style={styles.previewText}>
                <Text style={styles.previewName} numberOfLines={2}>{groupName || "Neue Gruppe"}</Text>
                <Text style={styles.previewMeta}>So erscheint deine Gruppe in der Übersicht.</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Gruppenname</Text>
              <TextInput
                style={styles.input}
                placeholder="Gruppenname"
                placeholderTextColor={theme.text.op}
                value={groupName}
                onChangeText={setGroupName}
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

            <View style={styles.card}>
              <Text style={styles.label}>Maximale Fleischgerichte pro Woche</Text>
              <View style={styles.counterRow}>
                <Pressable style={styles.counterButton} onPress={() => setMaxMeat((value) => Math.max(0, value - 1))}>
                  {icons.minus({ color: "#fff", size: 18 })}
                </Pressable>
                <Text style={styles.value}>{maxMeat}</Text>
                <Pressable style={styles.counterButton} onPress={() => setMaxMeat((value) => Math.min(21, value + 1))}>
                  {icons.plus({ color: "#fff", size: 18 })}
                </Pressable>
              </View>
            </View>

            <Pressable style={[styles.button, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
              {icons.save({ color: "#fff", size: 18 })}
              <Text style={styles.buttonText}>{saving ? "Speichert..." : "Speichern"}</Text>
            </Pressable>
          </>
        )}
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
    fontSize: 23,
    fontWeight: "800",
    color: theme.text.primary,
    flex: 1,
    textAlign: "center",
    includeFontPadding: false,
    lineHeight: 30,
  },
  loadingState: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  mutedText: {
    color: theme.text.op,
  },
  previewCard: {
    marginTop: 24,
    marginBottom: 14,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: theme.card.background,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  previewText: {
    flex: 1,
    minWidth: 0,
  },
  previewName: {
    color: theme.text.primary,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 28,
  },
  previewMeta: {
    color: theme.text.op,
    marginTop: 4,
    fontSize: 13,
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
    fontWeight: "800",
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
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginTop: 2,
  },
  counterButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.button?.primary ?? theme.accent.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontSize: 28,
    fontWeight: "800",
    color: theme.text.primary,
    minWidth: 42,
    textAlign: "center",
  },
  button: {
    marginTop: 8,
    backgroundColor: theme.button?.primary ?? theme.accent.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
