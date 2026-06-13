import { useTheme } from "@/hooks/useTheme";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";

type WeekSelectorProps = {
    label: string,
    dateLabel: string,
    onPrev: () => void;
    onNext: () => void;
};

export function WeekSelector({ label, dateLabel, onPrev, onNext }: WeekSelectorProps) {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.container}> 
            {/* Top Row */}
            <TouchableOpacity onPress={onPrev} style={styles.button}>
                <Feather name="chevron-left" size={24} color={theme.text.primary}/>
            </TouchableOpacity>

            <View style={styles.textContainer}>
                <Text style={styles.label}>{label}</Text>
                <Text style={[styles.dateLabel, {marginTop: 3}]}>{dateLabel}</Text>   
            </View>    

            <TouchableOpacity onPress={onNext} style={styles.button}>
                <Feather name="chevron-right" size={24} color={theme.text.primary}/>
            </TouchableOpacity>                   
        </View>
    )
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        marginTop: 20,
        gap: 12,
    },
    textContainer: {
        justifyContent: "center",
        padding: 8,
        alignItems: "center"
    },
    button: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: theme.card.background,
        borderWidth: 1,
        borderColor: theme.card.border,
    },
    label: {
        fontSize: 16,
        fontWeight: 600,
        color: theme.text.primary,
    },
    dateLabel: {
        fontSize: 13,
        color: theme.text.op,
    }
});