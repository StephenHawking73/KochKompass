import { useTheme } from "@/hooks/useTheme";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";

type WeekSelectorProps = {
    label: string,
    dateLabel: string,
    onPrev: () => void;
    onNext: () => void;
    children?: React.ReactNode;
    onPressTitle: () => void;
};

export function WeekSelector({ label, dateLabel, onPrev, onNext, onPressTitle  }: WeekSelectorProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.container}> 
            {/* Left */}
            <View style={styles.sideButtonWrapper}>
                <TouchableOpacity onPress={onPrev} style={styles.button}>
                    <Feather name="chevron-left" size={24} color={theme.text.primary}/>
                </TouchableOpacity>
            </View>

            {/* Center */}
            <TouchableOpacity onPress={onPressTitle} style={styles.center}>
                <Text style={styles.label} numberOfLines={1}>{label}</Text>
                <Text style={styles.dateLabel} numberOfLines={1}>{dateLabel}</Text>   
            </TouchableOpacity>    

            {/* Right */}
            <View style={styles.sideButtonWrapper}>
                <TouchableOpacity onPress={onNext} style={styles.button}>
                    <Feather name="chevron-right" size={24} color={theme.text.primary}/>
                </TouchableOpacity>
            </View>                   
        </View>
    )
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",

        marginTop: 20,
        width: "100%",
    },

    sideButtonWrapper: {
        justifyContent: "center",
        alignItems: "center",
    },

    button: {
        width: 44,
        height: 44,
        borderRadius: 10,

        backgroundColor: theme.card.background,
        borderWidth: 1,
        borderColor: theme.card.border,

        justifyContent: "center",
        alignItems: "center",
    },

    center: {
        flex: 1,
        justifyContent: "center",

        alignItems: "flex-start",

        paddingHorizontal: 8,
        minWidth: 0,
    },

    label: {
        fontSize: 16,
        fontWeight: 600,
        color: theme.text.primary,
    },

    dateLabel: {
        fontSize: 13,
        marginTop: 2,
        color: theme.text.op,
    }
});