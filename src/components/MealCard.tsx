import { useTheme } from "@/hooks/useTheme";
import { ReactNode } from "react";
import { StyleSheet, View, Text, Pressable } from "react-native";

type MealCardProps = {
    title: string;
    subtitle?: string;
    rightSlot?: ReactNode;
    onPress?: () => void;
    loading?: boolean;
};

export default function MealCard({
    title,
    onPress,
}: MealCardProps) {

    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <Pressable onPress={onPress} style={styles.card}>
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>
            </View>
        </Pressable>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({

        card: {
            position: "absolute",

            top: -4,
            bottom: -4,
            left: -4,
            right: -4,

            backgroundColor: theme.card.background,

            borderRadius: 16,

            paddingHorizontal: 12,
            paddingVertical: 10,

            // subtiler Rahmen statt harter Box
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.06)",

            // moderner Soft-Shadow (iOS-like)
            shadowColor: "#5E5D5D",
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },

            // Android
            elevation: 2,

            justifyContent: "center",
        },

        content: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
        },

        title: {
            flex: 1,
            color: theme.text.primary,
            fontSize: 13.5,
            fontWeight: "500",
            letterSpacing: 0.2,
        },
    });