import { View, Text, StyleSheet, Pressable } from "react-native";
import MealSlot from "@/components/screens/MealSlot";
import { Meal } from "@/types/types";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";

interface WeekViewDayProps {
  dateKey: string;
  label: string;
  isToday: boolean;
  slotIndex: number;
  lunchMeal?: Meal;
  dinnerMeal?: Meal;
  selectedMealId: string | null;
  isMoveMode: boolean;
  isPlanningMode: boolean;
  activeTargetKey?: string | null;
  onMealLongPress: (mealId: string) => void;
  onMealPress: (mealId: string) => void;
  onTargetPress?: (dateKey: string, mealType: "lunch" | "dinner", mealPosition: number) => void;
  onPlanTargetPress?: (dateKey: string, mealType: "lunch" | "dinner", mealPosition: number) => void;
  onEmptySlotLongPress?: (dateKey: string, mealType: "lunch" | "dinner", mealPosition: number) => void;
  onAddDayPress?: (dateKey: string) => void;
  showAddButton?: boolean;
  onDeletePress?: (meal: Meal) => void;
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
  isPlanningMode,
  activeTargetKey,
  onMealLongPress,
  onMealPress,
  onTargetPress,
  onPlanTargetPress,
  onEmptySlotLongPress,
  onAddDayPress,
  showAddButton = false,
  onDeletePress,
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
        isPlanningMode={isPlanningMode}
        isMoveTarget={activeTargetKey === `${dateKey}-lunch-${slotIndex}`}
        onLongPress={onMealLongPress}
        onPress={onMealPress}
        onTargetPress={onTargetPress}
        onPlanTargetPress={onPlanTargetPress}
        onEmptySlotLongPress={onEmptySlotLongPress}
        onDeletePress={onDeletePress}
      />

      <MealSlot
        meal={dinnerMeal}
        dateKey={dateKey}
        mealType="dinner"
        mealPosition={slotIndex}
        isSelected={selectedMealId === dinnerMeal?.id}
        isMoveMode={isMoveMode}
        isPlanningMode={isPlanningMode}
        isMoveTarget={activeTargetKey === `${dateKey}-dinner-${slotIndex}`}
        onLongPress={onMealLongPress}
        onPress={onMealPress}
        onTargetPress={onTargetPress}
        onPlanTargetPress={onPlanTargetPress}
        onEmptySlotLongPress={onEmptySlotLongPress}
        onDeletePress={onDeletePress}
      />

      <View style={styles.plusColumn}>
        {showAddButton && (
          <Pressable
            onPress={() => onAddDayPress?.(dateKey)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.plus}>+</Text>
          </Pressable>
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
