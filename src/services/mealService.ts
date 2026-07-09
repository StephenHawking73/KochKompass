import { supabase } from "@/lib/supabase";
import { Meal } from "@/types/types";

async function ensureAuthenticatedSession() {
    const {
        data: { session },
        error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
        throw sessionError;
    }

    if (session?.access_token) {
        return session;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: "dev@dev.com",
        password: "KochKompass",
    });

    if (error) {
        throw error;
    }

    return data.session;
}

export async function getMeals(weekStart?: Date | null, weekEnd?: Date | null) {
    let query = supabase.from("meal_plan").select("id, planned_date, recipe_id, recipes(title, image_url, description, attribute), meal_type, position");

    if (weekStart && weekEnd) {
        query = query
            .gte("planned_date", formatLocalDate(weekStart))
            .lte("planned_date", formatLocalDate(weekEnd));
    }

    const { data, error } = await query.order("planned_date", {
        ascending: true,
    });

    if (error) {
        console.error(error);
        return [];
    }

    return (data ?? []).map((meal: any) => ({
        id: meal.id,
        recipieId: meal.recipes?.id ?? null,
        planned_date: meal.planned_date,
        title: meal.recipes?.title ?? "->Unknown<-",
        meal_type: meal.meal_type,
        meal_position: meal.position,
        position: meal.position,
        image_url: meal.recipes?.image_url,
        description: meal.recipes?.description,
        attribute: meal.recipes?.attribute,

        recipe_id: meal.recipe_id,
    }));
}

export async function addMealToPlan(
    recipeId: string,
    plannedDate: string,
    mealType: Meal["meal_type"],
    mealPosition: number
) {
    await ensureAuthenticatedSession();

    return supabase
        .from("meal_plan")
        .insert({
            recipe_id: recipeId,
            planned_date: plannedDate,
            meal_type: mealType,
            position: mealPosition,
        })
        .select("id")
        .single();
}

function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
