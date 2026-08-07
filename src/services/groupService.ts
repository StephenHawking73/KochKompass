import { supabase } from "@/lib/supabase";

export type GroupMemberRole = "admin" | "member";

export type ActiveGroupContext = {
    userId: string;
    activeGroupId: string | null;
};

export type GroupSummary = {
    id: string;
    name: string;
    max_meat: number | null;
    image_url?: string | null;
    created_by?: string | null;
};

export type GroupMember = {
    id: string;
    role: GroupMemberRole;
    user_id: string;
    profiles?: {
        id: string;
        username?: string | null;
        full_name?: string | null;
        avatar_url?: string | null;
    } | null;
};

export async function getActiveGroupContext(): Promise<ActiveGroupContext> {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw userError ?? new Error("Nicht authentifiziert.");
    }

    const { data, error } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return {
        userId: user.id,
        activeGroupId: data?.group_id ?? null,
    };
}

export async function getActiveGroup(): Promise<GroupSummary | null> {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return null;
    }

    const { data, error } = await supabase
        .from("group_members")
        .select("group_id, role, groups(id, name, max_meat, image_url, created_by)")
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (!data?.groups) {
        return null;
    }

    const groups = Array.isArray(data?.groups) ? data.groups[0] : data?.groups;

    if (!groups) {
        return null;
    }

    return {
        id: groups.id,
        name: groups.name,
        max_meat: groups.max_meat,
        image_url: groups.image_url,
        created_by: groups.created_by,
    };
}

export async function createGroup(name: string) {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw userError ?? new Error("Nicht authentifiziert.");
    }

    console.log("USER:", user?.id);

    const { data, error } = await supabase
        .from("groups")
        .insert({
            name,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    const { error: membershipError } = await supabase
        .from("group_members")
        .insert({
            group_id: data.id,
            user_id: user.id,
            role: "admin",
        });

    if (membershipError) {
        throw membershipError;
    }

    return data;
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const { data, error } = await supabase
        .from("group_members")
        .select("id, role, user_id, profiles(id, username, full_name, avatar_url)")
        .eq("group_id", groupId)
        .order("role", { ascending: false });

    if (error) {
        throw error;
    }

    return (data ?? []).map((member: any) => ({
        id: member.id,
        role: member.role,
        user_id: member.user_id,
        profiles: member.profiles ? {
            id: member.profiles.id,
            username: member.profiles.username,
            full_name: member.profiles.full_name,
            avatar_url: member.profiles.avatar_url,
        } : null,
    })) as GroupMember[];
}

export async function createInvitation(groupId: string) {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw userError ?? new Error("Nicht authentifiziert.");
    }

    const code = createInvitationCode();

    const { data, error } = await supabase
        .from("group_invitations")
        .insert({
            group_id: groupId,
            code,
            created_by: user.id,
            is_active: true,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select("id, code")
        .single();

    if (error) {
        throw error;
    }

    return data;
}

export async function getInvitationByCode(code: string) {
    const { data, error } = await supabase
        .from("group_invitations")
        .select("id, group_id, code, expires_at, is_active")
        .eq("code", code)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}

export async function joinGroup(code: string) {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw userError ?? new Error("Nicht authentifiziert.");
    }

    const invitation = await getInvitationByCode(code);

    if (!invitation) {
        throw new Error("Einladung nicht gefunden.");
    }

    if (!invitation.is_active) {
        throw new Error("Diese Einladung ist nicht mehr aktiv.");
    }

    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
        throw new Error("Diese Einladung ist abgelaufen.");
    }

    const { error } = await supabase
        .from("group_members")
        .insert({
            group_id: invitation.group_id,
            user_id: user.id,
            role: "member",
        });

    if (error) {
        throw error;
    }

    return invitation.group_id;
}

export async function updateGroupMaxMeat(groupId: string, maxMeat: number) {
    const { data, error } = await supabase
        .from("groups")
        .update({ max_meat: maxMeat })
        .eq("id", groupId)
        .select("id, name, max_meat")
        .single();

    if (error) {
        throw error;
    }

    return data;
}

function createInvitationCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}
