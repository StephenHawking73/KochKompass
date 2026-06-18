import { Text, Pressable, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { icons } from "@/assets/icons";
import { useTheme } from '@/hooks/useTheme';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

type RouteName = "index" | "recipes" | "profile";

const TabBarButton = (props: any) => {
    const {isFocused, label, routeName, color} = props;
    
    const theme = useTheme();
    const styles = createStyles(theme);

    const scale = useSharedValue(0);

    useEffect(() => {
        scale.value = withSpring(
            typeof isFocused === 'boolean' ? (isFocused? 1: 0): isFocused,
            {duration: 400},
        );
    }, [scale, isFocused])

    const animatedIconStyle = useAnimatedStyle(() => {
        
        const scaleValue = interpolate(
            scale.value,
            [0, 1],
            [0.9, 1.5],
        )

        const top = interpolate(
            scale.value,
            [0, 1],
            [0, 10],
        )
        
        return {
            // styles
            transform: [{scale: scaleValue}],
            top
        }
    })

    const animatedTextStyle = useAnimatedStyle(() => {
        
        const opacity = interpolate(
            scale.value,
            [0, 1],
            [1, 0],
        )
        
        return {
            // styles
            opacity
        }
    })

    return (
        <Pressable {...props} style={styles.container}>
            <Animated.View style={[animatedIconStyle]}>
                {
                    icons[routeName as RouteName]({
                        color
                    })
                }
            </Animated.View>

            <Animated.Text style={[{ color, fontSize: 14}, animatedTextStyle]}>
                {label}
            </Animated.Text>
        </Pressable>
    )
}

const createStyles = (theme: any) => StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
    }
})

export default TabBarButton;