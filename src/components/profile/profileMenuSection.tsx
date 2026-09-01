import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import ProfileMenuItem from "./ProfileMenuItem";

type MenuItem = {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    onPress?: () => void;
};

type Props = {
    title: string;
    items: MenuItem[];
};

export default function ProfileMenuSection({
    title,
    items,
}: Props) {

    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <View style={styles.section}>

            <Text style={styles.sectionTitle}>
                {title}
            </Text>


            <View style={styles.container}>
                {items.map((item, index) => (
                    <View key={item.title}>

                        <ProfileMenuItem
                            title={item.title}
                            subtitle={item.subtitle}
                            icon={item.icon}
                            onPress={item.onPress}
                        />

                        {index !== items.length - 1 && (
                            <View style={styles.divider} />
                        )}

                    </View>
                ))}
            </View>

        </View>
    );
}


const createStyles = (theme: any) =>
StyleSheet.create({

    section: {
        marginTop: 30,
    },


    sectionTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: theme.text.primary,

        marginBottom: 8,
        marginLeft: 5,
    },


    container: {
        backgroundColor: theme.card.background,

        borderRadius: 18,
        overflow: "hidden",
    },


    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.tabBar.border ?? "#E5E5E5",

        marginLeft: 53,
    },

});