import { supabase } from "@/lib/supabase";

export async function getRecipes() {
    let query = supabase.from("recipes").select("id, title, image_url, description, attribute");

    const { data, error } = await query.order(
        "title",
        {ascending: true}
    )

    if (error) {
        console.error(error);
        return [];
    }

    return (data ?? []).map((recipe: any) => ({
        id: recipe.id,
        title: recipe.title,
        image_url: recipe.image_url,
        description: recipe.description,
        attribute: recipe.attribute,
    }));
}