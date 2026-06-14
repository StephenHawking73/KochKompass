import React, { useMemo } from "react";
import { ScrollView, View, Text, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import type { Meal } from "@/types/meal";

type DayItem = {
    date: Date;
    isCurrentMonth: boolean;
};

type Props = {
    referenceDate: Date | string;
    meals: Meal[];
};

export default function MonthView({
    referenceDate,
    meals,
}: Props) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const safe = safeDate(referenceDate);

    const today = useMemo(() => {
        const d = new Date();

        return normalizeDate(d).getTime();
    }, []);

    if (!safe) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                    Kalender laden...
                </Text>
            </View>
        );
    }

    const { days } = generateCalendarGrid(safe);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Wochentage */}

            <View style={styles.weekRow}>
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(
                    (day) => (
                        <View
                            key={day}
                            style={styles.weekLabelCell}
                        >
                            <Text style={styles.weekLabel}>{day}</Text>
                        </View>
                    )
                )}
            </View>

            {/* Kalender */}

            <View style={styles.grid}>
                {days.map((day: DayItem, index) => {
                    const key =
                        day.date.getFullYear() +
                        "-" +
                        day.date.getMonth() +
                        "-" +
                        day.date.getDate();

                    const isToday = normalizeDate(day.date).getTime() === today;

                    const dayMeals = meals.filter((meal) =>
                        isSameDay(meal.date ?? meal.planned_date ?? "", day.date)
                    );

                    const visibleMeals =
                        dayMeals.slice(0, 3);

                    const hiddenCount =
                        dayMeals.length -
                        visibleMeals.length;

                    return (
                        <View
                            key={key}
                            style={styles.cell}
                        >
                            {/* Tagesnummer */}

                            <View
                                style={
                                    styles.dayHeader
                                }
                            >
                                {isToday ? (
                                    <View
                                        style={
                                            styles.todayBadge
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.todayText
                                            }
                                        >
                                            {day.date.getDate()}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text
                                        style={[
                                            styles.dayNumber,
                                            !day.isCurrentMonth &&
                                                styles.outsideText,
                                        ]}
                                    >
                                        {day.date.getDate()}
                                    </Text>
                                )}
                            </View>

                            {/* Meals */}

                            <View
                                style={
                                    styles.mealsContainer
                                }
                            >
                                {visibleMeals.map(
                                    (meal) => (
                                        <View
                                            key={
                                                meal.id
                                            }
                                            style={
                                                styles.mealRow
                                            }
                                        >
                                            <View
                                                style={
                                                    styles.mealDot
                                                }
                                            />

                                            <Text
                                                numberOfLines={
                                                    2
                                                }
                                                style={[
                                                    styles.mealText,
                                                    !day.isCurrentMonth &&
                                                        styles.outsideMealText,
                                                ]}
                                            >
                                                {
                                                    meal.name
                                                }
                                            </Text>
                                        </View>
                                    )
                                )}

                                {hiddenCount >
                                    0 && (
                                    <Text
                                        style={
                                            styles.moreMeals
                                        }
                                    >
                                        +
                                        {
                                            hiddenCount
                                        }
                                    </Text>
                                )}
                            </View>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
}

const H_PADDING = 18;
const SCREEN_WIDTH = Dimensions.get("window").width;
const INNER_WIDTH = SCREEN_WIDTH - H_PADDING * 2;
const CELL_SIZE = INNER_WIDTH / 7;

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            marginHorizontal: -30,
        },

        content: {
            paddingTop: 8,
            paddingBottom: 24,
            paddingHorizontal: H_PADDING,
        },

        loadingContainer: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
        },

        loadingText: {
            color: theme.text.op,
        },

        weekRow: {
            flexDirection: "row",
            marginBottom: 4,
            marginTop: 20,
            backgroundColor: theme.background,
            paddingBottom: 6,
            zIndex: 10,
            width: "100%",
        },

        weekLabelCell: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
        },

        weekLabel: {
            fontSize: 13,
            fontWeight: "700",
            color: theme.text.op,
            paddingVertical: 10,
            width: "100%",
            textAlign: "center",
            includeFontPadding: false,
        },

        grid: {
            flexDirection: "row",
            flexWrap: "wrap",
            width: "100%",
        },

        cell: {
            width: CELL_SIZE,
            aspectRatio: 1.42,
            minHeight: 126,

            paddingTop: 8,
            paddingHorizontal: 3,

            borderRightWidth:
                StyleSheet.hairlineWidth,
            borderBottomWidth:
                StyleSheet.hairlineWidth,

            borderColor:
                theme.name === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.08)",
        },

        dayHeader: {
            alignItems: "flex-end",
            marginBottom: 6,
        },

        dayNumber: {
            fontSize: 14,
            fontWeight: "600",
            color: theme.text.primary,
        },

        outsideText: {
            opacity: 0.3,
        },

        todayBadge: {
            width: 24,
            height: 24,
            borderRadius: 12,

            backgroundColor:
                theme.accent.primary,

            justifyContent: "center",
            alignItems: "center",
        },

        todayText: {
            color: "#fff",
            fontSize: 12,
            fontWeight: "700",
        },

        mealsContainer: {
            flex: 1,
        },

        mealRow: {
            flexDirection: "row",
            alignItems: "flex-start",
            marginTop: 4,
            paddingVertical: 5,
            paddingHorizontal: 4,
            borderRadius: 8,
            width: "100%",
            backgroundColor:
                theme.name === "dark"
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.05)",
        },

        mealDot: {
            width: 5,
            height: 5,
            borderRadius: 999,
            backgroundColor: theme.accent.primary,
            marginRight: 5,
            marginTop: 4,
            flexShrink: 0,
        },

        mealText: {
            flex: 1,
            fontSize: 9.5,
            lineHeight: 12,
            fontWeight: "600",
            color: theme.text.primary,
            paddingRight: 2,
        },

        outsideMealText: {
            opacity: 0.45,
        },

        moreMeals: {
            marginTop: 5,
            marginLeft: 0,

            fontSize: 11,
            fontWeight: "700",

            color: theme.text.op,
        },
    });


function normalizeDate(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function generateCalendarGrid(
    reference: Date
) {
    const year = reference.getFullYear();
    const month = reference.getMonth();

    const firstDay = new Date(year, month, 1);

    const startWeekday =
        (firstDay.getDay() + 6) % 7;

    const daysInMonth = new Date(
        year,
        month + 1,
        0
    ).getDate();

    const days: DayItem[] = [];

    for (let i = startWeekday; i > 0; i--) {
        days.push({
            date: new Date(year, month, 1 - i),
            isCurrentMonth: false,
        });
    }

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {
        days.push({
            date: new Date(year, month, day),
            isCurrentMonth: true,
        });
    }

    const totalCells = Math.ceil(days.length / 7) * 7;

    while (days.length < totalCells) {
        const nextDay =
            days.length -
            (startWeekday + daysInMonth) +
            1;

        days.push({
            date: new Date(
                year,
                month + 1,
                nextDay
            ),
            isCurrentMonth: false,
        });
    }

    return { days };
}

function isSameDay(
    a: string | Date,
    b: Date
) {
    const da = normalizeDate(new Date(a));
    const db = normalizeDate(b);

    return da.getTime() === db.getTime();
}

function safeDate(input: any) {
    const date = new Date(input);

    return isNaN(date.getTime())
        ? null
        : date;
}