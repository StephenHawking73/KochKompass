import { supabase } from "@/lib/supabase";
import type { Meal } from "@/types/types";

export async function getMeals(weekStart?: Date | null, weekEnd?: Date | null) {
    let query = supabase.from("meal_plan").select("id, planned_date, recipes(id, title, image_url), meal_type, position");

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

    console.log(JSON.stringify(data, null, 2))

    return (data ?? []).map((meal: any) => ({
        id: meal.id,
        recipieId: meal.recipes?.id ?? null,
        planned_date: meal.planned_date,
        title: meal.recipes?.title ?? "->Unknown<-",
        meal_type: meal.meal_type,
        position: meal.position,
        image_url: meal.recipes?.image_url,
    }));
}

function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}