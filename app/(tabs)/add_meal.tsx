import { databases } from "@/src/api/appwriteConfig";
import { useModal } from "@/src/context/ModalContext";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ID, Query } from "appwrite";
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";


export default function AddMeal() {
    const { isAddMealVisible, hideAddMeal } = useModal(); // Context lesen
    const [mealName, setMealName] = useState("");
    const [data, setData] = useState<any[]>([]);
    const [mealTime, setMealTime] = useState<"Mittag" | "Abend">("Mittag");

    const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [tempDate, setTempDate] = useState<Date>(selectedDate || new Date());
    const [fullData, setFullData] = useState<any[]>([]);

    const [userRatings, setUserRatings] = useState<{ [key: string]: number | undefined }>({});
    const [showRatingModal, setShowRatingModal] = useState(false);

    const [isFilterActive, setIsFilterActive] = useState(false);

    const [showAddModal, setShowAddModal] = useState(false);

    const [isMeat, setisMeat] = useState(false);

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
                weekStartDate: doc.weekStartDate ?? null,
                isMeat: doc.isMeat ?? false,
            }));
            setFullData(formattedData);
            setData(formattedData);
        } catch (error) {
            console.error("Fehler beim Laden der Rezepte:", error);
        }
    };

    
    useEffect(() => {
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
        let sorted = [...fullData]
        if(!isFilterActive){
            setIsFilterActive(true);

            sorted = sorted.sort((a, b) => {
                if (!a.weekStartDate) return 1;
                if (!b.weekStartDate) return -1;
                return new Date(a.weekStartDate).getTime() - new Date(b.weekStartDate).getTime();
            })
        } else {
            setIsFilterActive(false);
        }

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

    const saveMeal = async (recipe: any, date: Date, isMeat: Boolean) => {
        console.log("saveMeal()")
        if (!recipe || !date ) return;

        
       
        try {
            const weekStartDate = getWeekStartsDate(date);

            const weekDocs = await databases.listDocuments("6846fb7f00127239fdd7", "6846fb850031f9e6d717", [Query.equal("weekStartDate", weekStartDate)]);

            const meatCount = weekDocs.documents.filter(doc => doc.isMeat).length;

            const MAX_MEAT_PER_WEEK = 2;
            const willBeMeat = isMeat;
            const alreadyMeat = weekDocs.documents.some(doc => doc.title === recipe.name && doc.isMeat);

            const effectiveMeatCount = willBeMeat && !alreadyMeat ? meatCount + 1 : meatCount;

            if (effectiveMeatCount > MAX_MEAT_PER_WEEK) {
                Alert.alert("Zu viel Fleisch!", `Es gibt bereits ${MAX_MEAT_PER_WEEK} Fleischgericht(e) in dieser Woche`);
                return;
            }

            const dayNumber = date.getDay();
            const day = weekdays[dayNumber];
        
            const doc = await databases.listDocuments("6846fb7f00127239fdd7", "6846fb850031f9e6d717", [Query.equal("title", recipe.name)]);
            if (doc.total > 0){
                const exisingDoc = doc.documents[0];
                
                await databases.updateDocument(
                    "6846fb7f00127239fdd7", 
                    "6846fb850031f9e6d717",
                    exisingDoc.$id,
                    {
                        day: day,
                        weekStartDate: weekStartDate,
                        isMeat: isMeat,
                        mealTime: mealTime,
                    }
                )
                console.log("Bestehendes Rezept aktualisiert:", recipe.name, "→", day, weekStartDate);
            } else {
                await databases.createDocument("6846fb7f00127239fdd7", "6846fb850031f9e6d717", ID.unique(), {
                    day: day, 
                    title: recipe.name,
                    weekStartDate: weekStartDate,
                    isMeat: isMeat,
                    mealTime: mealTime,
                })
                console.log("Neues Rezept gespeichert:", recipe.name, "→", weekStartDate);
            }
        } catch (err) {
            console.error("Fehler beim Speichern der Mahlzeit:", err);
        }
    
        // Erst States zurücksetzen, dann Modal schließen
        setMealName("");
        setSelectedRecipe(null);
        setSelectedDate(null);
        closeAddModal();
    };
      
    const handleSelectRecipe = (item: any) => {
        setSelectedRecipe(item);
        setisMeat(item.isMeat !== undefined ? !!item.isMeat : false);
        openAddModal();
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
            return;
        }
        if (date) {
        setSelectedDate(date);
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

    const closeModal = () => {
        hideAddMeal();
        setIsFilterActive(false);
    }

    const openAddModal = () => {
        setShowAddModal(true);
    }

    const closeAddModal = () => {
        fetchRecipes();
        setShowAddModal(false);
    }

    const toggleIsMeat = () => setisMeat(value => !value);

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
                        <Ionicons name="search-outline" size={20} color="#ccc"/>
                        <TextInput
                            style={{marginLeft: 5, flex: 1}}
                            placeholder="Gericht suchen ..."
                            value={mealName}
                            onChangeText={setMealName}
                        />
                    </View>

                    <Pressable 
                        onPress={() => sortByOldest()} 
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            backgroundColor: "#1DC0AB",
                            borderColor: isFilterActive ? "#FF3E91" : "#fff",
                            borderWidth: 2,
                            opacity: 0.77,
                            borderRadius: 10,
                            marginTop: 15,
                            marginBottom: 15,
                            alignSelf: "flex-start"
                        }} 
                    >
                        <Text>Lange nicht gekocht</Text>
                    </Pressable>
                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <Pressable onPress={() => handleSelectRecipe(item)} style={styles.recipeItem} onLongPress={() => showUserRating(item)}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ flex: 1, left: 5 }}>{item.name}</Text>
                                    <View style={{ right: 5 }}>
                                        {typeof item.rating === "number" ? renderStars(item.rating) : renderStars(0)}
                                    </View>
                                </View>
                            </Pressable>
                        )}
                        style={{width: "100%"}}
                        ListFooterComponent={
                            <Pressable style={{ marginTop: 15 }} onPress={() => {
                                handleSelectRecipe({ name: mealName });
                            }}>
                                {mealName ? (
                                    <View style={{ flexDirection: "row", flex: 1 }}>
                                        <Ionicons name={"add-circle-outline"} size={20} color={"#049280"} />
                                        <Text style={{ color: "#049280", fontSize: 17, marginLeft: 5 }}>
                                            <Text style={{ fontWeight: "bold" }}>{mealName} </Text>hinzufügen
                                        </Text>
                                    </View>
                                ) : null}
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
                                    <Text style={{fontSize: 16, marginBottom: Platform.OS === "ios" ? 20 : -20}}>Schließen</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Modal>

                    <Modal animationType="slide" transparent={true} visible={showAddModal} onRequestClose={() => closeAddModal()}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.addModal}>
                                <Text style={styles.modalTitleAdd}>
                                    {selectedRecipe?.name ?? mealName}
                                </Text> 
                                
                                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: 20}}>
                                    <Text style={{fontWeight: "500", fontSize: 18}}>Datum: </Text>
                                    {Platform.OS === "android" ? (
                                        <>
                                            <Pressable onPress={() => {setShowDatePicker(true)}}>
                                                <View style={{alignItems: "center", borderRadius: 8, padding: 8, backgroundColor: "#E9E9E9"}}>
                                                    <Text style={{fontSize: 15}}>{selectedDate ? selectedDate.toLocaleString().split(",")[0] : "Datum auswählen"}</Text>
                                                </View> 
                                            </Pressable>
                                            {showDatePicker && (
                                                <DateTimePicker
                                                    value={selectedDate || new Date()}
                                                    mode="date"
                                                    display="default"
                                                    onChange={onDateChange}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <View>
                                            <DateTimePicker
                                                value={tempDate}
                                                mode="date"
                                                display="default"
                                                onChange={onDateChange}
                                                style={{backgroundColor: "white"}}
                                            />
                                        </View>
                                    )}
                                </View>
                                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: 15}}>
                                    <Text style={{fontWeight: "500", fontSize: 18}}>Fleisch: </Text>
                                    <Switch value={isMeat} onValueChange={toggleIsMeat} trackColor={{false: "#FF5D96", true: "#1DC0AB"}} thumbColor={"#4D94F3"} ios_backgroundColor={"#FF5D96"}/>
                                </View> 
                                 
                                <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: 15}}>
                                    <Text style={{fontWeight: "500", fontSize: 18}}>Tageszeit: </Text>
                                    <View style={{flexDirection: "row"}}>
                                        <Pressable
                                            onPress={() => setMealTime("Mittag")}
                                            style={{
                                                backgroundColor: mealTime === "Mittag" ? "#19055B" : "#E9E9E9",
                                                padding: 8,
                                                borderRadius: 8,
                                                marginRight: 8,
                                            }}
                                        >
                                            <Text style={{color: mealTime === "Mittag" ? "#fff" : "#333"}}>Mittag</Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => setMealTime("Abend")}
                                            style={{
                                                backgroundColor: mealTime === "Abend" ? "#19055B" : "#E9E9E9",
                                                padding: 8,
                                                borderRadius: 8,
                                            }}
                                        >
                                            <Text style={{color: mealTime === "Abend" ? "#fff" : "#333"}}>Abend</Text>
                                        </Pressable>
                                    </View>
                                </View>
                                
                                <View style={{flexDirection: "row", marginTop: 40, gap: 5}}>
                                    <Pressable onPress={() => closeAddModal()} style={styles.cancelAddButton}>
                                        <Text style={styles.buttonText}>Schließen</Text>
                                    </Pressable>
                                    <Pressable onPress={() => saveMeal(selectedRecipe || { name: mealName }, selectedDate, isMeat)} style={styles.addButton} disabled={!selectedDate || !(selectedRecipe?.name || mealName)}>
                                        <Text style={styles.buttonText}>Hinzufügen</Text>
                                    </Pressable> 
                                </View>
                            </View>
                        </View>
                    </Modal>

                    
                    <View style={{alignItems: "center", flexDirection: "row"}}>
                        <Pressable onPress={() => closeModal()} style={styles.cancelButton}>
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
        backgroundColor: "rgba(0,0,0,0.5)",
        flex: 1,
        justifyContent: "flex-end"
    },
    modalContent: {
        top: 50,
        backgroundColor: "white",
        padding: 30,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-end",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalTitleAdd: {
        fontSize: 25,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center"
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
        width: "100%",
        marginTop: 15,
        alignItems: "center",
        flexDirection: "row",
    },
    cancelButton: {
        backgroundColor: "#FF5D96",
        padding: 10,
        borderRadius: 10,
        width: "50%",
        marginBottom: Platform.OS === "ios" ? 80 : 50
    },
    cancelAddButton: {
        backgroundColor: "#FF5D96",
        padding: 10,
        borderRadius: 10,
        width: "50%",
        marginBottom: Platform.OS === "ios" ? 40 : 0
    },
    addButton: {
        backgroundColor: "#1DC0AB",
        padding: 10,
        borderRadius: 10,
        width: "50%",
        alignItems: "center",
        marginBottom: Platform.OS === "ios" ? 40 : 0
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
        backgroundColor: "white",
        padding: 30,
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        alignItems: "center",
        justifyContent: "flex-end"
    },
    addModal: {
        backgroundColor: "white",
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
        alignItems: "center",
        padding: 30,
        justifyContent: "flex-end",
    }
});
