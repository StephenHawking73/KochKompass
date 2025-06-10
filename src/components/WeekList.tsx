import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { account, databases } from "../api/appwriteConfig";

export type RecipeEntry = {
    id: string;
    date: string;
    day: string;
    image?: any;
    title?: string;
    rating?: number;
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
    const [recipeData, setRecipeData] = useState<RecipeEntry[]>(data);
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

    const fetchRecipeData = async () => {
        try {
            // Hier holst du alle deine Dokumente erneut (z.B. aus Appwrite Collection)
            const response = await databases.listDocuments(
                "6846fb7f00127239fdd7",
                "6846fb850031f9e6d717"
            );
    
            // In dein Format umwandeln
            const updatedData: RecipeEntry[] = response.documents.map((doc: any) => ({
                id: doc.$id,
                date: doc.date,
                day: doc.day,
                image: doc.image,
                title: doc.title,
                rating: doc.averageRating ?? 0,   // wichtig: avgRating!
            }));
    
            setRecipeData(updatedData);
        } catch (error) {
            console.error("Fehler beim Laden der Daten:", error);
        }
    };
    

    const renderItem = ({ item }: { item: RecipeEntry }) => {
        return (
            <Pressable onPress={() => openModal(item)}>
                <View style={styles.row}>
                    <Image source={dayImageMap[item.day]} style={styles.dayImage} />
                    
                    <View style={styles.textContainer}>
                        {item.title ? (
                            <Text style={styles.recipeTitle}>{item.title}</Text>
                        ) : (
                            null
                        )}
                    </View>

                    <View style={styles.ratingContainer}>
                        {typeof item.rating === "number" ? renderStars(item.rating) : null}
                    </View>
                </View>
            </Pressable>
            
        );
    };

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
        console.log("submitRating() called", selectedRecipe?.id, userRating);

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
            
            await onRefresh();
            console.log("Bewertung gespeichert!");
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

    return (
        <>
            <FlatList
                data={data}
                keyExtractor={(item) => item.day}
                renderItem={renderItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator= {false}
                refreshing = {refreshing}
                onRefresh={async () => {
                    setRefreshing(true);
                    await onRefresh();
                    setRefreshing(false);
                }}
            />

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => closeModal()}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {selectedRecipe?.day} - {selectedRecipe?.title || "Kein Gericht"}
                        </Text>

                        
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
                        

                        {/* Hier später User Ratings anzeigen */}

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
        marginTop: 30,
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
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 16,
        marginTop: 10
    },
    closeButton: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 30,
    },
    closeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default WeekList;