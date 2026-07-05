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

export async function moveMeal(
    mealId: string,
    plannedDate: string,
    mealType: Meal["meal_type"],
    mealPosition: number
) {
    console.log("moveMeal request", { mealId, plannedDate, mealType, mealPosition });

    const session = await ensureAuthenticatedSession();
    console.log("moveMeal session", !!session?.access_token);

    const result = await supabase
        .from("meal_plan")
        .update({
            planned_date: plannedDate,
            meal_type: mealType,
            position: mealPosition,
        })
        .eq("id", mealId)
        .select("id");

    console.log("moveMeal result", result);

    return result;
}