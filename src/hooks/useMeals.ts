import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useMeals() {
    const [meals, setMeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMeals();
    }, []);

    async function loadMeals() {
        try {
            const { data, error } = await supabase
                .from("meals")
                .select("*");

            if (error) throw error;

            setMeals(data ?? []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    return {
        meals,
        loading,
        reloadMeals: loadMeals,
    };
}