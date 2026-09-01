import { useTheme } from "@/hooks/useTheme";
import { StyleSheet, View, Image, Text } from "react-native";


type Props = {
    username: string;
    fullName?: string | null;
    avatar: string | null;
    email: string;
};


export default function ProfileCard({
    username,
    fullName,
    avatar,
    email,
}: Props) {

    const theme = useTheme();
    const styles = createStyles(theme);


    const avatarSource = avatar && avatar.trim() !== ""
        ? { uri: avatar }
        : {
            uri: "https://avatar.imagik.app/_next/image?url=%2Fimages%2Favatar.webp&w=3840&q=75"
        };


    return (
        <View style={styles.card}>

            <Image
                source={avatarSource}
                style={styles.avatar}
            />


            <View>

                <Text style={styles.name}>
                    {fullName}
                </Text>


                <Text style={styles.email}>
                    {email}
                </Text>

            </View>

        </View>
    );
}



const createStyles = (theme: any) =>
StyleSheet.create({

    card: {
        backgroundColor: theme.card.background,

        padding: 20,
        marginTop: 12,

        borderRadius: 20,

        flexDirection: "row",
        alignItems: "center",

        gap: 15,


        shadowColor: "#000",
        shadowOpacity: 0.02,
        shadowRadius: 8,

        shadowOffset: {
            width: 0,
            height: 2,
        },

        elevation: 2,
    },


    avatar: {
        width: 75,
        height: 75,

        borderRadius: 40,
    },


    name: {
        fontSize: 18,
        fontWeight: "700",

        color: theme.text.primary,
    },


    email: {
        color: theme.text.op,
    },

});