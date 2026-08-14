import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";

import { icons } from "@/assets/icons";
import { useTheme } from "@/hooks/useTheme";
import { getActiveGroup, getGroupMembers, GroupMember, GroupSummary } from "@/services/groupService";
import { hexToRgba, renderGroupIcon } from "@/lib/groupDesign";

export default function GroupScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [group, setGroup] = useState<GroupSummary | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGroup = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getActiveGroup();
      setGroup(data);

      if (data?.id) {
        const memberData = await getGroupMembers(data.id);
        setMembers(memberData);
      } else {
        setMembers([]);
      }
    } catch (error: any) {
      alert(error?.message ?? "Gruppe konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroup();
    }, [loadGroup])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            {icons.back({ color: theme.text.primary })}
          </Pressable>
          <Text style={styles.title}>Meine Gruppe</Text>
          <View style={{ width: 42 }} />
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={theme.accent.primary} />
            <Text style={styles.mutedText}>Lädt...</Text>
          </View>
        ) : group ? (
          <>
            <GroupHero group={group} memberCount={members.length} />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Mitglieder</Text>
              <Text style={styles.sectionMeta}>{members.length}</Text>
            </View>

            <View style={styles.memberList}>
              {members.map((member) => (
                <MemberRow key={member.id} member={member} />
              ))}
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.primaryButton} onPress={() => router.push("/group/invite")}>
                {icons.userPlus({ color: "#fff", size: 18 })}
                <Text style={styles.primaryButtonText}>Mitglied einladen</Text>
              </Pressable>

              <Pressable style={styles.secondaryButton} onPress={() => router.push("/group/settings")}>
                {icons.settings({ color: theme.text.primary, size: 18 })}
                <Text style={styles.secondaryButtonText}>Gruppeneinstellungen</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              {icons.groupUsers({ color: theme.accent.primary, size: 30 })}
            </View>
            <Text style={styles.emptyTitle}>Noch keine Gruppe</Text>
            <Text style={styles.emptyText}>
              Erstelle eine neue Gruppe oder tritt per Einladung einem Haushalt bei.
            </Text>

            <View style={styles.actions}>
              <Pressable style={styles.primaryButton} onPress={() => router.push("/group/create")}>
                {icons.plus({ color: "#fff", size: 18 })}
                <Text style={styles.primaryButtonText}>Neue Gruppe erstellen</Text>
              </Pressable>

              <Pressable style={styles.secondaryButton} onPress={() => router.push("/group/join")}>
                {icons.link({ color: theme.text.primary, size: 18 })}
                <Text style={styles.secondaryButtonText}>Mit Einladung beitreten</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  function GroupHero({ group, memberCount }: { group: GroupSummary; memberCount: number }) {
    const accent = group.accent_color ?? theme.accent.primary;

    return (
      <View style={[styles.heroCard, { borderColor: hexToRgba(accent, 0.22) }]}>
        <View style={styles.heroTopRow}>
          <View style={[styles.groupIcon, { backgroundColor: hexToRgba(accent, 0.16) }]}>
            {renderGroupIcon(group.icon, { color: accent, size: 34 })}
          </View>
          <View style={styles.heroText}>
            <Text style={styles.groupName} numberOfLines={2}>{group.name}</Text>
            <Text style={styles.groupMeta}>
              {memberCount === 1 ? "1 Mitglied" : `${memberCount} Mitglieder`}
            </Text>
          </View>
        </View>

        <View style={styles.limitPill}>
          {icons.meat({ color: accent, size: 16 })}
          <Text style={[styles.limitText, { color: accent }]}>
            Max. {group.max_meat ?? 3} Fleischgerichte pro Woche
          </Text>
        </View>
      </View>
    );
  }

  function MemberRow({ member }: { member: GroupMember }) {
    const displayName = getMemberDisplayName(member);
    const avatar = member.profiles?.avatar_url?.trim();

    return (
      <View style={styles.memberRow}>
        <View style={styles.memberMeta}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{getInitial(displayName)}</Text>
            </View>
          )}
          <View style={styles.memberText}>
            <Text style={styles.memberName} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.memberRole}>{member.role === "admin" ? "Admin" : "Mitglied"}</Text>
          </View>
        </View>
      </View>
    );
  }
}

function getMemberDisplayName(member: GroupMember) {
  return member.profiles?.username
    || member.profiles?.full_name
    || "Unbekannt";
}

function getInitial(name: string) {
  return name.slice(0, 1).toUpperCase();
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
    fontSize: 28,
    fontWeight: "800",
    color: theme.text.primary,
    flex: 1,
    textAlign: "center",
    includeFontPadding: false,
    lineHeight: 34,
  },
  loadingState: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  mutedText: {
    color: theme.text.op,
    fontSize: 15,
  },
  heroCard: {
    marginTop: 24,
    padding: 20,
    borderRadius: 22,
    backgroundColor: theme.card.background,
    borderWidth: 1,
    gap: 18,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  groupIcon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  heroText: {
    flex: 1,
    minWidth: 0,
  },
  groupName: {
    fontSize: 25,
    fontWeight: "800",
    color: theme.text.primary,
    lineHeight: 31,
  },
  groupMeta: {
    color: theme.text.op,
    fontSize: 14,
    marginTop: 4,
  },
  limitPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.background,
  },
  limitText: {
    fontWeight: "800",
    fontSize: 13,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 26,
    marginBottom: 10,
  },
  sectionTitle: {
    color: theme.text.primary,
    fontSize: 18,
    fontWeight: "800",
  },
  sectionMeta: {
    color: theme.text.op,
    fontSize: 13,
    fontWeight: "700",
  },
  memberList: {
    borderRadius: 20,
    backgroundColor: theme.card.background,
    overflow: "hidden",
  },
  memberRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.tabBar.border ?? "#E5E5E5",
  },
  memberMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarImage: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.background,
  },
  avatarFallback: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.accent.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  memberText: {
    flex: 1,
    minWidth: 0,
  },
  memberName: {
    color: theme.text.primary,
    fontWeight: "700",
    fontSize: 15,
  },
  memberRole: {
    color: theme.text.op,
    fontSize: 13,
    marginTop: 2,
  },
  actions: {
    marginTop: 22,
    gap: 12,
    width: "100%",
  },
  primaryButton: {
    backgroundColor: theme.button?.primary ?? theme.accent.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.tabBar.border ?? "#E5E5E5",
    backgroundColor: theme.card.background,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  secondaryButtonText: {
    color: theme.text.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  emptyState: {
    marginTop: 26,
    padding: 22,
    borderRadius: 22,
    backgroundColor: theme.card.background,
    alignItems: "center",
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: theme.accent.op,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    color: theme.text.primary,
    fontSize: 22,
    fontWeight: "800",
  },
  emptyText: {
    color: theme.text.op,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
  },
});
