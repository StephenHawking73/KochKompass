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
import Animated, { FadeIn, FadeOut, runOnJS } from "react-native-reanimated";
import WeekView from "@/components/screens/WeekView";
import MonthView from "@/components/screens/MonthView";

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

    const { meals, loading: loadingMeals } = useMeals(weekStart, weekEnd);
    const isUpdating = loadingMeals && meals.length === 0;

    const gesture = Gesture.Pan().activeOffsetX([-20, 20]).onEnd((event) => {
        if (event.translationX < -50) {
            runOnJS(goToNextWeek)();
        }

        if (event.translationX > 50) {
            runOnJS(goToPreviousWeek)();
        }
    })

    const [viewMode, setViewMode] = useState<"week" | "month">("week");
    console.log("VIEW MODE: ", viewMode);

    return (
        <SafeAreaView style={styles.container}>
            <GestureDetector gesture={gesture}>
                <View style={{flex: 1}}>
                    {/* Heading */}
                    <Text style={styles.title}>Speiseplan</Text>

                    {/* Week Selector */}
                    <AnimatedWeekSelector label={weekLabel} dateLabel={dateLabel} onPrev={goToPreviousWeek} onNext={goToNextWeek} onPressTitle={() => setViewMode(v => (v === "week" ? "month" : "week"))}/>

                    {/* Meals */}
                    {viewMode === "week" ? (
                        <WeekView meals={meals} loading={loadingMeals}/>
                    ) : (
                        <MonthView weekStart={weekStart} meals={meals}/>
                    )}
                </View>
            </GestureDetector>
        </SafeAreaView>
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