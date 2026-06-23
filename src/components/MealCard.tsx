import { useTheme } from "@/hooks/useTheme";
import { ReactNode } from "react";
import { StyleSheet, View, Text, Pressable, Image } from "react-native";

type MealCardProps = {
    title: string;
    image_url?: string;
    subtitle?: string;
    rightSlot?: ReactNode;
    onPress?: () => void;
    loading?: boolean;
};

export default function MealCard({
    title,
    image_url,
    onPress,
}: MealCardProps) {

    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <Pressable onPress={onPress} style={styles.card}>
            <View style={styles.content}>

                {/* IMAGE */}
                {image_url ? (
                    <Image
                        source={{ uri: image_url }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <Text style={styles.placeholderText}>🍽️</Text>
                )}

                {/* TEXT */}
                <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
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

            flex: 1,

            backgroundColor: theme.card.background,
            borderRadius: 16,

            paddingHorizontal: 12,
            paddingVertical: 10,

            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.06)",

            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },

            elevation: 2,

            justifyContent: "center",
        },

        content: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            gap: 10,
        },

        image: {
            width: 50,
            height: 50,
            borderRadius: 10,
            flexShrink: 0,
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