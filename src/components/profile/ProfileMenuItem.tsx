import { icons } from "@/assets/icons";
import { useTheme } from "@/hooks/useTheme";
import { Pressable, View, Text, StyleSheet } from "react-native";


type Props = {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    onPress?: () => void;
};


export default function ProfileMenuItem({
    title,
    subtitle,
    icon,
    onPress,
}: Props) {

    const theme = useTheme();
    const styles = createStyles(theme);


    return (
        <Pressable 
            style={styles.container}
            onPress={onPress}
        >

            {icon}


            <View style={styles.textContainer}>

                <Text style={styles.title}>
                    {title}
                </Text>


                {subtitle && (
                    <Text style={styles.subtitle}>
                        {subtitle}
                    </Text>
                )}

            </View>


            {icons.right({
                color: theme.text.op, size: 14
            })}

        </Pressable>
    );
}



const createStyles = (theme: any) =>
StyleSheet.create({

    container: {
        height: 65,

        flexDirection: "row",
        alignItems: "center",

        gap: 15,

        paddingHorizontal: 18,
    },


    textContainer: {
        flex: 1,
    },


    title: {
        fontSize: 15,
        fontWeight: "500",

        color: theme.text.primary,
    },


    subtitle: {
        fontSize: 13,

        color: theme.text.op,
    },

});