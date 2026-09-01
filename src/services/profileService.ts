import { supabase } from "@/lib/supabase";
import { ProfileType } from "@/types/profile";

export async function getProfile(): Promise<ProfileType | null> {
    const {
        data: userData,
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !userData.user) {
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
        .eq("id", userData.user.id)
        .single();

    if (error) {
        console.log(error);
        return null;
    }

    return data;
}

export async function updateProfileMaxMeat(maxMeat: number) {
    const {
        data: userData,
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !userData.user) {
        throw userError ?? new Error("Nicht authentifiziert.");
    }

    const { data, error } = await supabase
        .from("profiles")
        .update({ max_meat: maxMeat })
        .eq("id", userData.user.id)
        .select("id, max_meat")
        .single();

    if (error) {
        throw error;
    }

    return data;
} 