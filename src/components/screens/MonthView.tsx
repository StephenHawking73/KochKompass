import { View, Text } from "react-native";

export default function MonthView({ weekStart, meals }: any) {
    const days = generateMonthDays(weekStart);

    return (
        <View style={{ marginTop: 10 }}>
            {days.map((day, i) => (
                <View key={i} style={{ marginBottom: 12 }}>
                    <Text style={{ fontWeight: "600" }}>
                        {day.label}
                    </Text>

                    {meals
                        .filter((m: any) => isSameDay(m.date, day.date))
                        .map((meal: any) => (
                            <View
                                key={meal.id}
                                style={{
                                    padding: 8,
                                    marginTop: 4,
                                    borderRadius: 8,
                                    backgroundColor: "#eee",
                                }}
                            >
                                <Text>{meal.name}</Text>
                            </View>
                        ))}
                </View>
            ))}
        </View>
    );
}

function isSameDay(a: Date, b: Date) {
    const da = new Date(a);

    return (
        da.getFullYear() === b.getFullYear() &&
        da.getMonth() === b.getMonth() &&
        da.getDate() === b.getDate()
    );
}

function generateMonthDays(date: Date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);

    const days: { date: Date; label: string }[] = [];

    const month = start.getMonth();

    while (start.getMonth() === month) {
        days.push({
            date: new Date(start),
            label: start.toDateString().slice(0, 10),
        });

        start.setDate(start.getDate() + 1);
    }

    return days;
}