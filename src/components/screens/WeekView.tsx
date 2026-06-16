import { ScrollView, View } from "react-native";
import MealCard from "@/components/MealCard";
import { RefreshControl } from "react-native-gesture-handler";

export default function WeekView({ meals, loading, onRefresh, refreshing }: any) {
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
        <ScrollView 
            style={{ marginTop: 10, flex: 1 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
            }
        >
            {meals.map((meal: any) => (
                <MealCard key={meal.id} title={meal.title} />
            ))}
        </ScrollView>
    );
}