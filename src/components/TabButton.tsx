import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { useModal } from "../context/ModalContext";

export const TabButton = () => {
    const { showAddMeal } = useModal();

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        showAddMeal();
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.button} activeOpacity={0.7}>
            <Ionicons name="add-circle" size={35} color='#fff'/>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        top: -20,
        left: '50%',
        transform: [{ translateX: -40 }],
        backgroundColor: '#29AEA7',
        borderRadius: 24,
        width: 70,
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
    }
})