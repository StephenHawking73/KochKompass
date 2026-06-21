import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import MealCard from "@/components/MealCard";
import { Meal } from "@/types/types";
import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";
import { useMemo } from "react";

type MealType = "lunch" | "dinner";

export default function WeekView({
    meals = [],
    weekStart,
}: any) {

    const theme = useTheme();
    const styles = createStyles(theme);

    // -----------------------------
    // Woche erzeugen
    // -----------------------------
    const getWeekDays = (startDate: Date) => {
        const labels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(startDate);
            d.setDate(d.getDate() + i);

            return {
                date: d,
                label: labels[i],
            };
        });
    };

    const formatDate = (date: Date) => {
        return (
            date.getFullYear() +
            "-" +
            String(date.getMonth() + 1).padStart(2, "0") +
            "-" +
            String(date.getDate()).padStart(2, "0")
        );
    };

    const weekDays = getWeekDays(weekStart);

    // -----------------------------
    // Slots: date -> type -> list (stacked slots)
    // -----------------------------
    const slots = useMemo(() => {
        const map = new Map<string, Map<MealType, Meal[]>>();

        for (const meal of meals ?? []) {
            const dateKey = meal.planned_date;
            const type = meal.meal_type as MealType;

            if (!map.has(dateKey)) {
                map.set(dateKey, new Map());
            }

            const dayMap = map.get(dateKey)!;

            if (!dayMap.has(type)) {
                dayMap.set(type, []);
            }

            dayMap.get(type)!.push(meal);
        }

        // Sortierung innerhalb eines Slots nach position
        map.forEach((typeMap) => {
            typeMap.forEach((list) => {
                list.sort((a, b) => a.meal_position - b.meal_position);
            });
        });

        return map;
    }, [meals]);

    // -----------------------------
    // Slot Renderer
    // -----------------------------
    const renderSlotRow = (
        dateKey: string,
        index: number,
        lunchSlots: Meal[],
        dinnerSlots: Meal[],
        label: string,
    ) => {
        const lunch = lunchSlots[index];
        const dinner = dinnerSlots[index];

        return (
            <View key={`${dateKey}-${index}`} style={styles.row}>
                <View style={styles.dayColumn}>
                    {index === 0 && (
                        <Text style={styles.day}>
                            {label}
                        </Text>
                    )}
                </View>

                <View style={styles.mealSlot}>
                    {lunch ? <MealCard title={lunch.title} /> : null}
                </View>

                <View style={styles.mealSlot}>
                    {dinner ? <MealCard title={dinner.title} /> : null}
                </View>

                <View style={styles.plusColumn}>
                    {index === 0 && (
                        <Text style={styles.plus}>+</Text>
                    )}
                </View>
            </View>
        );
    };

    // -----------------------------
    // Render
    // -----------------------------
    return (
        <ScrollView
            style={styles.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Platform.OS === "android" ? 120 : 80 }}
        >
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.dayColumn} />

                <View style={styles.headerCenter}>
                    {icons.sun({ color: theme.icons.sun })}
                    <Text style={styles.headerText}>Mittagessen</Text>
                </View>

                <View style={styles.headerCenter}>
                    {icons.moon({ color: theme.icons.moon })}
                    <Text style={styles.headerText}>Abendessen</Text>
                </View>

                <View style={styles.plusColumn} />
            </View>

            {/* Week */}
            {weekDays.map(({ date, label }) => {
                const dateKey = formatDate(date);

                const lunchSlots =
                    slots.get(dateKey)?.get("lunch") ?? [];

                const dinnerSlots =
                    slots.get(dateKey)?.get("dinner") ?? [];

                const maxRows = Math.max(
                    lunchSlots.length,
                    dinnerSlots.length,
                    1
                );

                return (
                    <View key={dateKey}>
                        {Array.from({ length: maxRows }).map((_, i) =>
                            renderSlotRow(
                                dateKey,
                                i,
                                lunchSlots,
                                dinnerSlots,
                                label,
                            )
                        )}
                    </View>
                );
            })}
        </ScrollView>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        container: {
            paddingHorizontal: 6,
        },

        header: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
            marginTop: 30,
        },

        headerCenter: {
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 10,
        },

        headerText: {
            fontWeight: "600",
            color: theme.text.primary,
        },

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

        mealSlot: {
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
            position: "relative",
        },

        plusColumn: {
            width: 20,
            alignItems: "center",
        },

        plus: {
            fontSize: 24,
            color: theme.accent.primary,
        },
    });