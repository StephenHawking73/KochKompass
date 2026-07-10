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

interface Props{
    value:string;
    onChange:(url:string)=>void;
}

export default function RecipeImagePicker({
    value,
    onChange
}:Props){

    const theme = useTheme();
    const styles=createStyles(theme);

    const [open,setOpen]=useState(false);

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
                    onPress={()=>setOpen(true)}
                >
                    {icons.edit({
                        color:"white",
                        size:18
                    })}
                </Pressable>

            </View>

            <UnsplashPicker
                visible={open}
                onClose={()=>{
                    setOpen(false);
                }}
                onSelect={(url: any)=>{
                    onChange(url);
                    setOpen(false);
                }}
            />
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
});