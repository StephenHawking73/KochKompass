import { useMemo } from "react";
import { Meal } from "@/types/types";

type MealType = "lunch" | "dinner";

export function useWeekData(meals: Meal[], weekStart: Date) {
  const formatDate = (date: Date) => {
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(date.getDate()).padStart(2, "0")
    );
  };

  const todayKey = useMemo(() => {
    const now = new Date();
    return formatDate(now);
  }, []);

  const weekDays = useMemo(() => {
    const labels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return {
        date: d,
        label: labels[i],
      };
    });
  }, [weekStart]);

  // Organisiere Mahlzeiten in: dateKey -> mealType -> sortedMeals[]
  const slots = useMemo(() => {
    const map = new Map<string, Map<MealType, Meal[]>>();

    for (const meal of meals ?? []) {
      const dateKey = meal.planned_date;
      const type = meal.meal_type as MealType;

      if (!map.has(dateKey)) {
        map.set(dateKey, new Map());
      }

      const dayMap = map.get(dateKey)!;

      if (!dayMap.has(type)) {
        dayMap.set(type, []);
      }

      dayMap.get(type)!.push(meal);
    }

    // Sortiere nach position innerhalb eines Slots
    map.forEach((typeMap) => {
      typeMap.forEach((list) => {
        list.sort((a, b) => a.meal_position - b.meal_position);
      });
    });

    return map;
  }, [meals]);

  // Erhalte Mahlzeiten für einen bestimmten Tag und Typ
  const getMealsForDay = (dateKey: string, type: MealType) => {
    return slots.get(dateKey)?.get(type) ?? [];
  };

  // Erhalte maximale Anzahl von Reihen für einen Tag
  const getMaxRowsForDay = (dateKey: string) => {
    const lunch = getMealsForDay(dateKey, "lunch");
    const dinner = getMealsForDay(dateKey, "dinner");
    return Math.max(lunch.length, dinner.length, 1);
  };

  return {
    todayKey,
    weekDays,
    slots,
    getMealsForDay,
    getMaxRowsForDay,
    formatDate,
  };
}
