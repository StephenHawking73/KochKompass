import { useEffect, useState } from "react";
import { getMeals } from "@/services/mealService";

export function useMeals() {
  const [meals, setMeals] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const data = await getMeals();

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