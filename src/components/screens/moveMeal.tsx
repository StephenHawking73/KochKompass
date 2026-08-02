import { supabase } from "@/lib/supabase";
import { Meal } from "@/types/types";

async function ensureAuthenticatedSession() {
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    if (!session) {
        throw new Error("User is not authenticated.");
    }

    return session;
}

type MealPlanMutationResult = {
    error?: unknown;
    data?: unknown;
};

export async function moveMeal(
    mealId: string,
    plannedDate: string,
    mealType: Meal["meal_type"],
    mealPosition: number
): Promise<MealPlanMutationResult> {
    await ensureAuthenticatedSession();
    const result = await supabase
        .from("meal_plan")
        .update({
            planned_date: plannedDate,
            meal_type: mealType,
            position: mealPosition,
        })
        .eq("id", mealId)
        .select("id");

    return {
        error: result.error ?? undefined,
        data: result.data ?? null,
    };
}

export async function swapMeal(
    sourceMealId: string,
    targetMealId: string,
    plannedDate: string,
    mealType: Meal["meal_type"],
    mealPosition: number
): Promise<MealPlanMutationResult & {
    sourceResult?: unknown;
    targetResult?: unknown;
    sourceMeal?: unknown;
    targetMeal?: unknown;
}> {
    await ensureAuthenticatedSession();

    const { data: sourceMeal, error: sourceError } = await supabase
        .from("meal_plan")
        .select("id, planned_date, meal_type, position")
        .eq("id", sourceMealId)
        .single();

    if (sourceError) {
        throw sourceError;
    }

    const { data: targetMeal, error: targetError } = await supabase
        .from("meal_plan")
        .select("id, planned_date, meal_type, position")
        .eq("id", targetMealId)
        .single();

    if (targetError) {
        throw targetError;
    }

    const sourceUpdate = {
        planned_date: plannedDate,
        meal_type: mealType,
        position: mealPosition,
    };

    const targetUpdate = {
        planned_date: sourceMeal.planned_date,
        meal_type: sourceMeal.meal_type,
        position: sourceMeal.position,
    };

    const sourceResult = await supabase
        .from("meal_plan")
        .update(sourceUpdate)
        .eq("id", sourceMealId)
        .select("id");

    if (sourceResult.error) {
        throw sourceResult.error;
    }

    const targetResult = await supabase
        .from("meal_plan")
        .update(targetUpdate)
        .eq("id", targetMealId)
        .select("id");

    if (targetResult.error) {
        throw targetResult.error;
    }

    return {
        sourceResult,
        targetResult,
        sourceMeal,
        targetMeal,
    };
}