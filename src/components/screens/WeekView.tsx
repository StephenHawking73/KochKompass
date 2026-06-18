import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MealCard from "@/components/MealCard";
import { RefreshControl } from "react-native-gesture-handler";
import { Meal } from "@/types/types";
import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";


const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default function WeekView({ meals, loading, onRefresh, refreshing }: any) {
    const theme = useTheme();
    const styles = createStyles(theme);


    if (loading) {
        return (
            <View style={{ marginTop: 10 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <MealCard key={i} title=" "/>
                ))}
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.dayColumn} />

                <View style={{alignItems: "center", justifyContent: "center", flex: 1, flexDirection: "row", gap: 10, }}>
                    {
                        icons.sun({color: theme.icons.sun})
                    }
                    <Text style={styles.headerText}>
                        Mittagessen
                    </Text>
                </View>

                <View style={{alignItems: "center", justifyContent: "center", flex: 1, flexDirection: "row", gap: 10, }}>
                    {
                        icons.moon({color: theme.icons.moon})
                    }
                    <Text style={styles.headerText}>
                        Abendessen
                    </Text>
                </View>

                <View style={styles.plusColumn} />
            </View>

            {weekDays.map((day) => (
                <View key={day} style={styles.row}>
                    <View style={styles.dayColumn}>
                        <Text style={styles.day}>
                            {day}
                        </Text>
                    </View>

                    {/* Morning */}
                    <View style={styles.mealSlot}>
                        
                    </View>

                    {/* Evening */}
                    <View style={styles.mealSlot}>

                    </View>

                    <Pressable style={styles.plusColumn}>
                        <Text style={styles.plus}>+</Text>
                    </Pressable>
                </View>
            ))}
        </ScrollView>
    );
}


        {/*<ScrollView 
            style={{ marginTop: 10, flex: 1 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
            }
        >
            {meals.length === 0 && (
                <Text>No meals found</Text>
            )}

            {meals.map((meal: Meal) => (
                <MealCard key={meal.id} title={meal.title} />
            ))}
        </ScrollView>*/}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        paddingHorizontal: 6,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        marginTop: 30,
    },

    headerText: {
        fontWeight: "600",
        color: theme.text.primary,
    },

    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },

    dayColumn: {
        width: 40,
        justifyContent: "center",
    },

    day: {
        fontSize: 18,
        fontWeight: "600",
        color: theme.text.primary,
    },

    mealSlot: {
        flex: 1,
        height: 80,
        backgroundColor: theme.card.background,
        borderColor: theme.card.border_op,
        borderWidth: 1,
        borderStyle: "dashed",
        borderRadius: 12,
        marginHorizontal: 4,
    },

    plusColumn: {
        width: 20,
        alignItems: "center",
        paddingLeft: 2,
    },

    plus: {
        fontSize: 24,
        color: theme.accent.primary,
    },
});