import { useCallback, useEffect, useState } from "react";
import type { Recipe } from "@/types/types";
import { getRecipes } from "@/services/recipedService";

export function useRecipes() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
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
                const data = await getRecipes();

                if (!cancelled) {
                    setRecipes(data);
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
    }, [refreshIndex]);

    return { recipes, loading, refresh };
}