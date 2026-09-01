import { create } from "zustand";

type PlanningStore = {
  planningRecipeId: string | null;
  planningRecipeTitle: string | null;
  setPlanningMode: (recipeId: string, recipeTitle?: string | null) => void;
  clearPlanningMode: () => void;
};

export const usePlanningStore = create<PlanningStore>((set) => ({
  planningRecipeId: null,
  planningRecipeTitle: null,
  setPlanningMode: (recipeId, recipeTitle = null) =>
    set({
      planningRecipeId: recipeId,
      planningRecipeTitle: recipeTitle,
    }),
  clearPlanningMode: () =>
    set({
      planningRecipeId: null,
      planningRecipeTitle: null,
    }),
}));
