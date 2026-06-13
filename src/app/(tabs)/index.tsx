import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useMeals } from "@/hooks/useMeals";
import { LoadingScreen } from "@/components/loadingScreen";
import MealCard from "@/components/MealCard";
import { Key, useState } from "react";
import { useWeekNavigation } from "@/hooks/useWeekNavigation";
import { AnimatedWeekSelector } from "@/components/weekSelector/AnimatedWeekSelector";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

export default function HomeScreen() {
    const theme = useTheme();
    const styles = createStyles(theme);

    const {
        weekStart,
        weekEnd,
        weekLabel,
        dateLabel,
        goToNextWeek,
        goToPreviousWeek,
    } = useWeekNavigation();

    const { meals, loading: loadingMeals } = useMeals(weekStart, weekEnd) ?? { meals: [], loading: true };

    const gesture = Gesture.Pan().onEnd((event) => {
        if (event.translationX < -50) {
            runOnJS(goToNextWeek)();
        }

        if (event.translationX > 50) {
            runOnJS(goToPreviousWeek)();
        }
    })

    if (loadingMeals) {
        return <LoadingScreen text="Lade Meals..."/>
    }

    return (
        <GestureDetector gesture={gesture}>
            <SafeAreaView style={styles.container}>
                {/* Heading */}
                <Text style={styles.title}>Speiseplan</Text>

                {/* Week Selector */}
                <AnimatedWeekSelector label={weekLabel} dateLabel={dateLabel} onPrev={goToPreviousWeek} onNext={goToNextWeek}/>

                {/* Meals */}
                <View style={{marginTop: 10}}>
                    {meals.map((meal: { id: Key; name: string; }) => (
                        <MealCard key={meal.id} title={meal.name}/>
                    ))}
                </View>
            </SafeAreaView>
        </GestureDetector>
    )
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 30,
        fontWeight: 700,
        color: theme.text.primary,
        marginTop: 20,
    },
});