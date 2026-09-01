import { supabase } from "@/lib/supabase";
import { ProfileType } from "@/types/profile";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

function mapSupabaseError(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) {
        const message = error.message.toLowerCase();

        if (message.includes("network") || message.includes("fetch") || message.includes("failed to fetch")) {
            return "Bitte prüfe deine Internetverbindung und versuche es erneut.";
        }

        if (message.includes("jwt") || message.includes("session") || message.includes("expired") || message.includes("token")) {
            return "Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.";
        }

        if (message.includes("permission") || message.includes("policy") || message.includes("row-level") || message.includes("rls")) {
            return "Du hast keine Berechtigung für diese Änderung.";
        }

        if (message.includes("already registered") || message.includes("already exists") || message.includes("email already") || message.includes("duplicate")) {
            return "Diese E-Mail-Adresse wird bereits verwendet.";
        }

        if (message.includes("weak password") || message.includes("password should") || message.includes("password is too weak")) {
            return "Das Passwort ist zu schwach. Bitte nutze eine längere und sicherere Kombination.";
        }

        if (message.includes("invalid login credentials") || message.includes("wrong password") || message.includes("incorrect password")) {
            return "Das aktuelle Passwort ist falsch.";
        }

        if (message.includes("invalid email") || message.includes("email is invalid")) {
            return "Bitte gib eine gültige E-Mail-Adresse ein.";
        }
    }

    return fallback;
}

async function getAuthenticatedUser() {
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        throw userError ?? new Error("Nicht authentifiziert.");
    }

    return userData.user;
}

function normalizeProfileData(data: Partial<ProfileType> | null | undefined): ProfileType | null {
    if (!data) {
        return null;
    }

    return {
        id: data.id ?? "",
        username: data.username ?? "",
        full_name: data.full_name ?? null,
        avatar_url: data.avatar_url ?? null,
        email: data.email ?? "",
        max_meat: data.max_meat ?? null,
    };
}

export async function getProfile(): Promise<ProfileType | null> {
    const user = await getAuthenticatedUser().catch(() => null);

    if (!user) {
        return null;
    }

    const { data, error } = await supabase
        .from("profiles")
        .select(`
            id,
            username,
            full_name,
            avatar_url,
            email,
            max_meat
        `)
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
        if (error.code === "PGRST116") {
            return null;
        }
        throw error;
    }

    const profile = normalizeProfileData(data);

    if (profile && !profile.email && user.email) {
        profile.email = user.email;
    }

    return profile;
}

export async function updateProfileDetails(input: { username: string; full_name: string }) {
    const user = await getAuthenticatedUser();
    const username = input.username.trim();
    const fullName = input.full_name.trim();

    if (!username) {
        throw new Error("Bitte gib einen gültigen Namen ein.");
    }

    const { data, error } = await supabase
        .from("profiles")
        .update({
            username,
            full_name: fullName || null,
        })
        .eq("id", user.id)
        .select(`
            id,
            username,
            full_name,
            avatar_url,
            email,
            max_meat
        `)
        .single();

    if (error) {
        throw new Error(mapSupabaseError(error, "Der Name konnte nicht gespeichert werden."));
    }

    return normalizeProfileData(data) as ProfileType;
}

export async function updateProfileEmail(newEmail: string) {
    const user = await getAuthenticatedUser();
    const trimmedEmail = newEmail.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
        throw new Error("Bitte gib eine gültige E-Mail-Adresse ein.");
    }

    const { error } = await supabase.auth.updateUser({ email: trimmedEmail });

    if (error) {
        throw new Error(mapSupabaseError(error, "Die E-Mail-Adresse konnte nicht aktualisiert werden."));
    }

    return {
        email: trimmedEmail,
        userId: user.id,
    };
}

export async function changePassword(input: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}) {
    const { data: authData, error: userError } = await supabase.auth.getUser();

    if (userError || !authData.user) {
        throw new Error("Bitte melde dich erneut an.");
    }

    if (!authData.user.email) {
        throw new Error("Für diese Änderung ist eine verifizierte E-Mail-Adresse erforderlich.");
    }

    const currentPassword = input.currentPassword.trim();
    const newPassword = input.newPassword.trim();
    const confirmPassword = input.confirmPassword.trim();

    if (!currentPassword) {
        throw new Error("Bitte gib dein aktuelles Passwort ein.");
    }

    if (!newPassword || newPassword.length < 8) {
        throw new Error("Das neue Passwort muss mindestens 8 Zeichen lang sein.");
    }

    if (newPassword !== confirmPassword) {
        throw new Error("Die neuen Passwörter stimmen nicht überein.");
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authData.user.email,
        password: currentPassword,
    });

    if (signInError) {
        throw new Error(mapSupabaseError(signInError, "Das aktuelle Passwort ist falsch."));
    }

    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (updateError) {
        throw new Error(mapSupabaseError(updateError, "Das Passwort konnte nicht geändert werden."));
    }
}

function getAvatarExtension(uri: string): string {
    const lastSegment = uri.split("?")[0].split("/").pop() ?? "avatar.jpg";
    const extension = lastSegment.includes(".") ? lastSegment.split(".").pop()?.toLowerCase() : "jpg";

    if (extension === "jpeg") {
        return "jpg";
    }

    return ["jpg", "jpeg", "png", "webp"].includes(extension ?? "") ? (extension ?? "jpg") : "jpg";
}

function getAvatarMimeType(extension: string): string {
    switch (extension) {
        case "png":
            return "image/png";
        case "webp":
            return "image/webp";
        default:
            return "image/jpeg";
    }
}

function getAvatarObjectPath(url: string | null | undefined) {
    if (!url) {
        return null;
    }

    const cleanUrl = url.split("?")[0];
    const marker = `/${AVATAR_BUCKET}/`;
    const bucketIndex = cleanUrl.indexOf(marker);

    if (bucketIndex >= 0) {
        return decodeURIComponent(cleanUrl.slice(bucketIndex + marker.length));
    }

    const fileName = cleanUrl.split("/").pop();
    return fileName ? decodeURIComponent(fileName) : null;
}

export async function uploadAvatarImage(uri: string) {
    const user = await getAuthenticatedUser();

    const response = await fetch(uri);

    if (!response.ok) {
        throw new Error("Das Bild konnte nicht geladen werden.");
    }

    const arrayBuffer = await response.arrayBuffer();

    if (arrayBuffer.byteLength > MAX_AVATAR_SIZE_BYTES) {
        throw new Error("Das Profilbild darf maximal 5 MB groß sein.");
    }

    const extension = getAvatarExtension(uri);
    const contentType = getAvatarMimeType(extension);
    const uniqueFileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(uniqueFileName, arrayBuffer, {
            contentType,
            upsert: false,
        });

    if (uploadError) {
        throw new Error(mapSupabaseError(uploadError, "Dein Profilbild konnte nicht hochgeladen werden."));
    }

    const { data: publicUrlData } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(uniqueFileName);

    const publicUrl = publicUrlData.publicUrl;

    const currentProfile = await getProfile();
    const previousAvatarPath = currentProfile?.avatar_url ? getAvatarObjectPath(currentProfile.avatar_url) : null;

    const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

    if (profileError) {
        await supabase.storage.from(AVATAR_BUCKET).remove([uniqueFileName]);
        throw new Error(mapSupabaseError(profileError, "Das Profilbild konnte nicht gespeichert werden."));
    }

    if (previousAvatarPath && previousAvatarPath !== uniqueFileName) {
        await supabase.storage.from(AVATAR_BUCKET).remove([previousAvatarPath]).catch(() => undefined);
    }

    return publicUrl;
}

export async function removeAvatarImage() {
    const user = await getAuthenticatedUser();
    const profile = await getProfile();
    const objectPath = profile?.avatar_url ? getAvatarObjectPath(profile.avatar_url) : null;

    if (objectPath) {
        const { error: storageError } = await supabase.storage
            .from(AVATAR_BUCKET)
            .remove([objectPath]);

        if (storageError) {
            throw new Error(mapSupabaseError(storageError, "Das Profilbild konnte nicht gelöscht werden."));
        }
    }

    const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

    if (error) {
        throw new Error(mapSupabaseError(error, "Das Profilbild konnte nicht entfernt werden."));
    }
}

export async function updateProfileMaxMeat(maxMeat: number) {
    const user = await getAuthenticatedUser();

    const { data, error } = await supabase
        .from("profiles")
        .update({ max_meat: maxMeat })
        .eq("id", user.id)
        .select("id, max_meat")
        .single();

    if (error) {
        throw new Error(mapSupabaseError(error, "Die Einstellung konnte nicht gespeichert werden."));
    }

    return data;
} 