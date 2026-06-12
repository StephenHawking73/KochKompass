import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export default function HomeScreen() {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Home</Text>
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
        fontSize: 24,
        fontWeight: "700",
        color: theme.text.primary,
        marginTop: 20,
    },
});