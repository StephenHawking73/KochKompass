import { View } from "react-native";
import MealCard from "@/components/MealCard";

export default function WeekView({ meals, loading }: any) {
    if (loading) {
        return (
            <View style={{ marginTop: 10 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <MealCard key={i} title=" " loading />
                ))}
            </View>
        );
    }

    return (
        <View style={{ marginTop: 10 }}>
            {meals.map((meal: any) => (
                <MealCard key={meal.id} title={meal.title} />
            ))}
        </View>
    );
}