import { WeekSelector } from "./weekSelector";

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    runOnJS,
} from "react-native-reanimated";

import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

type Props = {
    label: string;
    dateLabel: string;
    onPrev: () => void;
    onNext: () => void;
    onPressTitle: () => void;
};

export function AnimatedWeekSelector({
    label,
    dateLabel,
    onPrev,
    onNext,
    onPressTitle,
}: Props) {
    const theme = useTheme();
    const styles = createStyles(theme);

    const translateX = useSharedValue(0);

    const animateNextWeek = () => {
        translateX.value = withTiming(-30, { duration: 100 });

        setTimeout(() => {
            onNext();

            translateX.value = 30;

            translateX.value = withTiming(0, {
                duration: 200,
            });
        }, 100);
    };

    const animatePreviousWeek = () => {
        translateX.value = withTiming(30, { duration: 100 });

        setTimeout(() => {
            onPrev();

            translateX.value = -30;

            translateX.value = withTiming(0, {
                duration: 200,
            });
        }, 100);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: translateX.value,
            },
        ],
        opacity: 1 - Math.abs(translateX.value) / 50,
    }));

    return (
        <View>
            <WeekSelector
                label={label}
                dateLabel={dateLabel}
                onPrev={animatePreviousWeek}
                onNext={animateNextWeek}
                onPressTitle={onPressTitle}
            >
                <Animated.View style={animatedStyle}>
                    <Text style={styles.label}>
                        {label}
                    </Text>

                    <Text style={styles.dateLabel}>
                        {dateLabel}
                    </Text>
                </Animated.View>
            </WeekSelector>
        </View>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        label: {
            fontSize: 22,
            fontWeight: "700",
            color: theme.text.primary,
        },

        dateLabel: {
            fontSize: 14,
            marginTop: 2,
            color: theme.text.op,
        },
    });