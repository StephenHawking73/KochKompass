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

export async function moveMeal(
    mealId: string,
    plannedDate: string,
    mealType: Meal["meal_type"],
    mealPosition: number
) {
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

    return result;
}