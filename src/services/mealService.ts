import { supabase } from "@/lib/supabase";
import type { Meal } from "@/types/meal";

export async function getMeals(weekStart?: Date | null, weekEnd?: Date | null) {
    let query = supabase.from("meals").select("*");

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

    return ((data ?? []) as Meal[]).map((meal) => ({
        ...meal,
        date: meal.date ?? meal.planned_date,
    }));
}

function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}