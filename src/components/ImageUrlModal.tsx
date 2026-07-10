import {
    View,
    Text,
    TextInput,
    Pressable,
    Modal,
    StyleSheet
} from "react-native";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";

interface Props{
    visible:boolean;
    onClose:()=>void;
    onSave:(url:string)=>void;
}

export default function ImageUrlModal({
    visible,
    onClose,
    onSave
}:Props){

    const theme = useTheme();
    const styles = createStyles(theme);

    const [url,setUrl] = useState("");

    function save(){
        if(!url.trim()) return;

        onSave(url.trim());
        setUrl("");
        onClose();
    }

    return(
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Text style={styles.title}>
                        Bild URL
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="https://..."
                        placeholderTextColor={theme.text.op}
                        value={url}
                        onChangeText={setUrl}
                        autoCapitalize="none"
                    />

                    <View style={styles.buttons}>
                        <Pressable
                            style={styles.cancel}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelText}>
                                Abbrechen
                            </Text>
                        </Pressable>

                        <Pressable
                            style={styles.save}
                            onPress={save}
                        >
                            <Text style={styles.saveText}>
                                Speichern
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const createStyles=(theme:any)=>StyleSheet.create({
    overlay:{
        flex:1,
        backgroundColor:"rgba(0,0,0,0.45)",
        justifyContent:"center",
        padding:20,
    },
    card:{
        backgroundColor:theme.card.background,
        borderRadius:24,
        padding:20,
    },
    title:{
        color:theme.text.primary,
        fontSize:18,
        fontWeight:"700",
        marginBottom:15,
    },
    input:{
        height:52,
        borderRadius:14,
        backgroundColor:theme.background,
        paddingHorizontal:15,
        color:theme.text.primary,
        marginBottom:20,
    },
    buttons:{
        flexDirection:"row",
        gap:12,
    },
    cancel:{
        flex:1,
        height:50,
        borderRadius:15,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:theme.background,
    },
    save:{
        flex:1,
        height:50,
        borderRadius:15,
        justifyContent:"center",
        alignItems:"center",
        backgroundColor:theme.accent.primary,
    },
    cancelText:{
        color:theme.text.primary,
        fontWeight:"600",
    },
    saveText:{
        color:"white",
        fontWeight:"700",
    },
});