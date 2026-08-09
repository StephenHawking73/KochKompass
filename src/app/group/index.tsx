import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import { useTheme } from "@/hooks/useTheme";
import { getActiveGroup, getGroupMembers } from "@/services/groupService";
import { icons } from "@/assets/icons";

export default function GroupScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getActiveGroup();
        setGroup(data);
        if (data?.id) {
          const memberData = await getGroupMembers(data.id);
          setMembers(memberData);
        }
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            {icons.back({ color: theme.text.primary })}
          </Pressable>
          <Text style={styles.title}>Meine Gruppe</Text>
          <View style={{ width: 42 }} />
        </View>
        <Text style={styles.subtitle}>Lädt...</Text>
      </SafeAreaView>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            {icons.back({ color: theme.text.primary })}
          </Pressable>
          <Text style={styles.title}>Meine Gruppe</Text>
          <View style={{ width: 42 }} />
        </View>
        <Text style={styles.subtitle}>Du bist aktuell keiner Gruppe beigetreten.</Text>

        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={() => router.push("/group/create")}> 
            <Text style={styles.primaryButtonText}>Neue Gruppe erstellen</Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => router.push("/group/join")}> 
            <Text style={styles.secondaryButtonText}>Mit Einladung beitreten</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          {icons.back({ color: theme.text.primary })}
        </Pressable>
        <Text style={styles.title}>Meine Gruppe</Text>
        <View style={{ width: 42 }} />
      </View>
      <View style={styles.card}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.subtitle}>Mitglieder</Text>
        {members.map((member) => (
          <View key={member.id} style={styles.memberRow}>
            <View style={styles.memberMeta}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(member.profiles?.full_name || member.profiles?.username || "U").slice(0, 1).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.memberName}>{member.profiles?.username || member.profiles?.full_name || "Unbekannt"}</Text>
                <Text style={styles.memberRole}>{member.role === "admin" ? "Admin" : "Mitglied"}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => router.push("/group/invite")}> 
          <Text style={styles.primaryButtonText}>Mitglied einladen</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push("/group/settings")}> 
          <Text style={styles.secondaryButtonText}>Gruppeneinstellungen</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, padding: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 20 },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: theme.card.background },
  title: { fontSize: 30, fontWeight: "700", color: theme.text.primary, flex: 1, textAlign: "center" },
  subtitle: { fontSize: 15, color: theme.text.op, marginTop: 8 },
  card: { marginTop: 24, padding: 20, borderRadius: 24, backgroundColor: theme.card.background, gap: 8 },
  groupName: { fontSize: 24, fontWeight: "700", color: theme.text.primary },
  actions: { marginTop: 24, gap: 12 },
  primaryButton: { backgroundColor: theme.button?.primary ?? theme.accent.primary, paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryButton: { borderWidth: 1, borderColor: theme.tabBar.border ?? "#E5E5E5", paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  secondaryButtonText: { color: theme.text.primary, fontSize: 16, fontWeight: "700" },
  memberRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  memberMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.accent.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700" },
  memberName: { color: theme.text.primary, fontWeight: "600" },
  memberRole: { color: theme.text.op, fontSize: 13 },
});
