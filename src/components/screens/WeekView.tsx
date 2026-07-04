import { View } from "react-native";
import WeekViewContainer from "@/components/screens/WeekViewContainer";
import WeekViewHeader from "@/components/screens/WeekViewHeader";
import WeekViewDay from "@/components/screens/WeekViewDay";
import { useWeekData } from "@/hooks/useWeekData";
import { useMealSelection } from "@/hooks/useMealSelection";
import { Meal } from "@/types/types";

interface WeekViewProps {
  meals?: Meal[];
  weekStart: Date;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function WeekView({
  meals = [],
  weekStart,
  refreshing,
  onRefresh,
}: WeekViewProps) {
  // Logik-Hooks
  const { todayKey, weekDays, getMealsForDay, getMaxRowsForDay, formatDate } =
    useWeekData(meals, weekStart);

  const {
    selectedMealId,
    isMoveMode,
    selectMealForMove,
    toggleMealSelection,
  } = useMealSelection();

  const handleMealLongPress = (mealId: string) => {
    selectMealForMove(mealId);
  };

  const handleMealPress = (mealId: string) => {
    toggleMealSelection(mealId);
  };

  return (
    <WeekViewContainer refreshing={refreshing} onRefresh={onRefresh}>
      <WeekViewHeader />

      {/* Rendere die ganze Woche */}
      {weekDays.map(({ date, label }) => {
        const dateKey = formatDate(date);
        const isToday = dateKey === todayKey;
        const maxRows = getMaxRowsForDay(dateKey);

        return (
          <View key={dateKey}>
            {Array.from({ length: maxRows }).map((_, i) => {
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
                  onMealLongPress={handleMealLongPress}
                  onMealPress={handleMealPress}
                />
              );
            })}
          </View>
        );
      })}
    </WeekViewContainer>
  );
}