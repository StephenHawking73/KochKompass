import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Linking, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { account, databases } from "../api/appwriteConfig";

export type RecipeEntry = {
    id: string;
    date: string;
    day: string;
    image?: any;
    title?: string;
    rating?: number;
    mealTime: string;
    from?: string;
};

type Props = {
    data: RecipeEntry[];
    onRefresh: () => Promise<void>;
}

const dayImageMap: { [key: string]: any } = {
    Montag: require('@/assets/images/Wochentage/montag.png'),
    Dienstag: require('@/assets/images/Wochentage/dienstag.png'),
    Mittwoch: require('@/assets/images/Wochentage/mittwoch.png'),
    Donnerstag: require('@/assets/images/Wochentage/donnerstag.png'),
    Freitag: require('@/assets/images/Wochentage/freitag.png'),
    Samstag: require('@/assets/images/Wochentage/samstag.png'),
    Abend: require('@/assets/images/Wochentage/abend.png'),
    Sonntag: require('@/assets/images/Wochentage/sonntag.png'),
};

const WeekList: React.FC<Props> = ({ data, onRefresh }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<RecipeEntry | null>(null);
    const [userRating, setUserRating] = useState<number>(0);

    const [refreshing, setRefreshing] = useState(false);

    const openModal = (item: any) => {
        console.log("Title: " + item.title)
        setModalVisible(true);
        setUserRating(userRating);
        setSelectedRecipe(item);
    }

    const closeModal = async () => {
        if (selectedRecipe?.title !== undefined){
            await submitRating();
        }
        setModalVisible(false);
        setSelectedRecipe(null);
    }

    const deleteDateFromRecipe = async (recipe: RecipeEntry) => {
        try {
            await databases.updateDocument(
                "6846fb7f00127239fdd7",   
                "6846fb850031f9e6d717",   
                recipe.id,
                {
                    day: null,
                    weekStartDate: null,
                }
            );
            closeModal();
            await onRefresh();
        } catch (error) {
            console.error("Fehler beim Löschen des Datums:", error);
        }
    };

    const renderInteractiveStars = (rating: number, onPress: (rating: number) => void) => {
        const stars = []

        for (let i = 1; i <= 5; i++) {
            const iconName = i <= rating ? "star" : "star-outline";
            stars.push(
                <TouchableOpacity key={i} onPress={() => onPress(i)}>
                    <Ionicons name={iconName} size={30} color="#FFD700" />
                </TouchableOpacity>
            );
        } 

        return <View style={{ flexDirection: "row", justifyContent: "center", marginVertical: 10, marginBottom: 20 }}>{stars}</View>;
    }

    const userRatingFieldMap: { [userId: string]: string } = {
        "6846d868b53e7f4935a7": "Tanja",
        "6846d48f633f43980c5f": "Anouk",
        "6846d08e35ac0c2b8fe4": "Frank",
        "6845d8fe0031159c8245": "Aaron",
    };

    const submitRating = async () => {
        if (!selectedRecipe) {
            console.log("No Recipe");
            return;
        }
    
        try {
            const user = await account.get();
            const userId = user.$id;
    
            const ratingField = userRatingFieldMap[userId];
    
            if (!ratingField) {
                console.error("User nicht berechtigt zu bewerten.");
                return;
            }
            
            if (userRating != 0){
                // Rating speichern
                await databases.updateDocument(
                    "6846fb7f00127239fdd7",
                    "6846fb850031f9e6d717",
                    selectedRecipe.id,
                    {
                        [ratingField]: userRating,
                    }
                );
        
                // Durchschnitt berechnen
                const doc = await databases.getDocument(
                    "6846fb7f00127239fdd7",
                    "6846fb850031f9e6d717",
                    selectedRecipe.id
                );

                const ratings = [
                    doc.Anouk,
                    doc.Aaron,
                    doc.Tanja,
                    doc.Frank,
                ].filter((r) => typeof r === "number");
        
                const avg = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
        
                // Average speichern
                await databases.updateDocument(
                    "6846fb7f00127239fdd7",
                    "6846fb850031f9e6d717",
                    selectedRecipe.id,
                    {
                        averageRating: avg,
                    }
                );
                console.log("Bewertung gespeichert!");
            }

            await onRefresh();
        } catch (error) {
            console.error("Fehler beim Speichern der Bewertung:", error);
        }
    };

    const getUserRating = async (): Promise<number> => {
        if (!selectedRecipe) return 0;
        if (selectedRecipe.title == undefined) return 0;

        try{
            const user = await account.get();
            const userName = user.name;

            const doc = await databases.getDocument("6846fb7f00127239fdd7", "6846fb850031f9e6d717", selectedRecipe.id)
            
            const users: { [key: string]: number | undefined } = {
                Anouk: doc.Anouk,
                Aaron: doc.Aaron,
                Tanja: doc.Tanja,
                Frank: doc.Frank,
            };
    
            const userRating = users[userName] ?? 0;
            return userRating;
        } catch (err){
            console.log("Error getUserRating()", err);
            return 0;
        }
    }

    useEffect(() => {
        const fetchUserRating = async () => {
            if (!selectedRecipe) {
                setUserRating(0);
                return;
            }
            const rating = await getUserRating();
            setUserRating(rating);
        }
        fetchUserRating();
    }, [selectedRecipe])

    const groupedByDay: { [day: string]: { Mittag?: RecipeEntry; Abend?: RecipeEntry } } = {};
    data.forEach((entry) => {
        if (!groupedByDay[entry.day]) groupedByDay[entry.day] = {};
        groupedByDay[entry.day][entry.mealTime as "Mittag" | "Abend"] = entry;
    });
    const days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

    return (
        <>
            <FlatList
                data={days}
                keyExtractor={(day) => day}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator = {false}
                refreshing={refreshing}
                onRefresh={async () => {
                    setRefreshing(true);
                    await onRefresh();
                    setRefreshing(false);
                }}
                renderItem={({ item: day }) => {
                    const mittag = groupedByDay[day]?.Mittag;
                    const abend = groupedByDay[day]?.Abend;
                    return (
                        <View key={day} style={styles.dayRow}>
                            <Image source={dayImageMap[day]} style={styles.dayImage} />
                            <View style={styles.mealSlots}>
                                {/* Mittag */}
                                <Pressable
                                    style={styles.mealSlot}
                                    onPress={() => mittag?.title && openModal(mittag)}
                                    disabled={!mittag?.title}
                                >
                                    <Text style={styles.mealLabel}>🍽️ Mittag</Text>
                                    {mittag?.title ? (
                                        <Text style={styles.recipeTitle}>{mittag.title}</Text>
                                    ) : (
                                        <Text style={styles.noRecipe}>–</Text>
                                    )}
                                </Pressable>
                                {/* Abend */}
                                <Pressable
                                    style={styles.mealSlot}
                                    onPress={() => abend?.title && openModal(abend)}
                                    disabled={!abend?.title}
                                >
                                    <Text style={styles.mealLabel}>🌙 Abend</Text>
                                    {abend?.title ? (
                                        <Text style={styles.recipeTitle}>{abend.title}</Text>
                                    ) : (
                                        <Text style={styles.noRecipe}>–</Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    );
                }}
            />

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => closeModal()}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {selectedRecipe?.day} - {selectedRecipe?.title || "Kein Gericht"}
                        </Text>

                        
                        {selectedRecipe?.from ? (
                            (() => {
                                // Check if it's a valid URL (starts with http/https)
                                const isUrl = /^https?:\/\//i.test(selectedRecipe.from);
                                const displayText = selectedRecipe.from.replace(/(\.de|\.com|\.net|\.org|\.info|\.io|\.co|\.app|\.at|\.eu|\.fr|\.it|\.es|\.nl|\.ru|\.uk|\.us|\.biz|\.tv|\.me|\.xyz).*/i, "$1");
                                if (isUrl) {
                                    return (
                                        <View style={{flexDirection: "row", alignItems: "center"}}>
                                            <Text style={{color: "#5E596E", fontSize: 15, fontStyle: "italic"}}>Gefunden: </Text>
                                            <Text
                                                style={{color: "#1DC0AB", fontSize: 15, fontStyle: "italic", fontWeight: "bold", textDecorationLine: "underline"}}
                                                onPress={() => {
                                                    Linking.openURL(selectedRecipe.from || "");
                                                }}
                                            >
                                                {displayText}
                                            </Text>
                                        </View>
                                    );
                                } else {
                                    return (
                                        <View style={{flexDirection: "row", alignItems: "center"}}>
                                            <Text style={{color: "#5E596E", fontSize: 15, fontStyle: "italic"}}>Gefunden: </Text>
                                            <Text style={{color: "#5E596E", fontSize: 15, fontStyle: "italic", fontWeight: "bold"}}>{displayText}</Text>
                                        </View>
                                    );
                                }
                            })()
                        ) : null}
                        
                        {selectedRecipe?.title !== undefined ? (
                            <View style={{alignItems: "center"}}>
                                <Text style={styles.modalSubtitle}>
                                    Bewertung abgeben: 
                                </Text>
                                {renderInteractiveStars(userRating, setUserRating)}
                            </View>
                        ) : (
                            <View style={{marginTop: 50}}/>
                        )}

                        <Pressable onPress={() => deleteDateFromRecipe(selectedRecipe)} style={styles.deleteButton}>
                            <Text style={styles.closeButtonText}>Löschen</Text>
                        </Pressable>

                        <Pressable onPress={() => closeModal()} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>Schließen</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    );
};



const styles = StyleSheet.create({
    listContainer: {
        marginHorizontal: 20,
        paddingBottom: 500,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    dayImage: {
        width: 40,
        height: 40,
        marginRight: 16,
        borderRadius: 8,
    },
    textContainer: {
        flex: 1,  // nimmt verfügbaren Platz
    },
    recipeTitle: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: "center",
        marginTop: 8,
    },
    noRecipe: {
        fontSize: 16,
        fontStyle: 'italic',
        color: '#888',
    },
    ratingContainer: {
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        minHeight: 200,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    modalSubtitle: {
        fontSize: 16,
        marginTop: 20,
    },
    closeButton: {
        backgroundColor: '#1DC0AB',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    deleteButton: {
        backgroundColor: '#FF5D96',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 10,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    dayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: "#f8f8f8",
        borderRadius: 12,
        padding: 8,
    },
    mealSlots: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 10,
    },
    mealSlot: {
        flex: 1,
        alignItems: 'center',
        justifyContent: "center",
        marginHorizontal: 5,
        padding: 8,
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    mealLabel: {
        fontSize: 13,
        color: "#888",
        marginBottom: 2,
    },
});

export default WeekList;