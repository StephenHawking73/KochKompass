import { useEffect, useState } from "react";
import { getMeals } from "@/services/mealService";

export function useMeals(weekStart?: Date | null, weekEnd?: Date | null) {
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (!weekStart || !weekEnd) return;

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const data = await getMeals(weekStart, weekEnd);

      if (active) {
        setMeals(data);
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return { meals, loading };
}