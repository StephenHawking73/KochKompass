import { View, StyleSheet, Pressable, Animated } from "react-native";
import MealCard from "@/components/MealCard";
import { Meal } from "@/types/types";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import * as Haptics from "expo-haptics";

interface MealSlotProps {
  meal?: Meal;

  dateKey: string;
  mealType: "lunch" | "dinner";
  mealPosition: number;

  isSelected: boolean;
  isMoveMode: boolean;
  isPlanningMode: boolean;
  isMoveTarget?: boolean;
  onLongPress: (mealId: string) => void;
  onPress: (mealId: string) => void;
  onTargetPress?: (dateKey: string, mealType: "lunch" | "dinner", mealPosition: number) => void;
  onPlanTargetPress?: (dateKey: string, mealType: "lunch" | "dinner", mealPosition: number) => void;
  onEmptySlotLongPress?: (dateKey: string, mealType: "lunch" | "dinner", mealPosition: number) => void;
  onDeletePress?: (meal: Meal) => void;
}

export default function MealSlot({
  meal,
  dateKey,
  mealType,
  mealPosition,
  isSelected,
  isMoveMode,
  isPlanningMode,
  isMoveTarget = false,
  onLongPress,
  onPress,
  onTargetPress,
  onPlanTargetPress,
  onEmptySlotLongPress,
  onDeletePress,
}: MealSlotProps) {
  const theme = useTheme();
  const styles = createStyles(theme);
  const pulse = useRef(new Animated.Value(1)).current;
  const isTargetMode = isMoveMode || isPlanningMode;

  useEffect(() => {
    if (!isMoveTarget) {
      Animated.timing(pulse, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1.03,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 1,
        duration: 140,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isMoveTarget, pulse]);

  if (!meal) {
    return (
      <Animated.View style={[styles.slotWrapper, isMoveTarget && styles.movePulse, { transform: [{ scale: pulse }] }]}> 
        <Pressable
            style={[styles.slot, isTargetMode && styles.targetSlot]}
            onPress={() => {
                if (isMoveMode) {
                    onTargetPress?.(dateKey, mealType, mealPosition);
                }

                if (isPlanningMode) {
                    onPlanTargetPress?.(dateKey, mealType, mealPosition);
                }
            }}
            onLongPress={async () => {
                if (isTargetMode) {
                    return;
                }

                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onEmptySlotLongPress?.(dateKey, mealType, mealPosition);
            }}
            delayLongPress={180}
        />
      </Animated.View>
    );
}

  const handlePress = () => {
    if (isSelected) {
      onPress(meal.id);
      return;
    }

    if (isMoveMode) {
      onTargetPress?.(dateKey, mealType, mealPosition);
      return;
    }

    if (isPlanningMode) {
      return;
    }

    // Navigiere zur Rezept-Seite
    router.push({
      pathname: "/recipe/[id]",
      params: { id: meal.recipe_id },
    });
  };

  return (
    <Animated.View style={[styles.slotWrapper, isMoveTarget && styles.movePulse, { transform: [{ scale: pulse }] }]}> 
      <View style={[styles.slot, isTargetMode && styles.targetSlot]}>
        <MealCard
          title={meal.title}
          image_url={meal.image_url}
          selected={isSelected}
          onLongPress={() => {
            if (!isPlanningMode) {
              onLongPress(meal.id);
            }
          }}
          onPress={handlePress}
          onDoublePress={() => {
            if (!isMoveMode && !isPlanningMode) {
              onDeletePress?.(meal);
            }
          }}
        />
      </View>
    </Animated.View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    slotWrapper: {
      flex: 1,
      minHeight: 80,
      marginHorizontal: 4,
    },
    slot: {
      flex: 1,
      minHeight: 80,
      backgroundColor: theme.slot.background,
      borderColor: theme.slot.border_op,
      borderWidth: 1,
      borderStyle: "dashed",
      borderRadius: 12,
      marginHorizontal: 4,
      justifyContent: "center",
      overflow: "visible",
    },
    targetSlot: {
      borderColor: theme.accent.primary,
      borderWidth: 1.1,
      borderStyle: "solid",
    },
    movePulse: {
      shadowColor: theme.accent.primary,
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
  });
