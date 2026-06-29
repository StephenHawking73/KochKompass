import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type infoCardProps = {
    title: string;
    icon?: React.ReactNode;
}

export default function InfoCard({
    title,
    icon
}: infoCardProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.card}>
            {icon && (
                <View>
                    {icon}
                </View>
            )}

            <Text style={styles.title}>{title}</Text>
        </View>
    );  
};

const createStyles = (theme: any) => StyleSheet.create({
    card: {
        backgroundColor: theme.card.background,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,

        padding: 14,
        height: 50,
        width: "auto",

        alignSelf: "flex-start",

        borderRadius: 13,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 4,
        shadowOpacity: 0.08,
        elevation: 3,
    },

    title: {
        color: theme.text.primary,
        fontSize: 15,
        fontWeight: "400",
    }
})