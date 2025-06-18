import { databases } from "@/src/api/appwriteConfig";
import WeekList, { RecipeEntry } from "@/src/components/WeekList";
import { useAuth } from "@/src/context/AuthContext";
import { getWeekRange } from "@/src/utils/getWeekRange";
import { Query } from "appwrite";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";


export default function Home() {
    const { user } = useAuth();
    if (!user) return null; // Ensure user is defined before accessing properties

    // Determine the greeting based on the current time
    const [greeting, setGreeting] = useState('Hallo');
    useEffect(() => {
        const getCurrentGreeting = () => {
            const hour = new Date().getHours();
      
            if (hour < 12) {
              return 'Guten Morgen';
            } else if (hour < 18) {
              return 'Guten Tag';
            } else{
              return 'Guten Abend';
            }
          }
      
        setGreeting(getCurrentGreeting());
    }, []);

    useEffect(() => {
      async function checkForUpdate() {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        } catch (e) {
          Alert.alert("Update failed: ", e);
        }
      }
    
      checkForUpdate();
    }, []);


    const [currentDate, setCurrentDate] = useState(new Date());
    const [recipes, setRecipes] = useState<RecipeEntry[]>([]);
    
    const weekdays = [
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
      "Sonntag"
    ];

    const mealTimes = ["Mittag", "Abend"];
  
    const weekEntries = weekdays.flatMap((weekday) =>
      mealTimes.map((mealTime) => {
        const recipeForSlot = recipes.find(
          (recipe) => recipe.day === weekday && recipe.mealTime === mealTime
        );
        return {
          id: recipeForSlot?.id ?? "",
          date: recipeForSlot?.date ?? "",
          day: weekday,
          title: recipeForSlot?.title,
          rating: recipeForSlot?.rating,
          image: recipeForSlot?.image ?? null,
          mealTime,
        };
      })
    );
  

    const loadRecipes = async () => {
      const { start } = getWeekRange(currentDate);
      const pad = (n: number) => n.toString().padStart(2, '0');
      const weekStartDate = `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`;
  
      const data = await getRecipesForWeek(weekStartDate);
  
      const formattedData = data.map((item) => ({
        id: item.$id,
        date: item.weekStartDate || '',
        day: item.day,
        title: item.title,
        rating: item.averageRating,
        image: null,
        mealTime: item.mealTime,
      }));
  
      setRecipes(formattedData);
    };

    useEffect(() => {
      loadRecipes();
    }, [currentDate]);

    const handlePrevWeek = () => {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }

    const handleNextWeek = () => {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }

    const { start, end } = getWeekRange(currentDate);
    const formatDate = (date: Date) => {
      return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
    }

    const getRecipesForWeek = async (weekStartDate: string) => {
      try {
        const response = await databases.listDocuments(
          "6846fb7f00127239fdd7", "6846fb850031f9e6d717", [Query.equal("weekStartDate", weekStartDate)]
        );
        return response.documents;
      } catch (err) {
        console.log(err);
        return [];
      }
    };

    return (
      <View style= {{flex: 1, backgroundColor: "#fff"}}>
        <Text style={styles.greeting}>{greeting}, {user.name} 👋</Text>
        
        <View style={styles.weekSelector}>
          <Pressable onPress={handlePrevWeek} style={{height: 50, width: 50}}>
            <Image source={require("@/assets/images/back.png")} style={{width: 18, height: 18}}/>
          </Pressable>
          
          <Text style={styles.week}>{`${formatDate(start)} - ${formatDate(end)}`}</Text>

          <Pressable onPress={handleNextWeek} style={{height: 50, width: 50, marginLeft: 155}}>
            <Image source={require("@/assets/images/next.png")} style={{width: 18, height: 18}}/>
          </Pressable>
        </View>
        
        <View>
          {recipes.length === 0 ? (
            <View style={{position: "absolute"}}>
              <Image source={require("@/assets/images/NoResult.jpg")}/>
            </View>
          ) : (
            <WeekList data={weekEntries} onRefresh={loadRecipes}/>
          )}
        </View>
      </View> 
    )
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 30,
    marginTop: 80,
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 30,
    marginTop: 50,
  },
  week:{
    fontSize: 15,
    fontWeight: "semibold",
    position: "absolute",
    left: 25,
    bottom: 32,
  }
})