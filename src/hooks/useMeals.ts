import { useCallback, useEffect, useState } from "react";
import { getMeals } from "@/services/mealService";
import type { Meal } from "@/types/types";

export function useMeals(weekStart?: Date | null, weekEnd?: Date | null) {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshIndex, setRefreshIndex] = useState(0);

    const refresh = useCallback(() => {
        setRefreshIndex((v) => v + 1);
    }, []);

    useEffect(() => {
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
    }, [weekStart?.getTime(), weekEnd?.getTime(), refreshIndex]);

    return { meals, loading, refresh };
}