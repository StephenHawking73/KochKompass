import { useTheme } from "@/hooks/useTheme";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View, Text, Pressable, Image, Animated } from "react-native";
import * as Haptics from "expo-haptics";

type MealCardProps = {
    title: string;
    attribute?: string;
    selected: boolean;
    onPress?: () => void;
    onLongPress?: () => void;
    onDoublePress?: () => void;
};

export default function MealCard({
    title,
    attribute,
    selected,
    onPress,
    onLongPress,
    onDoublePress,
}: MealCardProps) {

    const theme = useTheme();
    const styles = createStyles(theme, attribute);

    const lastTap = useRef(0);
    const tapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scale, {
            toValue: selected ? 1.04 : 1,
            useNativeDriver: true,
        }).start();
    }, [selected]);


    return (
        <Pressable 
            style = {styles.card}
            onPress = {() => {
                const now = Date.now();

                if (now - lastTap.current < 280) {
                    if (tapTimeout.current) {
                        clearTimeout(tapTimeout.current);
                        tapTimeout.current = null;
                    }

                    lastTap.current = 0;
                    onDoublePress?.();
                    return;
                }

                lastTap.current = now;

                tapTimeout.current = setTimeout(() => {
                    onPress?.();
                }, 280);
            }}
            onLongPress = {async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onLongPress?.();
            }}
            delayLongPress = {150}
        >
            <Animated.View style={[styles.animatedCard, selected && styles.dragging, { transform: [{ scale }] }]}>
                <View style={styles.content}>

                    {/* DOT */}
                    <View style={styles.dot}>
                        
                    </View>

                    {/* TEXT */}
                    <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                        {title}
                    </Text>

                </View>
            </Animated.View>
        </Pressable>
    );
}

const createStyles = (theme: any, attribute: string | undefined) =>
    StyleSheet.create({

        card: {
            position: "absolute",
            top: -2,
            bottom: -2,
            right: -2,
            left: -2,
        },

        animatedCard: {
            flex: 1,

            backgroundColor: theme.card.background,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingVertical: 10,

            borderWidth: 1,
            borderColor: theme.button.border,
        },

        dragging: {
            zIndex: 1000,
            elevation: 1,

            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: {
                width: 0,
                height: 6,
            },
        },

        content: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            gap: 10,

            overflow: "visible",
        },

        dot: {
            width: 3,
            height: 40,
            borderRadius: 5,
            flexShrink: 0,

            backgroundColor: attribute === "vegan" ? theme.vegan : attribute === "vegetarian" ? theme.veggie : attribute === "meat" ? theme.meat : attribute === "dessert" ? theme.dessert : theme.accent.primary,
        },

        placeholder: {
            width: 50,
            height: 50,
            borderRadius: 10,
            backgroundColor: "rgba(103 103 103 / 0.06)",
            flexShrink: 0,
        },

        title: {
            flex: 1,

            color: theme.text.primary,
            fontSize: 14,
            fontWeight: "500",
            letterSpacing: 0.3,
        },

        placeholderText: {
            fontSize: 30,
        }
    });