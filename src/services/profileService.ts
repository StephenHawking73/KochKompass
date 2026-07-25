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
            avatar_url,
            email
        `)
        .eq("id", userData.user.id)
        .single();

    if (error) {
        console.log(error);
        return null;
    }

    return data;
}