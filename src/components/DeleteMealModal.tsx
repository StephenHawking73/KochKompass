import {
    Modal,
    View,
    Text,
    StyleSheet,
    Pressable,
} from "react-native";

import { useTheme } from "@/hooks/useTheme";

interface Props {
    visible: boolean;
    title: string;
    loading?: boolean;

    onCancel: () => void;
    onDelete: () => void;
}

export default function DeleteMealModal({
    visible,
    title,
    loading,
    onCancel,
    onDelete,
}: Props) {

    const theme = useTheme();
    const styles = createStyles(theme);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View style={styles.overlay}>

                <View style={styles.card}>

                    <Text style={styles.heading}>
                        Mahlzeit löschen?
                    </Text>

                    <Text style={styles.text}>
                        "{title}" wird aus dem Speiseplan entfernt.
                    </Text>

                    <View style={styles.buttons}>

                        <Pressable
                            style={styles.cancel}
                            onPress={onCancel}
                        >
                            <Text style={styles.cancelText}>
                                Abbrechen
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.delete}
                            onPress={onDelete}
                            disabled={loading}
                        >
                            <Text style={styles.deleteText}>
                                Löschen
                            </Text>
                        </Pressable>

                    </View>

                </View>

            </View>
        </Modal>
    );
}

const createStyles = (theme: any) =>
StyleSheet.create({

overlay:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"rgba(0,0,0,0.35)",
},

card:{
    width:"84%",
    borderRadius:22,
    backgroundColor:theme.card.background,
    padding:22,
},

heading:{
    fontSize:20,
    fontWeight:"700",
    color:theme.text.primary,
},

text:{
    marginTop:10,
    color:theme.text.op,
    fontSize:15,
    lineHeight:22,
},

buttons:{
    flexDirection:"row",
    justifyContent:"flex-end",
    gap:12,
    marginTop:28,
},

cancel:{
    paddingHorizontal:18,
    paddingVertical:10,
},

delete:{
    paddingHorizontal:18,
    paddingVertical:10,
    borderRadius:10,
    backgroundColor:"#E5484D",
},

cancelText:{
    color:theme.text.primary,
    fontWeight:"600",
},

deleteText:{
    color:"white",
    fontWeight:"700",
},

});