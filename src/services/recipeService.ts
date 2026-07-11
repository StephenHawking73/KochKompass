import { supabase } from "@/lib/supabase";
import { Recipe, RecipeInput } from "@/types/types";
import { deleteRecipeImage } from "./storageService";

export async function getRecipes() {
    let query = supabase.from("recipes").select("id, title, image_url, description, attribute, duration, difficulty, created_at, link, meal_plan(planned_date), recipe_ratings_summary(avg_rating, rating_count)");

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
        last_cooked_at: recipe.meal_plan?.[0]?.planned_date ?? null,
        created_at: recipe.created_at,

        rating: recipe.recipe_ratings_summary?.[0]?.avg_rating ?? 0,
        rating_count: recipe.recipe_ratings_summary?.[0]?.rating_count ?? 0,

        attribute: recipe.attribute,
        duration: recipe.duration,
        difficulty: recipe.difficulty,
        link: recipe.link,
    }));
}

export async function getRecipe(id: string) {
    const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error(error);
        return null;
    }

    return data;
}

export async function createRecipe(recipe: RecipeInput) {

    const { data: existing, error: checkError } = await supabase
        .from("recipes")
        .select("id")
        .ilike("title", recipe.title.trim())
        .maybeSingle();

    if (checkError) {
        console.log(checkError);
        throw checkError;
    }

    if (existing) {
        throw new Error("Dieses Rezept exisiert bereits!");
    }

    const { data, error } = await supabase
        .from("recipes")
        .insert({
            title: recipe.title,
            description: recipe.description,
            image_url: recipe.image_url,
            attribute: recipe.attribute,
            difficulty: recipe.difficulty,
            duration: recipe.duration,
            link: recipe.link,
        })
        .select()
        .single();
    
    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}

export async function updateRecipe(
    id: string,
    recipe: Partial<RecipeInput>
) {

    // Aktuelles Rezept laden
    const { data: currentRecipe, error: currentError } = await supabase
        .from("recipes")
        .select("image_url")
        .eq("id", id)
        .single();

    if (currentError) {
        console.error(currentError);
        throw currentError;
    }

    // Hat sich das Bild geändert?
    const oldImage = currentRecipe.image_url;
    const newImage = recipe.image_url;

    if (
        oldImage &&
        oldImage !== newImage
    ) {
        try {
            await deleteRecipeImage(oldImage);
        } catch (error) {
            console.error("Altes Bild konnte nicht gelöscht werden:", error);
        }
    }

    // Rezept aktualisieren
    const { data, error } = await supabase
        .from("recipes")
        .update({
            title: recipe.title,
            description: recipe.description,
            image_url: recipe.image_url,
            attribute: recipe.attribute,
            difficulty: recipe.difficulty,
            duration: recipe.duration,
            link: recipe.link,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}

export async function deleteRecipe(id: string) {

    // Bild-URL holen
    const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .select("image_url")
        .eq("id", id)
        .single();

    if (recipeError) {
        console.error(recipeError);
        throw recipeError;
    }

    // Bild löschen (falls eigenes)
    try {
        await deleteRecipeImage(recipe.image_url);
    } catch (error) {
        console.error("Fehler beim Löschen des Bildes:", error);
    }

    // Rezept löschen
    const { data, error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", id)
        .select()
        .single();

    if (error) {
        console.error(error);
        throw error;
    }

    return data;
}