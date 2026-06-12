import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useMeals } from "@/hooks/useMeals";
import { LoadingScreen } from "@/components/loadingScreen";
import MealCard from "@/components/MealCard";

export default function HomeScreen() {
    const theme = useTheme();
    const styles = createStyles(theme);

    const { meals, loading: loadingMeals } = useMeals();

    if (loadingMeals) {
        return <LoadingScreen text="Lade Meals..."/>
    }

    console.log(loadingMeals);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Home</Text>

            {meals.map((meal) => (
                <MealCard key={meal.id} title={meal.name}/>
            ))}
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
        fontSize: 27,
        fontWeight: 700,
        color: theme.text.primary,
        marginTop: 20,
    },
});