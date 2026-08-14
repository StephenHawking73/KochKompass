import { supabase } from "@/lib/supabase";

export async function uploadRecipeImage(uri: string) {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        throw userError ?? new Error("Nicht authentifiziert.");
    }

    const response = await fetch(uri);

    const arrayBuffer = await response.arrayBuffer();

    const extension = uri.split(".").pop()?.toLowerCase() || "jpg";

    const mimeType: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
    }
    const contentType = mimeType[extension] ?? "image/jpeg";

    const fileName =
        `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error } = await supabase.storage
        .from("recipe-images")
        .upload(fileName, arrayBuffer, {
            contentType,
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

    const objectPath = getRecipeImageObjectPath(url);
    if (!objectPath) return;

    if (url) {
        const { error } = await supabase.storage
            .from("recipe-images")
            .remove([objectPath]);

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

function getRecipeImageObjectPath(url: string) {
    const cleanUrl = url.split("?")[0];
    const bucketMarker = "/recipe-images/";
    const bucketIndex = cleanUrl.indexOf(bucketMarker);

    if (bucketIndex >= 0) {
        return decodeURIComponent(cleanUrl.slice(bucketIndex + bucketMarker.length));
    }

    return decodeURIComponent(cleanUrl.split("/").pop() ?? "");
}
