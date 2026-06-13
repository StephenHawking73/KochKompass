import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export default function MonthView({ referenceDate, meals }: any) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const safe = safeDate(referenceDate);

    if (!safe) {
        return (
            <View>
                <Text>Kalender laden...</Text>
            </View>
        )
    }
    
    const date = new Date(referenceDate);
    const { days } = generateCalendarGrid(date);

    return (
        <View style={styles.container}>
            {/* Week Header */}
            <View style={styles.weekRow}>
                {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((d) => (
                    <Text key={d} style={styles.weekLabel}>
                        {d}
                    </Text>
                ))}
            </View>

            {/* Grid */}
            <View style={styles.grid}>
                {days.map((day, i) => {
                    const isCurrentMonth = day?.isCurrentMonth;

                    return (
                        <View
                            key={i}
                            style={[
                                styles.cell,
                                !isCurrentMonth && styles.outsideCell,
                            ]}
                        >
                            {day && (
                                <>
                                    <Text
                                        style={[
                                            styles.dayNumber,
                                            !isCurrentMonth &&
                                                styles.outsideText,
                                        ]}
                                    >
                                        {day.date.getDate()}
                                    </Text>

                                    {meals
                                        .filter((m: any) =>
                                            isSameDay(m.date, day.date)
                                        )
                                        .slice(0, 2)
                                        .map((meal: any) => (
                                            <View
                                                key={meal.id}
                                                style={styles.mealChip}
                                            >
                                                <Text
                                                    numberOfLines={1}
                                                    style={styles.mealText}
                                                >
                                                    {meal.name}
                                                </Text>
                                            </View>
                                        ))}
                                </>
                            )}
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
            marginTop: 10,
        },

        weekRow: {
            flexDirection: "row",
            paddingBottom: 8,
        },

        weekLabel: {
            flex: 1,
            textAlign: "center",
            fontSize: 12,
            color: theme.text.op,
            fontWeight: "600",
        },

        grid: {
            flex: 1,
            flexDirection: "row",
            flexWrap: "wrap",
        },

        cell: {
            width: "14.285%",
            aspectRatio: 0.95,

            padding: 6,

            borderWidth: 1,
            borderColor: theme.card.border,
            backgroundColor: theme.card.background,
        },

        outsideCell: {
            backgroundColor:
                theme.name === "dark"
                    ? "#0f131a"
                    : "#f2f3f5",
        },

        dayNumber: {
            fontSize: 12,
            fontWeight: "600",
            color: theme.text.primary,
        },

        outsideText: {
            color: theme.text.op,
        },

        mealChip: {
            marginTop: 3,
            paddingHorizontal: 4,
            paddingVertical: 2,
            borderRadius: 6,
            backgroundColor: theme.accent.op,
        },

        mealText: {
            fontSize: 10,
            color: theme.text.primary,
        },
});

function generateCalendarGrid(reference: Date) {
    const year = reference.getFullYear();
    const month = reference.getMonth();

    const firstDay = new Date(year, month, 1);
    const startWeekday = (firstDay.getDay() + 6) % 7;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: any[] = [];

    // prev month
    for (let i = startWeekday; i > 0; i--) {
        const d = new Date(year, month, 1 - i);
        days.push({ date: d, isCurrentMonth: false });
    }

    // current month
    for (let d = 1; d <= daysInMonth; d++) {
        days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }

    // next month fill up to 42 cells
    while (days.length < 42) {
        const nextDay = days.length - (startWeekday + daysInMonth) + 1;
        days.push({
            date: new Date(year, month + 1, nextDay),
            isCurrentMonth: false,
        });
    }

    return { days };
}

function isSameDay(a: string | Date, b: Date) {
    const da = new Date(a);

    return (
        da.getFullYear() === b.getFullYear() &&
        da.getMonth() === b.getMonth() &&
        da.getDate() === b.getDate()
    );
}

function safeDate(input: any) {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
}