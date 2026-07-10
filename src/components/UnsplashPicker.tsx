import {
    View,
    Text,
    TextInput,
    Pressable,
    Image,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import BasicBottomSheet from "@/components/BasicBottomSheet";
import { icons } from "@/assets/icons";

interface Props{
    visible:boolean;
    onClose:()=>void;
    onSelect:(url:string)=>void;
}

export default function UnsplashPicker({
    visible,
    onClose,
    onSelect
}:Props){

    const theme=useTheme();
    const styles=createStyles(theme);

    const [query,setQuery]=useState("");
    const [images,setImages]=useState<any[]>([]);
    const [loading,setLoading]=useState(false);

    async function search(){

        if(!query.trim()) return;

        setLoading(true);

        try{
            const response=await fetch(
                `https://api.unsplash.com/search/photos?query=${(query)}&per_page=30`,
                {
                    headers:{
                        Authorization:
                        `Client-ID fVSZs80VxVMhvvfcqvgaCdkydCYD1QP2ZWj2GVZwHnc`
                    }
                }
            );

            const data=await response.json();

            setImages(data.results ?? []);

        }catch(error){
            console.log(error);
        }finally{
            setLoading(false);
        }
    }

    function selectImage(url:string){
        onSelect(url);
        onClose();
    }

    function close(){
        setQuery("");
        setImages([]);
        onClose();
    }

    return(
        <BasicBottomSheet
            visible={visible}
            onClose={close}
            heightFactor={0.55}
            fullScreen={true}
        >
            <View style={styles.container}>

                <Text style={styles.title}>
                    Bild suchen
                </Text>

                <View style={styles.searchContainer}>

                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="z.B. Pasta Carbonara"
                        placeholderTextColor={theme.text.op}
                        style={styles.input}
                        onSubmitEditing={search}
                    />

                    <Pressable
                        style={styles.searchButton}
                        onPress={search}
                    >
                        {loading ? (
                            <ActivityIndicator color="white"/>
                        ):(
                            <>
                                {icons.search({
                                    color:"white",
                                    size:18
                                })}
                                <Text style={styles.searchText}>
                                    Suchen
                                </Text>
                            </>
                        )}
                    </Pressable>

                </View>

                <FlatList
                    data={images}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item)=>item.id}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.list}
                    renderItem={({item})=>(
                        <Pressable
                            style={styles.imageCard}
                            onPress={()=>selectImage(item.urls.regular)}
                        >
                            <Image
                                source={{
                                    uri:item.urls.small
                                }}
                                style={styles.image}
                            />
                        </Pressable>
                    )}
                />

            </View>
        </BasicBottomSheet>
    );
}

const createStyles=(theme:any)=>StyleSheet.create({
    container:{
        flex:1,
    },
    title:{
        fontSize:22,
        fontWeight:"700",
        color:theme.text.primary,
        marginBottom:18,
    },
    searchContainer:{
        flexDirection:"row",
        gap:10,
        marginBottom:15,
    },
    input:{
        flex:1,
        height:50,
        backgroundColor:theme.card.background,
        borderRadius:15,
        paddingHorizontal:15,
        color:theme.text.primary,
    },
    searchButton:{
        height:50,
        paddingHorizontal:15,
        borderRadius:15,
        backgroundColor:theme.accent.primary,
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"center",
        gap:6,
    },
    searchText:{
        color:"white",
        fontWeight:"700",
    },
    list:{
        paddingBottom:20,
    },
    row:{
        justifyContent:"space-between",
        marginBottom:0,
    },
    imageCard:{
        width:"49%",
        height:140,
        marginBottom:6,
        borderRadius:16,
        overflow:"hidden",
        backgroundColor:theme.card.background,
    },
    image:{
        width:"100%",
        height:"100%",
    },
});