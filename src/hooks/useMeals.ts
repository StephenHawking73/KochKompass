import { useEffect, useState } from "react";
import { getMeals } from "@/services/mealService";

export function useMeals(weekStart?: Date | null, weekEnd?: Date | null) {
    const [meals, setMeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!weekStart || !weekEnd) return;

        let cancelled = false;

        async function load() {
            setLoading(true);

            try {
                const data = await getMeals(weekStart, weekEnd);

                if (!cancelled) {
                    setMeals(data);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [weekStart?.getTime(), weekEnd?.getTime()]);

    return { meals, loading };
}