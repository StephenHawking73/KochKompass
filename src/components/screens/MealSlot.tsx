import { View, StyleSheet } from "react-native";
import MealCard from "@/components/MealCard";
import { Meal } from "@/types/types";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";

interface MealSlotProps {
  meal?: Meal;
  isSelected: boolean;
  isMoveMode: boolean;
  onLongPress: (mealId: string) => void;
  onPress: (mealId: string) => void;
}

export default function MealSlot({
  meal,
  isSelected,
  isMoveMode,
  onLongPress,
  onPress,
}: MealSlotProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (!meal) {
    return <View style={[styles.slot, isMoveMode && styles.targetSlot]} />;
  }

  const handlePress = () => {
    if (isSelected) {
      onPress(meal.id);
      return;
    }

    if (isMoveMode) {
      // Verschieben wird später implementiert
      return;
    }

    // Navigiere zur Rezept-Seite
    router.push({
      pathname: "/recipe/[id]",
      params: { id: meal.recipe_id },
    });
  };

  return (
    <View style={[styles.slot, isMoveMode && styles.targetSlot]}>
      <MealCard
        title={meal.title}
        image_url={meal.image_url}
        selected={isSelected}
        onLongPress={() => onLongPress(meal.id)}
        onPress={handlePress}
      />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
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
  });
