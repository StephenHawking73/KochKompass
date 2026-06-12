import { useTheme } from "@/hooks/useTheme";
import { ReactNode } from "react";
import { StyleSheet, View, Text } from "react-native";

type MealCardProps = {
    title: string;
    subtitle?: string,
    rightSlot?: ReactNode;
    onPress?: () => void;
};

export default function MealCard({ title }: MealCardProps) {

    const theme = useTheme();
    const styles = createStyles(theme);
    
    return (
        <View>
            <View style={styles.card}>
                <Text style={styles.title}>{title}</Text>
            </View>
        </View>
    )
}

const createStyles = (theme: any) => StyleSheet.create({
    card: {
        backgroundColor: theme.card.background,
        padding: 14,
        borderRadius: 12,
        marginTop: 10,
    },

    title: {
        color: theme.text.primary,
        opacity: 0.5,
        fontSize: 14,
        fontWeight: 500,
    }
})