import { useState } from "react";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import WeekViewContainer from "@/components/screens/WeekViewContainer";
import WeekViewHeader from "@/components/screens/WeekViewHeader";
import WeekViewDay from "@/components/screens/WeekViewDay";
import { useWeekData } from "@/hooks/useWeekData";
import { useMealSelection } from "@/hooks/useMealSelection";
import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";
import { Meal } from "@/types/types";
import { moveMeal } from "./moveMeal";
import { addMealToPlan } from "@/services/mealService";

interface WeekViewProps {
  meals?: Meal[];
  weekStart: Date;
  refreshing: boolean;
  onRefresh: () => void;
  planningRecipeId?: string | null;
}

export default function WeekView({
  meals = [],
  weekStart,
  refreshing,
  onRefresh,
  planningRecipeId,
}: WeekViewProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  // Logik-Hooks
  const { todayKey, weekDays, getMealsForDay, getMaxRowsForDay, formatDate } =
    useWeekData(meals, weekStart);

  const {
    selectedMealId,
    isMoveMode,
    selectMealForMove,
    deselectMeal,
    toggleMealSelection,
  } = useMealSelection();
  const [activeTargetKey, setActiveTargetKey] = useState<string | null>(null);
  const [extraRowsByDate, setExtraRowsByDate] = useState<Record<string, number>>({});
  const isPlanningMode = Boolean(planningRecipeId);

  const handleMealLongPress = (mealId: string) => {
    selectMealForMove(mealId);
  };

  const handleMealPress = (mealId: string) => {
    toggleMealSelection(mealId);
  };

  const handleExitMode = () => {
    if (isPlanningMode) {
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
        const result = await moveMeal(
            selectedMealId,
            date,
            mealType,
            position
        );

        if (result?.error) {
          throw result.error;
        }

        toggleMealSelection(selectedMealId);
        onRefresh();
      } catch (error) {
        console.error("move target failed", error);
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
      console.error("plan target failed", error);
    } finally {
      window.setTimeout(() => setActiveTargetKey(null), 260);
    }
  };

  const handleAddDayPress = (date: string) => {
    setExtraRowsByDate((current) => ({
      ...current,
      [date]: Math.max(current[date] ?? 0, 1),
    }));
  };

  return (
    <WeekViewContainer refreshing={refreshing} onRefresh={onRefresh}>
      {(isMoveMode || isPlanningMode) && (
        <View style={styles.modeBanner}>
          <View style={styles.modeHeader}>
            <View style={styles.modeTitleRow}>
              {isPlanningMode
                ? icons.calendar({ color: theme.accent.primary, size: 17 })
                : icons.move({ color: theme.accent.primary, size: 17 })}
              <Text style={styles.modeTitle}>
                {isPlanningMode ? "Rezept einplanen" : "Mahlzeit verschieben"}
              </Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={handleExitMode}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {icons.close({ color: theme.text.op, size: 15 })}
            </Pressable>
          </View>
          <Text style={styles.modeText}>
            {isPlanningMode
              ? "Wähle einen freien Slot in der Woche aus."
              : "Wähle den neuen freien Slot aus."}
          </Text>
        </View>
      )}

      <WeekViewHeader />

      {/* Rendere die ganze Woche */}
      {weekDays.map(({ date, label }) => {
        const dateKey = formatDate(date);
        const isToday = dateKey === todayKey;
        const maxRows = getMaxRowsForDay(dateKey);
        const extraRows = extraRowsByDate[dateKey] ?? 0;
        const rowsToRender = maxRows + extraRows;
        const isDayFull =
          getMealsForDay(dateKey, "lunch").length >= maxRows &&
          getMealsForDay(dateKey, "dinner").length >= maxRows;

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
                  showAddButton={i === 0 && isDayFull && extraRows === 0}
                />
              );
            })}
          </View>
        );
      })}
    </WeekViewContainer>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    modeBanner: {
      marginTop: 16,
      marginBottom: 18,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.accent.primary + "55",
      backgroundColor: theme.accent.op,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    modeHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    modeTitle: {
      color: theme.text.primary,
      fontSize: 15,
      fontWeight: "700",
    },
    modeTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexShrink: 1,
    },
    closeButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.card.background,
    },
    modeText: {
      color: theme.text.op,
      fontSize: 13,
      fontWeight: "500",
      marginTop: 3,
    },
  });
