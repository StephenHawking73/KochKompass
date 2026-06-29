import { useTheme } from "@/hooks/useTheme";
import { StyleSheet, View, Text, Pressable, Image } from "react-native";

type MealCardProps = {
    title: string;
    image_url?: string;
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
            top: -2,
            bottom: -2,
            right: -2,
            left: -2,

            flex: 1,

            backgroundColor: theme.card.background,
            borderRadius: 12,

            paddingHorizontal: 12,
            paddingVertical: 10,

            borderWidth: 1,
            borderColor: theme.button.border,
        },

        content: {
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            gap: 10,

            overflow: "visible",
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