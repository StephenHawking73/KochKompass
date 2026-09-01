import { supabase } from "@/lib/supabase";
import { Meal } from "@/types/types";
import { getActiveGroupContext } from "./groupService";

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
    const { activeGroupId, userId } = await getActiveGroupContext();

    let query = supabase.from("meal_plan").select("id, planned_date, recipe_id, recipes(id, title, image_url, description, attribute), meal_type, position");

    if (activeGroupId) {
        query = query.eq("group_id", activeGroupId);
    } else {
        query = query
            .is("group_id", null)
            .or(`user_id.eq.${userId},created_by.eq.${userId}`);
    }

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

export async function getMealLimitStatusForRecipe(recipeId: string, plannedDate: string) {
    const { data: recipeData, error: recipeError } = await supabase
        .from("recipes")
        .select("attribute")
        .eq("id", recipeId)
        .maybeSingle();

    if (recipeError) {
        throw recipeError;
    }

    if (recipeData?.attribute !== "meat") {
        return {
            limit: null,
            currentCount: 0,
            wouldExceed: false,
            exceedsLimit: false,
        };
    }

    const limit = await getCurrentMealLimit();
    const currentCount = await getCurrentWeeklyMeatCount(plannedDate);

    return {
        limit,
        currentCount,
        wouldExceed: currentCount + 1 > limit,
        exceedsLimit: currentCount + 1 > limit,
    };
}

async function getCurrentMealLimit() {
    const { activeGroupId, userId } = await getActiveGroupContext();

    if (activeGroupId) {
        const { data, error } = await supabase
            .from("groups")
            .select("max_meat")
            .eq("id", activeGroupId)
            .maybeSingle();

        if (error) {
            throw error;
        }

        return Number(data?.max_meat ?? 3);
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("max_meat")
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return Number(data?.max_meat ?? 3);
}

async function getCurrentWeeklyMeatCount(plannedDate: string) {
    const { activeGroupId, userId } = await getActiveGroupContext();

    const date = new Date(`${plannedDate}T12:00:00`);
    const day = (date.getDay() + 6) % 7;
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - day);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    let query = supabase
        .from("meal_plan")
        .select("id, recipes(attribute)")
        .gte("planned_date", formatLocalDate(weekStart))
        .lte("planned_date", formatLocalDate(weekEnd));

    if (activeGroupId) {
        query = query.eq("group_id", activeGroupId);
    } else {
        query = query
            .is("group_id", null)
            .or(`user_id.eq.${userId},created_by.eq.${userId}`);
    }

    const { data, error } = await query;

    if (error) {
        throw error;
    }

    return (data ?? []).filter((entry: any) => entry.recipes?.attribute === "meat").length;
}

export async function addMealToPlan(
    recipeId: string,
    plannedDate: string,
    mealType: Meal["meal_type"],
    mealPosition: number
) {
    await ensureAuthenticatedSession();
    const { activeGroupId, userId } = await getActiveGroupContext();

    return supabase
        .from("meal_plan")
        .insert({
            recipe_id: recipeId,
            planned_date: plannedDate,
            meal_type: mealType,
            position: mealPosition,
            group_id: activeGroupId,
            created_by: userId,
            user_id: userId,
        })
        .select("id")
        .single();
}

export async function deleteMealFromPlan(id: string) {
    return supabase
        .from("meal_plan")
        .delete()
        .eq("id", id);
}

function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}
