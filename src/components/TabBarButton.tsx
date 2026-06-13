import { View, Text, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { icons } from "@/assets/icons";
import { useTheme } from '@/hooks/useTheme';

type RouteName = "index" | "ratings" | "profile";

const TabBarButton = (props: any) => {
    const {isFocused, label, routeName, color} = props;
    
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <Pressable {...props} style={styles.container}>
            {
                icons[routeName as RouteName]({
                    color: isFocused ? theme.accent.primary : theme.text.op
                })
            }

            <Text style={{ color: isFocused ? theme.accent.primary : theme.text.op }}>
                {label}
            </Text>
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