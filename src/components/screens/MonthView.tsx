import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

type Meal = {
    id: string;
    name: string;
    date: string | Date;
};

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

        return (
            d.getFullYear() +
            "-" +
            d.getMonth() +
            "-" +
            d.getDate()
        );
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
        <View style={styles.container}>
            {/* Wochentage */}

            <View style={styles.weekRow}>
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(
                    (day) => (
                        <Text
                            key={day}
                            style={styles.weekLabel}
                        >
                            {day}
                        </Text>
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

                    const isToday = key === today;

                    const dayMeals = meals.filter((meal) =>
                        isSameDay(meal.date, day.date)
                    );

                    const visibleMeals =
                        dayMeals.slice(0, 3);

                    const hiddenCount =
                        dayMeals.length -
                        visibleMeals.length;

                    return (
                        <View
                            key={index}
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
                                                    1
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
        </View>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
            marginTop: 8,
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
        },

        weekLabel: {
            flex: 1,
            textAlign: "center",
            fontSize: 12,
            fontWeight: "600",
            color: theme.text.op,
            paddingVertical: 8,
        },

        grid: {
            flexDirection: "row",
            flexWrap: "wrap",
        },

        cell: {
            width: "14.285%",
            aspectRatio: 0.72,

            paddingTop: 4,
            paddingHorizontal: 4,

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
            marginBottom: 4,
        },

        dayNumber: {
            fontSize: 13,
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
            alignItems: "center",
            marginTop: 3,
        },

        mealDot: {
            width: 5,
            height: 5,
            borderRadius: 999,

            backgroundColor:
                theme.accent.primary,

            marginRight: 4,
        },

        mealText: {
            flex: 1,
            fontSize: 9,
            color: theme.text.primary,
        },

        outsideMealText: {
            opacity: 0.4,
        },

        moreMeals: {
            marginTop: 2,
            marginLeft: 9,

            fontSize: 9,
            fontWeight: "600",

            color: theme.text.op,
        },
    });

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

    while (days.length < 42) {
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
    const da = new Date(a);

    return (
        da.getFullYear() ===
            b.getFullYear() &&
        da.getMonth() === b.getMonth() &&
        da.getDate() === b.getDate()
    );
}

function safeDate(input: any) {
    const date = new Date(input);

    return isNaN(date.getTime())
        ? null
        : date;
}