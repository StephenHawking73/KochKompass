import { supabase } from "@/lib/supabase";

export async function uploadRecipeImage(uri: string) {

    const response = await fetch(uri);

    const arrayBuffer = await response.arrayBuffer();

    const extension = uri.split(".").pop() || "jpg";

    const fileName =
        `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error } = await supabase.storage
        .from("recipe-images")
        .upload(fileName, arrayBuffer, {
            contentType: "image/jpeg",
            upsert: false,
        });

    if (error) {
        throw error;
    }

    const { data } = supabase.storage
        .from("recipe-images")
        .getPublicUrl(fileName);

    return data.publicUrl;
}


export async function deleteRecipeImage(url: string, imageUrl?: string) {

    if (!url) return;

    const fileName = url.split("/").pop();
    if (!fileName) return;

    if (url) {
        const { error } = await supabase.storage
            .from("recipe-images")
            .remove([fileName]);

        if (error) {
            throw error;
        }
    }
    
    if (imageUrl) {
        const { error } = await supabase
            .from("recipes")
            .update({
                image_url: null
            })
            .eq("image_url", imageUrl);

        if (error) {
            throw error;
        }
    }
}