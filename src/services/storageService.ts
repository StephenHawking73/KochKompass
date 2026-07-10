import { supabase } from "@/lib/supabase";

export async function uploadRecipeImage(uri: string) {
    const response = await fetch(uri);
    const blob = await response.blob();

    const fileName =
        `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;

    const { error } = await supabase.storage
        .from("recipe-images")
        .upload(fileName, blob, {
            contentType: "image/jpeg",
        });

    if (error) throw error;

    const { data } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(fileName);

    return data.publicUrl;
}