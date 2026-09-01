import React, { useState } from "react";
import { router } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import WeekViewContainer from "@/components/screens/WeekViewContainer";
import WeekViewHeader from "@/components/screens/WeekViewHeader";
import WeekViewDay from "@/components/screens/WeekViewDay";
import { useWeekData } from "@/hooks/useWeekData";
import { useMealSelection } from "@/hooks/useMealSelection";
import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";
import { Meal } from "@/types/types";
import { moveMeal, swapMeal } from "./moveMeal";
import { addMealToPlan, deleteMealFromPlan, getMealLimitStatusForRecipe } from "@/services/mealService";
import DeleteMealModal from "../modals/DeleteMealModal";
import { useWeekLayout } from "@/hooks/useWeekLayout";
import { usePlanningStore } from "@/store/planningStore";
import { useAppAlert } from "@/providers/AlertProvider";

interface WeekViewProps {
  meals?: Meal[];
  weekStart: Date;
  refreshing: boolean;
  onRefresh: () => void;
  planningRecipeId?: string | null;
  planningRecipeTitle?: string | null;
}

export default function WeekView({
  meals = [],
  weekStart,
  refreshing,
  onRefresh,
  planningRecipeId,
  planningRecipeTitle,
}: WeekViewProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { showAlert } = useAppAlert();

  const {
    extraRowsByDate,
    addExtraRow,
    removeExtraRow,
  } = useWeekLayout();

  // Logik-Hooks
  const { todayKey, weekDays, getMealsForDay, getMaxRowsForDay, formatDate } =
    useWeekData(meals, weekStart);
  const { clearPlanningMode } = usePlanningStore();

  const {
    selectedMealId,
    isMoveMode,
    selectMealForMove,
    deselectMeal,
    toggleMealSelection,
  } = useMealSelection();
  const [activeTargetKey, setActiveTargetKey] = useState<string | null>(null);
  const isPlanningMode = Boolean(planningRecipeId);

  const handleMealLongPress = (mealId: string) => {
    selectMealForMove(mealId);
  };

  const handleMealPress = (mealId: string) => {
    toggleMealSelection(mealId);
  };

  const handleExitMode = () => {
    if (isPlanningMode) {
      clearPlanningMode();
      router.replace("/");
      return;
    }

    deselectMeal();
  };

  const handleTargetPress = async (
      date: string,
      mealType: Meal["meal_type"],
      position: number
  ) => {
      if (!selectedMealId)
          return;

      const targetKey = `${date}-${mealType}-${position}`;
      setActiveTargetKey(targetKey);

      try {
        const selectedMeal = meals.find((meal) => meal.id === selectedMealId);
        const targetMeal = meals.find(
          (meal) =>
            meal.planned_date === date &&
            meal.meal_type === mealType &&
            (meal.position ?? meal.meal_position ?? 0) === position
        );

        const result =
          targetMeal && targetMeal.id !== selectedMealId
            ? await swapMeal(selectedMealId, targetMeal.id, date, mealType, position)
            : await moveMeal(selectedMealId, date, mealType, position);

        if (result?.error) {
          throw result.error;
        }

        toggleMealSelection(selectedMealId);
        onRefresh();
      } catch (error) {
        const message = error instanceof Error && error.message ? error.message : "Die Mahlzeit konnte nicht verschoben werden.";
        showAlert({
          title: "Verschieben fehlgeschlagen",
          message,
        });
      } finally {
        window.setTimeout(() => setActiveTargetKey(null), 260);
      }
  };

  const handleEmptySlotLongPress = (
    date: string,
    mealType: Meal["meal_type"],
    position: number
  ) => {
    router.push({
      pathname: "/recipes",
      params: {
        planningDate: date,
        planningMealType: mealType,
        planningPosition: String(position),
      },
    });
  };

  const handlePlanTargetPress = async (
    date: string,
    mealType: Meal["meal_type"],
    position: number
  ) => {
    if (!planningRecipeId) {
      return;
    }

    const targetKey = `${date}-${mealType}-${position}`;
    setActiveTargetKey(targetKey);

    const proceedWithPlanning = async () => {
      try {
        const result = await addMealToPlan(
          planningRecipeId,
          date,
          mealType,
          position
        );

        if (result?.error) {
          throw result.error;
        }

        onRefresh();
        router.replace("/");
      } catch (error) {
        const message = error instanceof Error && error.message ? error.message : "Das Rezept konnte nicht in den Plan übernommen werden.";
        showAlert({
          title: "Einplanen fehlgeschlagen",
          message,
        });
      } finally {
        window.setTimeout(() => setActiveTargetKey(null), 260);
      }
    };

    try {
      const status = await getMealLimitStatusForRecipe(planningRecipeId, date);

      if (status.exceedsLimit && status.limit != null) {
        const wouldBe = status.currentCount + 1;
        showAlert({
          title: "Fleischlimit erreicht",
          message: `Du hast bereits ${status.currentCount} von ${status.limit} Fleischgerichten in dieser Woche geplant. Wenn du noch eines einplanst, wären es ${wouldBe}. Möchtest du wirklich mehr Fleisch in der Woche machen?`,
          actions: [
            { text: "Abbrechen", style: "cancel" },
            { text: "Trotzdem einplanen", style: "destructive", onPress: proceedWithPlanning },
          ],
        });
        return;
      }

      await proceedWithPlanning();
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : "Die Planungsprüfung konnte nicht abgeschlossen werden.";
      showAlert({
        title: "Planungsprüfung fehlgeschlagen",
        message,
      });
      await proceedWithPlanning();
    }
  };

  const handleAddDayPress = (date: string) => {
      addExtraRow(date);
  };

  const [deleteMeal, setDeleteMeal] = useState<Meal | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const handleDeleteMeal = (meal: Meal) => {
    setDeleteMeal(meal);
  }

  return (
    <WeekViewContainer refreshing={refreshing} onRefresh={onRefresh}>
      {(isMoveMode || isPlanningMode) && (
        <View style={styles.modeBanner}>
          <View style={styles.modeContent}>
            {isPlanningMode
              ? icons.calendar({ color: theme.accent.primary, size: 16 })
              : icons.move({ color: theme.accent.primary, size: 16 })}
            
            <Text style={styles.modeLabel} numberOfLines={1}>
              {isPlanningMode && planningRecipeTitle
                ? planningRecipeTitle
                : isPlanningMode
                ? "Rezept einplanen"
                : "Mahlzeit verschieben"}
            </Text>

            <Pressable
              style={styles.closeModeButton}
              onPress={handleExitMode}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {icons.close({ color: theme.text.op, size: 13 })}
            </Pressable>
          </View>
          
        </View>
      )}

      <WeekViewHeader />

      {/* Rendere die ganze Woche */}
      {weekDays.map(({ date, label }) => {
        const dateKey = formatDate(date);
        const isToday = dateKey === todayKey;
        
        const lunchMeals = getMealsForDay(dateKey, "lunch");
        const dinnerMeals = getMealsForDay(dateKey, "dinner");

        const mealRows = Math.max(
            lunchMeals.length,
            dinnerMeals.length,
            1
        );

        const extraRows = extraRowsByDate[dateKey] ?? 0;

        const rowsToRender = Math.max(mealRows,1+ extraRows);

        const lastRowIndex = rowsToRender - 1;

        const lastRowEmpty =
            !lunchMeals[lastRowIndex] &&
            !dinnerMeals[lastRowIndex];

        const showRemove =
            extraRows > 0 &&
            lastRowEmpty;

        const lunchFull = getMealsForDay(dateKey, "lunch").length >= rowsToRender;
        const dinnerFull = getMealsForDay(dateKey, "dinner").length >= rowsToRender;

        const showPlus = lunchFull || dinnerFull;

        return (
          <View key={dateKey}>
            {Array.from({ length: rowsToRender }).map((_, i) => {
              const lunchMeal = getMealsForDay(dateKey, "lunch")[i];
              const dinnerMeal = getMealsForDay(dateKey, "dinner")[i];

              return (
                <WeekViewDay
                  key={`${dateKey}-${i}`}
                  dateKey={dateKey}
                  label={label}
                  isToday={isToday}
                  slotIndex={i}
                  lunchMeal={lunchMeal}
                  dinnerMeal={dinnerMeal}
                  selectedMealId={selectedMealId}
                  isMoveMode={isMoveMode}
                  isPlanningMode={isPlanningMode}
                  activeTargetKey={activeTargetKey}
                  onMealLongPress={handleMealLongPress}
                  onMealPress={handleMealPress}
                  onTargetPress={handleTargetPress}
                  onPlanTargetPress={handlePlanTargetPress}
                  onEmptySlotLongPress={handleEmptySlotLongPress}
                  onAddDayPress={handleAddDayPress}
                  showAddButton={i === rowsToRender - 1 && showPlus}
                  showRemoveButton={i === rowsToRender - 1 && showRemove}
                  onRemoveRow={() => removeExtraRow(dateKey)}
                  onDeletePress={handleDeleteMeal}
                />
              );
            })}
          </View>
        );
      })}

      <DeleteMealModal
        visible={deleteMeal !== null}
        mealTitle={deleteMeal?.title ?? ""}
        loading={deleting}
        onClose={() => setDeleteMeal(null)}
        onDelete={async () => {

            if (!deleteMeal)
                return;

            setDeleting(true);

            try {

                const { error } = await deleteMealFromPlan(deleteMeal.id);

                if (error)
                    throw error;

                setDeleteMeal(null);

                onRefresh();

            } finally {

                setDeleting(false);

            }

        }}
    />
    </WeekViewContainer>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    modeBanner: {
      marginTop: 14,
      marginBottom: 12,
      borderRadius: 10,
      backgroundColor: theme.accent.op,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    modeContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    modeLabel: {
      color: theme.text.primary,
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
    },
    closeModeButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.card.background + "40",
    },
  });

