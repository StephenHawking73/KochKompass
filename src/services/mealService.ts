import { supabase } from "@/lib/supabase";
import type { Meal } from "@/types/meal";

export async function getMeals(weekStart?: Date | null, weekEnd?: Date | null) {
    let query = supabase.from("meals").select("*");

    if (weekStart && weekEnd) {
        query = query
            .gte("planned_date", weekStart.toISOString().split("T")[0])
            .lte("planned_date", weekEnd.toISOString().split("T")[0]);
    }

    const { data, error } = await query.order("planned_date", {
        ascending: true,
    });

    if (error) {
        console.error(error);
        return [];
    }

    return ((data ?? []) as Meal[]).map((meal) => ({
        ...meal,
        date: meal.date ?? meal.planned_date,
    }));
}