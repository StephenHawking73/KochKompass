import { databases } from "@/src/api/appwriteConfig";
import { useModal } from "@/src/context/ModalContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ID, Query } from "appwrite";
import { useEffect, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";


export default function AddMeal() {
    const { isAddMealVisible, hideAddMeal } = useModal(); // Context lesen
    const [mealName, setMealName] = useState("");
    const [data, setData] = useState<any[]>([]);

    const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [fullData, setFullData] = useState<any[]>([]);

    const [userRatings, setUserRatings] = useState<{ [key: string]: number | undefined }>({});
    const [showRatingModal, setShowRatingModal] = useState(false);

    const [isFilterActive, setIsFilterActive] = useState(false);


    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const recipes = await databases.listDocuments(
                    "6846fb7f00127239fdd7", 
                    "6846fb850031f9e6d717"
                );
                const formattedData = recipes.documents.map((doc: any) => ({
                    id: doc.$id,
                    name: doc.title,
                    rating: doc.averageRating,
                    weekStartDate: doc.weekStartDate ?? null
                }));
                setFullData(formattedData);
                setData(formattedData);
            } catch (error) {
                console.error("Fehler beim Laden der Rezepte:", error);
            }
        };

        if (isAddMealVisible) {
            fetchRecipes();
        }
    }, [isAddMealVisible])

    useEffect(() => {
        const fetchUserRatings = async () => {
            if (!selectedRecipe || !showRatingModal) return;
    
            try {
                const doc = await databases.getDocument(
                    "6846fb7f00127239fdd7",
                    "6846fb850031f9e6d717",
                    selectedRecipe.id
                );
    
                const users: { [key: string]: number | undefined } = {
                    Anouk: doc.Anouk,
                    Aaron: doc.Aaron,
                    Tanja: doc.Tanja,
                    Frank: doc.Frank,
                };
    
                setUserRatings(users);
            } catch (err) {
                console.log("Fehler beim Laden der Bewertungen:", err);
            }
        };
    
        fetchUserRatings();
    }, [selectedRecipe, showRatingModal]);
    
    useEffect(() => {
        const filtered = fullData.filter(recipe => 
            recipe.name.toLowerCase().includes(mealName.toLowerCase())
        );
        setData(filtered);
    }, [mealName, fullData])

    const sortByOldest = () => {
        const sorted = [...data].sort((a, b) => {
            if (!a.weekStartDate) return 1;
            if (!b.weekStartDate) return -1;
            return new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime();
        })
        setData(sorted);
    }

    const weekdays: {[key: number]: string} = {
        1: "Montag",
        2: "Dienstag",
        3: "Mittwoch",
        4: "Donnerstag",
        5: "Freitag",
        6: "Samstag",
        0: "Sonntag",
    }

    function getWeekStartsDate(date: Date): string {
        const day = date.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        
        const monday = new Date(date);
        monday.setDate(date.getDate() + diffToMonday);

        return monday.toISOString().split("T")[0];
    }

    const saveMeal = async (recipe: any, date: Date) => {
        const dayNumber = date.getDay();
        const day = weekdays[dayNumber];        
       
        try {
            const doc = await databases.listDocuments("6846fb7f00127239fdd7", "6846fb850031f9e6d717", [Query.equal("title", recipe.name)]);
            if (doc.total > 0){
                const exisingDoc = doc.documents[0];
                
                await databases.updateDocument(
                    "6846fb7f00127239fdd7", 
                    "6846fb850031f9e6d717",
                    exisingDoc.$id,
                    {
                        day: day,
                        weekStartDate: getWeekStartsDate(date)
                    }
                )
                console.log("Bestehendes Rezept aktualisiert:", recipe.name, "→", day, getWeekStartsDate(date));
            } else {
                await databases.createDocument("6846fb7f00127239fdd7", "6846fb850031f9e6d717", ID.unique(), {
                    day: day, 
                    title: recipe.name,
                    weekStartDate: getWeekStartsDate(date),
                })
                console.log("Neues Rezept gespeichert:", recipe.name, "→", getWeekStartsDate(date));
            }
        } catch (err) {
            console.error("Fehler beim Speichern der Mahlzeit:", err);
        }

        hideAddMeal();
        setMealName("");
        setSelectedRecipe(null);
        setSelectedDate(null);
    };
      
    const handleSelectRecipe = (item: any) => {
        setSelectedRecipe(item)
        setShowDatePicker(true);
    }

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        const stars = [];

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Ionicons key={`full-${i}`} name="star" size={20} color="#FFD700" />);
        }

        if (halfStar) {
            stars.push(<Ionicons key="half" name="star-half" size={20} color="#FFD700" />);
        }

        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={20} color="#FFD700" />);
        }

        return <View style={{ flexDirection: 'row' }}>{stars}</View>;
    };

    const onDateChange = (event: any, date?: Date) => {
        if (event.type === "dismissed") {
          setShowDatePicker(false);
          setSelectedRecipe(null);
          return;
        }
      
        if (date && selectedRecipe) {
          setSelectedDate(date);
          console.log("Ausgewähltes Rezept:", selectedRecipe.name);
          console.log("Ausgewähltes Datum:", date.toLocaleDateString());
      
          saveMeal(selectedRecipe, date);
        }
      
        setShowDatePicker(false);
    };
      
    const showUserRating = (item: string) => {
        setSelectedRecipe(item);
        setShowRatingModal(true);
    }

    const closeUserRating = () => {
        setShowRatingModal(false);
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isAddMealVisible}
            onRequestClose={hideAddMeal}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Neues Gericht hinzufügen</Text>
                    
                    <View style={styles.input}>
                        <View style={{flexDirection: "row"}}>
                            <Ionicons name="search-outline" size={20} color="#ccc"/>
                            <TextInput
                                style={{marginLeft: 5}}
                                placeholder="Gericht suchen ..."
                                value={mealName}
                                onChangeText={setMealName}
                            />
                        </View>
                    </View>

                    <Pressable 
                        onPress={() => sortByOldest()} 
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor: "#1DC0AB",
                            borderColor: isFilterActive ? "#FF3E91" : undefined,
                            borderWidth: 2,
                            opacity: 0.77,
                            borderRadius: 10,
                            marginTop: 15,
                            marginBottom: 15,
                            alignSelf: "flex-start"
                        }} 
                    >
                        <Text style={{}}>Lange nicht gekocht</Text>
                    </Pressable>

                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <Pressable onPress={() => handleSelectRecipe(item)} style={styles.recipeItem} onLongPress={() => showUserRating(item)}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{flex: 1, left: 5}}>{item.name}</Text>
                                    <View style={{right: 5}}>
                                        {typeof item.rating === "number" ? renderStars(item.rating) : null}
                                    </View>
                                </View>
                                
                            </Pressable>
                        )}
                        style={{width: "100%"}}
                        ListFooterComponent={
                            <Pressable style={{marginTop: 15, alignItems: "center"}}>
                                <Text style={{color: "#049280", fontSize: 17}}><Text style={{fontWeight: "bold"}}>{mealName ? (mealName) : "Gericht"} </Text>hinzufügen</Text>    
                            </Pressable>
                        }
                    />

                    <Modal animationType="slide" transparent={true} visible={showRatingModal} onRequestClose={() => closeUserRating()}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.userRatingModal}>
                                <Text style={styles.modalTitle}>
                                    {selectedRecipe?.name ?? "Kein Rezept ausgewählt"}
                                </Text> 
                                
                                {Object.keys(userRatings).length > 0 ? (
                                    Object.entries(userRatings).map(([user, rating]) => (
                                        <View key={user} style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginBottom: 4 }}>
                                            <Text style={{ fontWeight: "bold" }}>{user}</Text>
                                            {typeof rating === "number" ? renderStars(rating) : renderStars(0)}
                                        </View>
                                    ))
                                ) : (
                                    <Text style={{ fontStyle: "italic" }}>Lade Bewertungen ...</Text>
                                )}

                                <Pressable onPress={() => closeUserRating()}>
                                    <Text style={{fontSize: 16}}>Schließen</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>

                    {showDatePicker && (
                    <View style={{ backgroundColor: "white" }}>
                        <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                        />
                    </View>
                    )}

                    
                    <View style={{alignItems: "center", width: "100%"}}>
                        <Pressable onPress={hideAddMeal} style={styles.cancelButton}>
                            <Text style={styles.buttonText}>Abbrechen</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        top: 50,
        backgroundColor: "white",
        padding: 30,
        borderRadius: 15,
        alignItems: "center",
        flex: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
        width: "100%",
        marginTop: 15
    },
    cancelButton: {
        backgroundColor: "#FF5D96",
        padding: 10,
        borderRadius: 10,
        marginLeft: 5,
        marginBottom: 60,
        width: "100%",
    },
    buttonText: {
        color: "white",
        textAlign: "center",
    },
    recipeItem: {
        padding: 12,
        backgroundColor: "#eee",
        borderRadius: 6,
        marginBottom: 8,
    },
    recipeText: {
        fontSize: 16
    },
    userRatingModal:{
        top: "76%",
        backgroundColor: "white",
        padding: 30,
        borderRadius: 15,
        alignItems: "center",
    },
    sortButton: {
        
    }
});
