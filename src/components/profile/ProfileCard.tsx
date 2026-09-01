import { useTheme } from "@/hooks/useTheme";
import { StyleSheet, View, Image, Text, Pressable } from "react-native";
import { icons } from "@/assets/icons";


type Props = {
    username: string;
    fullName?: string | null;
    avatar: string | null;
    email: string;
    onEditPress?: () => void;
};


export default function ProfileCard({
    username,
    fullName,
    avatar,
    email,
    onEditPress,
}: Props) {

    const theme = useTheme();
    const styles = createStyles(theme);

    const displayName = fullName && fullName.trim() ? fullName : username;
    const initials = (displayName || email || "K")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "K";

    const avatarSource = avatar && avatar.trim() !== "" ? { uri: avatar } : null;

    return (
        <View style={styles.card}>
            <View style={styles.avatarWrap}>
                {avatarSource ? (
                    <Image
                        source={avatarSource}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarPlaceholderText}>{initials}</Text>
                    </View>
                )}

                {onEditPress && (
                    <Pressable
                        style={styles.editButton}
                        onPress={onEditPress}
                        accessibilityLabel="Profil bearbeiten"
                    >
                        {icons.edit({ color: '#fff', size: 16 })}
                    </Pressable>
                )}
            </View>

            <View style={styles.textBlock}>
                <Text style={styles.name}>
                    {displayName}
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

    avatarWrap: {
        position: "relative",
    },

    avatar: {
        width: 75,
        height: 75,
        borderRadius: 40,
    },

    avatarPlaceholder: {
        width: 75,
        height: 75,
        borderRadius: 40,
        backgroundColor: theme.accent.primary,
        alignItems: "center",
        justifyContent: "center",
    },

    avatarPlaceholderText: {
        color: "#fff",
        fontSize: 26,
        fontWeight: "700",
    },

    editButton: {
        position: "absolute",
        right: -4,
        bottom: -4,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: theme.accent.primary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: theme.card.background,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },

    textBlock: {
        flex: 1,
    },

    name: {
        fontSize: 18,
        fontWeight: "700",
        color: theme.text.primary,
    },

    email: {
        color: theme.text.op,
        marginTop: 4,
    },

});