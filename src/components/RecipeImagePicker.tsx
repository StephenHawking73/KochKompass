import {
    View,
    Text,
    Image,
    Pressable,
    StyleSheet
} from "react-native";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";
import UnsplashPicker from "./UnsplashPicker";

import * as ImagePicker from "expo-image-picker";
import { deleteRecipeImage, uploadRecipeImage } from "@/services/storageService";
import BasicBottomSheet from "./BasicBottomSheet";

interface Props{
    value:string;
    onChange:(url:string)=>void;
    onUpload?: (url: string) => void;
}

export default function RecipeImagePicker({
    value,
    onChange,
    onUpload,
}:Props){

    const theme = useTheme();
    const styles=createStyles(theme);

    const [pickerOpen, setPickerOpen] = useState(false);
    const [unsplashOpen, setUnsplashOpen] = useState(false);

    const pickFromGallery = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            return;
        }

        const result =
            await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.85,
            });

            if (result.canceled) {
                return;
            }

        setPickerOpen(false);

        const url = await uploadRecipeImage(
            result.assets[0].uri
        );

        onChange(url);
        onUpload?.(url);
    };

    const takePhoto = async () => {
        const permission =
            await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
            return;
        }

        const result =
            await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.85,
            });

        if (result.canceled) {
            return;
        }

        setPickerOpen(false);

        const url = await uploadRecipeImage(
            result.assets[0].uri
        );

        onChange(url);
        onUpload?.(url);
    };

    return(
        <>
            <View style={styles.container}>

                {
                    value ? (
                        <Image
                            source={{uri:value}}
                            style={styles.image}
                        />
                    ) : (
                        <View style={styles.placeholder}>
                            {icons.camera({
                                color:theme.text.op,
                                size:42
                            })}

                            <Text style={styles.text}>
                                Bild hinzufügen
                            </Text>
                        </View>
                    )
                }

                <Pressable
                    style={styles.button}
                    onPress={() => setPickerOpen(true)}
                >
                    {icons.edit({
                        color:"white",
                        size:18
                    })}
                </Pressable>

            </View>

            <UnsplashPicker
                visible={unsplashOpen}
                onClose={()=>{
                    setUnsplashOpen(false);
                }}
                onSelect={(url: any)=>{
                    onChange(url);
                    setUnsplashOpen(false);
                }}
            />

            <BasicBottomSheet
                visible={pickerOpen}
                onClose={() => setPickerOpen(false)}
                heightFactor={0}
            >
                <Pressable
                    style={styles.option}
                    onPress={pickFromGallery}
                >
                    {icons.image({
                        size:22,
                        color:theme.text.primary,
                    })}

                    <Text style={styles.optionText}>
                        Aus Galerie wählen
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.option}
                    onPress={()=>{
                        setPickerOpen(false);
                        setUnsplashOpen(true);
                    }}
                >
                    {icons.unsplash({
                        size:22,
                        color:theme.text.primary,
                    })}

                    <Text style={styles.optionText}>
                        Unsplash durchsuchen
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.option}
                    onPress={takePhoto}
                >
                    {icons.camera({
                        size:22,
                        color:theme.text.primary,
                    })}

                    <Text style={styles.optionText}>
                        Foto aufnehmen
                    </Text>
                </Pressable>

                <View style={styles.separator}/>

                <Pressable
                    style={styles.option}
                    onPress={async () => {
                        try {
                            await deleteRecipeImage(value, value[1]);

                            onChange("");
                            setPickerOpen(false);
                        } catch (err) {
                            console.log("Fehler beim Löschen des Bildes: ", err)
                        }
                    }}
                >
                    {icons.delete({
                        size:22,
                        color: theme.notification,
                    })}

                    <Text
                        style={[
                            styles.optionText,
                            { color: theme.notification }
                        ]}
                    >
                        Bild entfernen
                    </Text>
                </Pressable>

                <Pressable
                    style={styles.cancelButton}
                    onPress={() => setPickerOpen(false)}
                >
                    <Text style={styles.cancelText}>
                        Abbrechen
                    </Text>
                </Pressable>
            </BasicBottomSheet>
        </>
    );
}

const createStyles=(theme:any)=>StyleSheet.create({
    container:{
        height:220,
        borderRadius:22,
        overflow:"hidden",
        backgroundColor:theme.background,
        position:"relative",
    },
    image:{
        width:"100%",
        height:"100%",
    },
    placeholder:{
        flex:1,
        justifyContent:"center",
        alignItems:"center",
        gap:10,
    },
    text:{
        color:theme.text.op,
        fontWeight:"600",
    },
    button:{
        position:"absolute",
        right:12,
        bottom:12,
        width:42,
        height:42,
        borderRadius:21,
        backgroundColor:theme.accent.primary,
        justifyContent:"center",
        alignItems:"center",
    },
    option: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        paddingVertical: 18,
    },

    optionText: {
        fontSize: 17,
        fontWeight: "500",
        color: theme.text.primary,
    },

    separator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: theme.text.op,
        marginVertical: 6,
    },

    cancelButton: {
        alignItems: "center",
        paddingVertical: 10,
    },

    cancelText: {
        fontSize: 17,
        fontWeight: "600",
        color: theme.accent.primary,
    },
});