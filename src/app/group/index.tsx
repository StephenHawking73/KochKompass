import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";

import { icons } from "@/assets/icons";
import { useTheme } from "@/hooks/useTheme";
import {
  deleteGroup,
  getActiveGroup,
  getActiveGroupContext,
  getGroupMembers,
  GroupMember,
  GroupSummary,
  leaveGroup,
  promoteGroupMember,
  removeGroupMember,
} from "@/services/groupService";
import { hexToRgba, renderGroupIcon } from "@/lib/groupDesign";

export default function GroupScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const [group, setGroup] = useState<GroupSummary | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberActionId, setMemberActionId] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadGroup = useCallback(async () => {
    try {
      setLoading(true);
      const context = await getActiveGroupContext();
      setCurrentUserId(context.userId);
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

  const currentMember = members.find((member) => member.user_id === currentUserId);
  const isAdmin = currentMember?.role === "admin";
  const adminCount = members.filter((member) => member.role === "admin").length;
  const isBusy = Boolean(memberActionId) || leaving || deleting;

  function refreshAfterLeavingGroup() {
    setGroup(null);
    setMembers([]);
    router.replace("/group" as any);
  }

  function handlePromoteMember(member: GroupMember) {
    const displayName = getMemberDisplayName(member);

    Alert.alert(
      "Admin ernennen",
      `${displayName} zum Admin dieser Gruppe machen?`,
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Ernennen",
          onPress: async () => {
            if (!group?.id) {
              return;
            }

            try {
              setMemberActionId(member.user_id);
              await promoteGroupMember(group.id, member.user_id);
              await loadGroup();
            } catch (error: any) {
              alert(error?.message ?? "Mitglied konnte nicht zum Admin ernannt werden.");
            } finally {
              setMemberActionId(null);
            }
          },
        },
      ]
    );
  }

  function handleRemoveMember(member: GroupMember) {
    const displayName = getMemberDisplayName(member);

    Alert.alert(
      "Mitglied entfernen",
      `${displayName} aus der Gruppe entfernen?`,
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Entfernen",
          style: "destructive",
          onPress: async () => {
            if (!group?.id) {
              return;
            }

            try {
              setMemberActionId(member.user_id);
              await removeGroupMember(group.id, member.user_id);
              await loadGroup();
            } catch (error: any) {
              alert(error?.message ?? "Mitglied konnte nicht entfernt werden.");
            } finally {
              setMemberActionId(null);
            }
          },
        },
      ]
    );
  }

  function handleLeaveGroup() {
    const willDeleteGroup = members.length <= 1;
    const willTransferAdmin = currentMember?.role === "admin" && adminCount <= 1 && members.length > 1;
    const message = willDeleteGroup
      ? "Du bist das letzte Mitglied. Wenn du gehst, wird die Gruppe gelöscht und Gruppenrezepte werden privat ihren Erstellern zugeordnet."
      : willTransferAdmin
        ? "Wenn du gehst, wird das nächste Mitglied automatisch Admin."
        : "Du verlässt diese Gruppe und verlierst den Zugriff auf die Gruppenrezepte.";

    Alert.alert(
      "Gruppe verlassen",
      message,
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Verlassen",
          style: "destructive",
          onPress: async () => {
            if (!group?.id) {
              return;
            }

            try {
              setLeaving(true);
              await leaveGroup(group.id);
              refreshAfterLeavingGroup();
            } catch (error: any) {
              alert(error?.message ?? "Gruppe konnte nicht verlassen werden.");
            } finally {
              setLeaving(false);
            }
          },
        },
      ]
    );
  }

  function handleDeleteGroup() {
    Alert.alert(
      "Gruppe löschen",
      "Alle Mitglieder werden entfernt. Gruppenrezepte werden privat ihren Erstellern zugeordnet; Essenspläne und Einladungen werden gelöscht.",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            if (!group?.id) {
              return;
            }

            try {
              setDeleting(true);
              await deleteGroup(group.id);
              refreshAfterLeavingGroup();
            } catch (error: any) {
              alert(error?.message ?? "Gruppe konnte nicht gelöscht werden.");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  }

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

              <Pressable
                style={[styles.secondaryButton, isBusy && styles.buttonDisabled]}
                onPress={handleLeaveGroup}
                disabled={isBusy}
              >
                {icons.exit({ color: theme.text.primary, size: 18 })}
                <Text style={styles.secondaryButtonText}>
                  {leaving ? "Verlässt..." : "Gruppe verlassen"}
                </Text>
              </Pressable>

              {isAdmin ? (
                <Pressable
                  style={[styles.dangerButton, isBusy && styles.buttonDisabled]}
                  onPress={handleDeleteGroup}
                  disabled={isBusy}
                >
                  {icons.delete({ color: "#fff", size: 18 })}
                  <Text style={styles.dangerButtonText}>
                    {deleting ? "Löscht..." : "Gruppe löschen"}
                  </Text>
                </Pressable>
              ) : null}
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
    const isCurrentUser = member.user_id === currentUserId;
    const canManageMember = Boolean(isAdmin && !isCurrentUser);
    const memberBusy = memberActionId === member.user_id;

    return (
      <View style={styles.memberRow}>
        <View style={styles.memberRowContent}>
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

          {isCurrentUser ? (
            <View style={styles.youPill}>
              <Text style={styles.youPillText}>Du</Text>
            </View>
          ) : null}

          {canManageMember ? (
            <View style={styles.memberActions}>
              {member.role !== "admin" ? (
                <Pressable
                  style={[styles.promoteButton, memberBusy && styles.buttonDisabled]}
                  onPress={() => handlePromoteMember(member)}
                  disabled={isBusy}
                >
                  <Text style={styles.promoteButtonText}>Admin</Text>
                </Pressable>
              ) : null}

              <Pressable
                style={[styles.memberIconButton, memberBusy && styles.buttonDisabled]}
                onPress={() => handleRemoveMember(member)}
                disabled={isBusy}
              >
                {icons.delete({ color: "#D94A4A", size: 17 })}
              </Pressable>
            </View>
          ) : null}
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
  memberRowContent: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  memberMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
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
  youPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: theme.background,
  },
  youPillText: {
    color: theme.text.op,
    fontSize: 12,
    fontWeight: "800",
  },
  memberActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  promoteButton: {
    minHeight: 34,
    paddingHorizontal: 12,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.button?.primary ?? theme.accent.primary,
  },
  promoteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  memberIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.background,
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
  dangerButton: {
    backgroundColor: "#D94A4A",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  dangerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.65,
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
