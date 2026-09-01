import { supabase } from "@/lib/supabase";
import { Recipe, RecipeInput } from "@/types/types";
import { deleteRecipeImage } from "./storageService";
import { getActiveGroupContext } from "./groupService";

export async function getRecipes(): Promise<Recipe[]> {
    const { activeGroupId, userId } = await getActiveGroupContext();

    let query = supabase.from("recipes").select("id, title, image_url, description, attribute, duration, difficulty, created_at, link, created_by, meal_plan(planned_date), recipe_ratings_summary(avg_rating, rating_count)");

    if (activeGroupId) {
        query = query.eq("group_id", activeGroupId);
    } else {
        query = query.is("group_id", null).eq("created_by", userId);
    }

    const { data, error } = await query.order(
        "title",
        {ascending: true}
    )

    if (error) {
        return [];
    }

    return (data ?? []).map((recipe: any): Recipe => ({
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
        created_by: recipe.created_by ?? null,
        distribution: recipe.distribution ?? null,
    }));
}

export async function getRecipe(id: string) {
    const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return null;
    }

    return data;
}

export async function createRecipe(recipe: RecipeInput) {
    const { activeGroupId, userId } = await getActiveGroupContext();

    let existingQuery = supabase
        .from("recipes")
        .select("id")
        .ilike("title", recipe.title.trim());

    if (activeGroupId) {
        existingQuery = existingQuery.eq("group_id", activeGroupId);
    } else {
        existingQuery = existingQuery.is("group_id", null).eq("created_by", userId);
    }

    const { data: existing, error: checkError } = await existingQuery.maybeSingle();

    if (checkError) {
        throw new Error("Rezeptprüfung fehlgeschlagen. Bitte versuche es erneut.");
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
            created_by: userId,
            group_id: activeGroupId,
        })
        .select()
        .single();
    
    if (error) {
        throw new Error("Rezept konnte nicht erstellt werden.");
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
        throw new Error("Aktuelles Rezept konnte nicht geladen werden.");
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
        } catch {
            // Das ursprüngliche Rezept wird trotzdem aktualisiert; das Bild ist nicht kritisch.
        }
    }

    // Rezept aktualisieren
    const { activeGroupId } = await getActiveGroupContext().catch(() => ({ activeGroupId: null }));

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
            cooking_book: recipe.cooking_book,
            group_id: activeGroupId,
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw new Error("Rezept konnte nicht aktualisiert werden.");
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
        throw new Error("Rezeptdaten konnten nicht geladen werden.");
    }

    // Bild löschen (falls eigenes)
    try {
        await deleteRecipeImage(recipe.image_url);
    } catch {
        // Bildlöschung ist nicht kritisch, das Rezept soll trotzdem entfernt werden.
    }

    // Rezept löschen
    const { data, error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw new Error("Rezept konnte nicht gelöscht werden.");
    }

    return data;
}
