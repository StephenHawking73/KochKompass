import React, { memo } from "react";
import {
    Pressable,
    Text,
    View,
    StyleSheet,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withRepeat,
    withSequence,
} from "react-native-reanimated";

const AnimatedPressable =
    Animated.createAnimatedComponent(
        Pressable
    );

export default memo(function MonthDay({
    day,
    meals,
    isToday,
    isCurrentMonth,
    theme,
    onPress,
}: any) {
    const scale = useSharedValue(
        isToday ? 1.05 : 1
    );

    React.useEffect(() => {
        if (isToday) {
            scale.value = withRepeat(
                withSequence(
                    withSpring(1.08),
                    withSpring(1.03)
                ),
                -1,
                true
            );
        }
    }, []);

    const animatedStyle =
        useAnimatedStyle(() => ({
            transform: [
                {
                    scale: scale.value,
                },
            ],
        }));

    return (
        <AnimatedPressable
            style={[
                styles.cell,
                animatedStyle,
            ]}
            onPress={() => onPress(day)}
            onPressIn={() => {
                scale.value =
                    withSpring(0.95);
            }}
            onPressOut={() => {
                scale.value =
                    withSpring(
                        isToday
                            ? 1.05
                            : 1
                    );
            }}
        >
            <View
                style={
                    styles.dayHeader
                }
            >
                {isToday ? (
                    <View
                        style={[
                            styles.todayBadge,
                            {
                                backgroundColor:
                                    theme
                                        .accent
                                        .primary,
                            },
                        ]}
                    >
                        <Text
                            style={
                                styles.todayText
                            }
                        >
                            {day.date.getDate()}
                        </Text>
                    </View>
                ) : (
                    <Text
                        style={[
                            styles.dayNumber,
                            !isCurrentMonth && {
                                opacity: 0.3,
                            },
                        ]}
                    >
                        {day.date.getDate()}
                    </Text>
                )}
            </View>

            {meals
                .slice(0, 3)
                .map((meal: any) => (
                    <View
                        key={meal.id}
                        style={
                            styles.mealRow
                        }
                    >
                        <View
                            style={[
                                styles.dot,
                                {
                                    backgroundColor:
                                        theme
                                            .accent
                                            .primary,
                                },
                            ]}
                        />

                        <Text
                            numberOfLines={
                                1
                            }
                            style={
                                styles.mealText
                            }
                        >
                            {
                                meal.name
                            }
                        </Text>
                    </View>
                ))}

            {meals.length > 3 && (
                <Text
                    style={
                        styles.more
                    }
                >
                    +
                    {meals.length -
                        3}
                </Text>
            )}
        </AnimatedPressable>
    );
});

const styles = StyleSheet.create({
    cell: {
        width: "14.285%",
        aspectRatio: 0.72,
        padding: 4,
        borderRightWidth:
            StyleSheet.hairlineWidth,
        borderBottomWidth:
            StyleSheet.hairlineWidth,
        borderColor:
            "rgba(255,255,255,0.08)",
    },

    dayHeader: {
        alignItems: "flex-end",
        marginBottom: 4,
    },

    todayBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
    },

    todayText: {
        color: "white",
        fontWeight: "700",
        fontSize: 12,
    },

    dayNumber: {
        fontSize: 13,
        fontWeight: "600",
    },

    mealRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 3,
    },

    dot: {
        width: 5,
        height: 5,
        borderRadius: 999,
        marginRight: 4,
    },

    mealText: {
        flex: 1,
        fontSize: 9,
    },

    more: {
        marginTop: 2,
        marginLeft: 9,
        fontSize: 9,
        fontWeight: "600",
    },
});