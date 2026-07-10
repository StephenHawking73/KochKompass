import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    StyleSheet,
} from "react-native";

import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";

import {
    createRecipe,
    getRecipe,
    updateRecipe
} from "@/services/recipeService";

import { Difficulty, RecipeAttribute } from "@/types/types";
import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";
import { SafeAreaView } from "react-native-safe-area-context";


export default function RecipeEdit(){

    const theme = useTheme();
    const styles = createStyles(theme);

    const { id } = useLocalSearchParams();

    const recipeId = Array.isArray(id)
        ? id[0]
        : id;

    const editing = !!recipeId;


    const [title,setTitle] = useState("");
    const [description,setDescription] = useState("");
    const [duration,setDuration] = useState("");
    const [difficulty,setDifficulty] = useState<Difficulty | null>(null);
    const [attribute,setAttribute] = useState<RecipeAttribute | null>(null);
    const [link,setLink] = useState("");
    const [image,setImage] = useState("");

    useEffect(()=>{
        if(!recipeId) return;

        async function load(){
            const recipe = await getRecipe(recipeId);

            if(recipe){
                setTitle(recipe.title);
                setDescription(recipe.description ?? "");
                setDuration(recipe.duration ? String(recipe.duration) : "");
                setDifficulty(recipe.difficulty ?? null);
                setAttribute(recipe.attribute ?? null);
                setLink(recipe.link ?? "");
                setImage(recipe.image_url ?? "");

            }
        }
        load();
    },[recipeId]);

    async function save(){
        const data = {
            title,
            description,
            duration: duration.trim() === ""
                ? null
                : Number(duration),
            difficulty: difficulty ?? null,
            attribute: attribute ?? null,
            link,
            image_url:image
        };

        if(editing){
            await updateRecipe(
                recipeId!,
                data
            );
        } else{
            await createRecipe(data);
        }

        router.back();
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Pressable
                    style={styles.iconButton}
                    onPress={()=>router.back()}
                >
                    {icons.back({
                        color: theme.text.primary
                    })}
                </Pressable>

                <Text style={styles.headerTitle}>
                    {editing
                        ? "Rezept bearbeiten"
                        : "Neues Rezept"
                    }
                </Text>
                <View style={{width:42}}/>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    padding:20,
                    paddingBottom:120
                }}
            >
                {/* BASISDATEN */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        Allgemein
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Rezeptname"
                        placeholderTextColor={theme.text.op}
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={[
                            styles.input,
                            styles.descriptionInput
                        ]}
                        placeholder="Beschreibung"
                        placeholderTextColor={theme.text.op}
                        value={description}
                        onChangeText={setDescription}
                        multiline
                    />
                </View>

                {/* DETAILS */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        Details
                    </Text>

                    <Text style={styles.label}>
                        Kategorie
                    </Text>

                    <View style={styles.chipRow}>
                        {[
                            {
                                value:"vegan",
                                title:"Vegan"
                            },
                            {
                                value:"vegetarian",
                                title:"Vegetarisch"
                            },
                            {
                                value:"meat",
                                title:"Fleisch"
                            },
                            {
                                value:"dessert",
                                title:"Dessert",
                            }
                        ].map(item=>(
                            <Pressable
                                key={item.value}
                                onPress={()=>
                                    setAttribute(prev =>
                                        prev === item.value
                                            ? null
                                            : (item.value as RecipeAttribute)
                                    )
                                }
                                style={[
                                    styles.chip,
                                    attribute === item.value &&
                                    styles.activeChip
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.chipText,
                                        attribute === item.value &&
                                        styles.activeChipText
                                    ]}
                                >
                                    {item.title}
                                </Text>
                            </Pressable>
                        ))}
                    </View>




                    <Text style={styles.label}>
                        Schwierigkeit
                    </Text>


                    <View style={styles.chipRow}>


                        {[
                            "Einfach",
                            "Mittel",
                            "Schwer"

                        ].map(item=>(

                            <Pressable
                                key={item}
                                onPress={()=>
                                    setDifficulty(prev =>
                                        prev === item
                                            ? null
                                            : (item as Difficulty)
                                    )
                                }

                                style={[
                                    styles.chip,
                                    difficulty === item &&
                                    styles.activeChip
                                ]}
                            >

                                <Text
                                    style={[
                                        styles.chipText,
                                        difficulty === item &&
                                        styles.activeChipText
                                    ]}
                                >
                                    {item}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="Dauer in Minuten"
                        placeholderTextColor={theme.text.op}
                        value={duration}
                        onChangeText={setDuration}
                        keyboardType="numeric"
                    />
                </View>

                {/* LINKS */}
                <View style={styles.card}>

                    <Text style={styles.sectionTitle}>
                        Verknüpfungen
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Bild URL"
                        placeholderTextColor={theme.text.op}
                        value={image}
                        onChangeText={setImage}
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Rezept Link"
                        placeholderTextColor={theme.text.op}
                        value={link}
                        onChangeText={setLink}
                    />
                </View>
            </ScrollView>

            {/* SAVE BUTTON */}
            <View style={styles.bottom}>
                <Pressable
                    style={styles.saveButton}
                    onPress={save}
                >

                    {icons.check({
                        color:"white",
                        size:22
                    })}

                    <Text style={styles.saveText}>
                        Speichern
                    </Text>

                </Pressable>
            </View>
        </SafeAreaView>
    );
}





const createStyles = (theme:any)=>

StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:theme.background,
    },

    header:{
        height: 50,
        paddingHorizontal: 20,

        flexDirection:"row",
        alignItems:"center",
        justifyContent:"space-between",
    },


    headerTitle:{
        fontSize:20,
        fontWeight:"700",
        color:theme.text.primary,
    },


    iconButton:{
        width:42,
        height:42,

        borderRadius:21,

        backgroundColor:theme.button.background,

        justifyContent:"center",
        alignItems:"center",
    },


    card:{

        backgroundColor:theme.card.background,

        borderRadius:22,

        padding:18,

        marginBottom:18,
    },

    sectionTitle:{
        fontSize:18,
        fontWeight:"700",

        color:theme.text.primary,

        marginBottom:15,
    },

    label:{
        fontSize:14,
        fontWeight:"600",

        color:theme.text.op,

        marginBottom:10,
        marginTop:8,
    },

    input:{
        height:52,
        borderRadius:14,
        backgroundColor:theme.background,

        paddingHorizontal:16,
        color:theme.text.primary,
        fontSize:15,

        marginBottom:12,
    },


    descriptionInput:{
        height:120,
        textAlignVertical:"top",
        paddingTop:15,
    },


    chipRow:{
        flexDirection:"row",
        flexWrap:"wrap",
        gap:10,
        marginBottom:15,
    },


    chip:{
        paddingHorizontal:15,
        paddingVertical:10,

        borderRadius:20,

        backgroundColor:theme.background,
    },


    activeChip:{
        backgroundColor:theme.accent.primary,
    },


    chipText:{
        color:theme.text.primary,
        fontWeight:"600",
        fontSize:14,
    },


    activeChipText:{
        color:"white",
    },


    bottom:{
        position:"absolute",

        bottom:20,
        left:20,
        right:20,

        height:80,

        justifyContent:"center",

        backgroundColor:theme.background,

    },


    saveButton:{

        height:56,

        borderRadius:16,

        backgroundColor:theme.accent.primary,

        flexDirection:"row",

        alignItems:"center",
        justifyContent:"center",

        gap:10,

    },

    saveText:{
        color:"white",

        fontSize:16,

        fontWeight:"700",
    },
});