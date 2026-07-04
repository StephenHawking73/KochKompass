import { useState } from "react";

export function useMealSelection() {
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  const isMoveMode = selectedMealId !== null;

  // Wähle eine Mahlzeit für den Move-Modus
  const selectMealForMove = (mealId: string) => {
    setSelectedMealId(mealId);
  };

  // Deselektiere die aktuelle Auswahl
  const deselectMeal = () => {
    setSelectedMealId(null);
  };

  // Toggle: wenn schon ausgewählt, deselektieren, sonst neue auswählen
  const toggleMealSelection = (mealId: string) => {
    if (selectedMealId === mealId) {
      deselectMeal();
    } else {
      selectMealForMove(mealId);
    }
  };

  // Prüfe ob eine bestimmte Mahlzeit ausgewählt ist
  const isMealSelected = (mealId: string) => {
    return selectedMealId === mealId;
  };

  return {
    selectedMealId,
    isMoveMode,
    selectMealForMove,
    deselectMeal,
    toggleMealSelection,
    isMealSelected,
  };
}
