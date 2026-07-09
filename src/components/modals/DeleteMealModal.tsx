import React from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import BasicBottomSheet from "@/components/BasicBottomSheet";
import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";

type Props = {
    visible: boolean;
    mealTitle: string;

    loading?: boolean;

    onClose: () => void;
    onDelete: () => void;
};

export default function DeleteMealSheet({
    visible,
    mealTitle,
    loading = false,
    onClose,
    onDelete,
}: Props) {
    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <BasicBottomSheet
            visible={visible}
            onClose={onClose}
        >
            <View style={styles.container}>

                <View style={styles.iconContainer}>
                    {icons.delete({
                        color: "#FF453A",
                        size: 28,
                    })}
                </View>

                <Text style={styles.title}>
                    Gericht löschen?
                </Text>

                <Text style={styles.description}>
                    Möchtest du{" "}
                    <Text style={styles.bold}>
                        "{mealTitle}"
                    </Text>{" "}
                    wirklich aus deinem Speiseplan entfernen?
                </Text>

                <View style={styles.buttonContainer}>

                    <Pressable
                        style={styles.cancelButton}
                        disabled={loading}
                        onPress={onClose}
                    >
                        <Text style={styles.cancelText}>
                            Abbrechen
                        </Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.deleteButton,
                            loading && styles.disabled,
                        ]}
                        disabled={loading}
                        onPress={onDelete}
                    >
                        {loading ? (
                            <ActivityIndicator
                                color="white"
                            />
                        ) : (
                            <>
                                {icons.delete({
                                    color: "white",
                                    size: 18,
                                })}

                                <Text style={styles.deleteText}>
                                    Löschen
                                </Text>
                            </>
                        )}
                    </Pressable>

                </View>

            </View>
        </BasicBottomSheet>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({

        container: {
            flex: 1,
            alignItems: "center",
            paddingTop: 10,
        },

        iconContainer: {
            width: 74,
            height: 74,
            borderRadius: 37,

            backgroundColor: "#FF453A18",

            justifyContent: "center",
            alignItems: "center",

            marginBottom: 22,
        },

        title: {
            fontSize: 24,
            fontWeight: "700",
            color: theme.text.primary,
            textAlign: "center",
        },

        description: {
            marginTop: 14,

            textAlign: "center",

            color: theme.text.op,
            fontSize: 15,
            lineHeight: 23,

            paddingHorizontal: 12,
        },

        bold: {
            color: theme.text.primary,
            fontWeight: "700",
        },

        buttonContainer: {
            flexDirection: "row",

            width: "100%",

            marginTop: 34,

            gap: 12,
        },

        cancelButton: {
            flex: 1,

            height: 54,

            borderRadius: 16,

            justifyContent: "center",
            alignItems: "center",

            backgroundColor: theme.background,

            borderWidth: 1,
            borderColor: theme.button.border,
        },

        deleteButton: {
            flex: 1,

            height: 54,

            borderRadius: 16,

            flexDirection: "row",

            justifyContent: "center",
            alignItems: "center",

            gap: 8,

            backgroundColor: "#FF453A",
        },

        disabled: {
            opacity: 0.65,
        },

        cancelText: {
            color: theme.text.primary,
            fontSize: 16,
            fontWeight: "600",
        },

        deleteText: {
            color: "white",
            fontSize: 16,
            fontWeight: "700",
        },

    });