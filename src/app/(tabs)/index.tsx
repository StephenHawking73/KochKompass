import { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { FadeIn, FadeOut, runOnJS } from "react-native-reanimated";

import WeekView from "@/components/screens/WeekView";
import MonthView from "@/components/screens/MonthView";
import { AnimatedWeekSelector } from "@/components/weekSelector/AnimatedWeekSelector";
import { useMeals } from "@/hooks/useMeals";
import { useTheme } from "@/hooks/useTheme";
import { useWeekNavigation } from "@/hooks/useWeekNavigation";
import { supabase } from "@/lib/supabase";

export default function HomeScreen() {
    const theme = useTheme();
    const styles = createStyles(theme);

    const [viewMode, setViewMode] = useState<"week" | "month">("week");
    const [refreshing, setRefreshing] = useState(false);

    const {
        weekStart,
        weekEnd,
        weekLabel,
        dateLabel,
        monthStart,
        monthEnd,
        monthLabel,
        monthDateLabel,
        goToNextWeek,
        goToPreviousWeek,
        goToNextMonth,
        goToPreviousMonth,
        setWeekByDate,
    } = useWeekNavigation();

    const rangeStart = viewMode === "week" ? weekStart : monthStart;
    const rangeEnd = viewMode === "week" ? weekEnd : monthEnd;

    const { meals, loading: loadingMeals, refresh } = useMeals(rangeStart, rangeEnd);

    const onRefresh = async () => {
        setRefreshing(true);

        try {
            await refresh();
        } finally {
            setRefreshing(false);
        }
    }

    {/* DEBUG */}
    useEffect(() => {
        async function login() {
            const { data, error } =
                await supabase.auth.signInWithPassword({
                    email: "dev@dev.com",
                    password: "KochKompass",
                });

            if (error) {
                console.log(error);
            } 
        }
        login();
    }, []);

    const gesture = Gesture.Pan()
        .activeOffsetX([-20, 20])
        .failOffsetY([-10, 10])
        .onEnd((event) => {
            if (event.translationX < -50) {
                runOnJS(viewMode === "week" ? goToNextWeek : goToNextMonth)();
            }

            if (event.translationX > 50) {
                runOnJS(viewMode === "week" ? goToPreviousWeek : goToPreviousMonth)();
            }
        });

    const selectorLabel = viewMode === "week" ? weekLabel : monthLabel;
    const selectorDateLabel = viewMode === "week" ? dateLabel : monthDateLabel;

    return (
        <SafeAreaView style={styles.container}>
            <GestureDetector gesture={gesture}>
                <View style={styles.content}>
                    <Text style={styles.title}>Speiseplan</Text>

                    <AnimatedWeekSelector
                        label={selectorLabel}
                        dateLabel={selectorDateLabel}
                        onPrev={viewMode === "week" ? goToPreviousWeek : goToPreviousMonth}
                        onNext={viewMode === "week" ? goToNextWeek : goToNextMonth}
                        onPressTitle={() => setViewMode((v) => (v === "week" ? "month" : "week"))}
                    />

                    <Animated.View
                        key={viewMode}
                        style={styles.viewContainer}
                        entering={FadeIn.duration(180)}
                        exiting={FadeOut.duration(160)}
                    >
                        {viewMode === "week" ? (
                            <WeekView meals={meals} weekStart={weekStart} refreshing={refreshing} onRefresh={onRefresh} />
                        ) : (
                            <MonthView referenceDate={rangeStart} meals={meals} refreshing={refreshing} onRefresh={onRefresh} onSelectDay={(date) => {
                                setWeekByDate(date);
                                requestAnimationFrame(() => {
                                    setViewMode("week");
                                })
                            }}/>
                        )}
                    </Animated.View>
                </View>
            </GestureDetector>
        </SafeAreaView>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.background,
            paddingHorizontal: 30,
        },
        content: {
            flex: 1,
        },
        title: {
            fontSize: 30,
            fontWeight: "700",
            color: theme.text.primary,
            marginTop: 20,
        },
        viewContainer: {
            flex: 1,
        },
    });