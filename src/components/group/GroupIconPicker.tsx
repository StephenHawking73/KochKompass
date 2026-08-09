import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/useTheme";
import { GROUP_ACCENT_OPTIONS, GROUP_ICON_OPTIONS, GroupIconName, hexToRgba } from "@/lib/groupDesign";

type Props = {
    selectedIcon: GroupIconName;
    onSelectIcon: (icon: GroupIconName) => void;
    selectedAccent: string;
    onSelectAccent: (accent: string) => void;
};

export default function GroupIconPicker({
    selectedIcon,
    onSelectIcon,
    selectedAccent,
    onSelectAccent,
}: Props) {
    const theme = useTheme();
    const styles = createStyles(theme, selectedAccent);

    return (
        <View style={styles.container}>
            <View style={styles.iconGrid}>
                {GROUP_ICON_OPTIONS.map((option) => {
                    const selected = option.name === selectedIcon;

                    return (
                        <Pressable
                            key={option.name}
                            style={[
                                styles.iconOption,
                                selected && styles.iconOptionSelected,
                            ]}
                            onPress={() => onSelectIcon(option.name)}
                        >
                            <View style={[
                                styles.iconBubble,
                                selected && styles.iconBubbleSelected,
                            ]}>
                                {option.render({
                                    color: selected ? selectedAccent : theme.text.op,
                                    size: 22,
                                })}
                            </View>
                            <Text style={[
                                styles.iconLabel,
                                selected && styles.iconLabelSelected,
                            ]}>
                                {option.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <View style={styles.accentRow}>
                {GROUP_ACCENT_OPTIONS.map((accent) => {
                    const selected = accent === selectedAccent;

                    return (
                        <Pressable
                            key={accent}
                            style={[
                                styles.accentOption,
                                { backgroundColor: accent },
                                selected && styles.accentOptionSelected,
                            ]}
                            onPress={() => onSelectAccent(accent)}
                        />
                    );
                })}
            </View>
        </View>
    );
}

const createStyles = (theme: any, accent: string) => StyleSheet.create({
    container: {
        gap: 16,
    },
    iconGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    iconOption: {
        width: "30.8%",
        minWidth: 92,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.tabBar.border ?? "#E6E8EF",
        paddingVertical: 12,
        alignItems: "center",
        gap: 8,
        backgroundColor: theme.card.background,
    },
    iconOptionSelected: {
        borderColor: accent,
        backgroundColor: hexToRgba(accent, 0.08),
    },
    iconBubble: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.searchBar?.background ?? hexToRgba(accent, 0.08),
    },
    iconBubbleSelected: {
        backgroundColor: hexToRgba(accent, 0.16),
    },
    iconLabel: {
        fontSize: 12,
        fontWeight: "700",
        color: theme.text.op,
    },
    iconLabelSelected: {
        color: accent,
    },
    accentRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    accentOption: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 3,
        borderColor: "transparent",
    },
    accentOptionSelected: {
        borderColor: theme.card.background,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.16,
        shadowRadius: 8,
    },
});
