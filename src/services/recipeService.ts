import { supabase } from "@/lib/supabase";

export async function getRecipes() {
    let query = supabase.from("recipes").select("id, title, image_url, description, attribute, created_at, meal_plan(planned_date), recipe_ratings_summary(avg_rating, rating_count)");

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
        last_cooked_at: recipe.meal_plan?.[0]?.planned_date ?? null,
        created_at: recipe.created_at,

        rating: recipe.recipe_ratings_summary?.[0]?.avg_rating ?? 0,
        rating_count: recipe.recipe_ratings_summary?.[0]?.rating_count ?? 0,
    }));
}