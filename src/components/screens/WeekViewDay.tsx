import { View, Text, StyleSheet } from "react-native";
import MealSlot from "@/components/screens/MealSlot";
import { Meal } from "@/types/types";
import { useTheme } from "@/hooks/useTheme";

interface WeekViewDayProps {
  dateKey: string;
  label: string;
  isToday: boolean;
  slotIndex: number;
  lunchMeal?: Meal;
  dinnerMeal?: Meal;
  selectedMealId: string | null;
  isMoveMode: boolean;
  activeTargetKey?: string | null;
  onMealLongPress: (mealId: string) => void;
  onMealPress: (mealId: string) => void;
  onTargetPress?: (dateKey: string, mealType: "lunch" | "dinner", mealPosition: number) => void;
}

export default function WeekViewDay({
  dateKey,
  label,
  isToday,
  slotIndex,
  lunchMeal,
  dinnerMeal,
  selectedMealId,
  isMoveMode,
  activeTargetKey,
  onMealLongPress,
  onMealPress,
  onTargetPress,
}: WeekViewDayProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View key={`${dateKey}-${slotIndex}`} style={styles.row}>
      <View style={styles.dayColumn}>
        {slotIndex === 0 && (
          <Text style={[styles.day, isToday && styles.todayText]}>
            {label}
          </Text>
        )}
      </View>

      <MealSlot
        meal={lunchMeal}
        dateKey={dateKey}
        mealType="lunch"
        mealPosition={slotIndex}
        isSelected={selectedMealId === lunchMeal?.id}
        isMoveMode={isMoveMode}
        isMoveTarget={activeTargetKey === `${dateKey}-lunch-${slotIndex}`}
        onLongPress={onMealLongPress}
        onPress={onMealPress}
        onTargetPress={onTargetPress}
      />

      <MealSlot
        meal={dinnerMeal}
        dateKey={dateKey}
        mealType="dinner"
        mealPosition={slotIndex}
        isSelected={selectedMealId === dinnerMeal?.id}
        isMoveMode={isMoveMode}
        isMoveTarget={activeTargetKey === `${dateKey}-dinner-${slotIndex}`}
        onLongPress={onMealLongPress}
        onPress={onMealPress}
        onTargetPress={onTargetPress}
      />

      <View style={styles.plusColumn}>
        {slotIndex === 0 && (
          <Text style={styles.plus}>+</Text>
        )}
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },
    dayColumn: {
      width: 40,
      justifyContent: "flex-start",
    },
    day: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text.primary,
    },
    todayText: {
      color: theme.text.colored,
      fontWeight: "700",
    },
    plusColumn: {
      width: 20,
      alignItems: "center",
    },
    plus: {
      fontSize: 24,
      color: theme.accent.primary,
      marginLeft: 5,
    },
  });
