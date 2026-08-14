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
    icon?: string | null;
    accent_color?: string | null;
    design_variant?: string | null;
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

type CreateGroupOptions = {
    icon?: string;
    accent_color?: string;
    design_variant?: string;
};

type GroupUpdateInput = {
    name?: string;
    max_meat?: number;
    image_url?: string | null;
    icon?: string;
    accent_color?: string;
    design_variant?: string;
};

const GROUP_SELECT = "group_id, role, groups(id, name, max_meat, image_url, created_by, icon, accent_color, design_variant)";
const GROUP_SELECT_FALLBACK = "group_id, role, groups(id, name, max_meat, image_url, created_by)";
const GROUP_RETURN_SELECT = "id, name, max_meat, image_url, created_by, icon, accent_color, design_variant";
const GROUP_RETURN_SELECT_FALLBACK = "id, name, max_meat, image_url, created_by";

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
        .select(GROUP_SELECT)
        .eq("user_id", user.id)
        .maybeSingle();

    if (error) {
        if (isMissingDesignColumnError(error)) {
            return getActiveGroupFallback(user.id);
        }

        throw error;
    }

    return mapGroupResponse(data);
}

export async function createGroup(name: string, options: CreateGroupOptions = {}) {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw userError ?? new Error("Nicht authentifiziert.");
    }

    const insertPayload = {
        name,
        created_by: user.id,
        icon: options.icon ?? "users",
        accent_color: options.accent_color ?? "#82C05C",
        design_variant: options.design_variant ?? "fresh",
    };

    let { data, error } = await supabase
        .from("groups")
        .insert(insertPayload)
        .select()
        .single();

    if (error) {
        if (!isMissingDesignColumnError(error)) {
            throw error;
        }

        const fallback = await supabase
            .from("groups")
            .insert({
                name,
                created_by: user.id,
            })
            .select()
            .single();

        data = fallback.data;
        error = fallback.error;

        if (error) {
            throw error;
        }
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

export async function updateGroupSettings(groupId: string, updates: GroupUpdateInput) {
    const cleanedUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    const result = await supabase
        .from("groups")
        .update(cleanedUpdates)
        .eq("id", groupId)
        .select(GROUP_RETURN_SELECT)
        .single();
    let data: any = result.data;
    let error = result.error;

    if (error) {
        if (!isMissingDesignColumnError(error)) {
            throw error;
        }

        const fallbackUpdates = stripDesignUpdates(cleanedUpdates);

        if (Object.keys(fallbackUpdates).length === 0) {
            throw new Error("Die Gruppen-Designspalten fehlen noch in Supabase.");
        }

        const fallback = await supabase
            .from("groups")
            .update(fallbackUpdates)
            .eq("id", groupId)
            .select(GROUP_RETURN_SELECT_FALLBACK)
            .single();

        data = fallback.data;
        error = fallback.error;

        if (error) {
            throw error;
        }
    }

    return {
        ...data,
        icon: data.icon ?? updates.icon ?? "users",
        accent_color: data.accent_color ?? updates.accent_color ?? "#82C05C",
        design_variant: data.design_variant ?? updates.design_variant ?? "fresh",
    };
}

export async function updateGroupMaxMeat(groupId: string, maxMeat: number) {
    return updateGroupSettings(groupId, { max_meat: maxMeat });
}

export async function promoteGroupMember(groupId: string, userId: string) {
    const { error } = await supabase.rpc("promote_group_member", {
        p_group_id: groupId,
        p_user_id: userId,
    });

    if (error) {
        throw error;
    }
}

export async function removeGroupMember(groupId: string, userId: string) {
    const { error } = await supabase.rpc("remove_group_member", {
        p_group_id: groupId,
        p_user_id: userId,
    });

    if (error) {
        throw error;
    }
}

export async function leaveGroup(groupId: string) {
    const { error } = await supabase.rpc("leave_group", {
        p_group_id: groupId,
    });

    if (error) {
        throw error;
    }
}

export async function deleteGroup(groupId: string) {
    const { error } = await supabase.rpc("delete_group", {
        p_group_id: groupId,
    });

    if (error) {
        throw error;
    }
}

function createInvitationCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function getActiveGroupFallback(userId: string): Promise<GroupSummary | null> {
    const { data, error } = await supabase
        .from("group_members")
        .select(GROUP_SELECT_FALLBACK)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return mapGroupResponse(data);
}

function mapGroupResponse(data: any): GroupSummary | null {
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
        icon: groups.icon ?? "users",
        accent_color: groups.accent_color ?? "#82C05C",
        design_variant: groups.design_variant ?? "fresh",
    };
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const { data, error } = await supabase
        .from("group_members")
        .select("id, role, user_id, profiles(id, username, full_name, avatar_url)")
        .eq("group_id", groupId)
        .order("role", { ascending: true });

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

function stripDesignUpdates(updates: Record<string, unknown>) {
    const {
        icon,
        accent_color,
        design_variant,
        ...fallbackUpdates
    } = updates;

    return fallbackUpdates;
}

function isMissingDesignColumnError(error: any) {
    const message = String(error?.message ?? "");

    return error?.code === "42703"
        || message.includes("icon")
        || message.includes("accent_color")
        || message.includes("design_variant");
}
