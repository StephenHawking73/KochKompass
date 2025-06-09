import { databases } from "@/src/api/appwriteConfig";
import { useAuth } from "@/src/context/AuthContext";
import { getWeekRange } from "@/src/utils/getWeekRange";
import { Query } from "appwrite";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

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
    


    const [currentDate, setCurrentDate] = useState(new Date());
    const [recipes, setRecipes] = useState([]);

    useEffect(() => {
      const loadRecipes = async () => {
        const { start } = getWeekRange(currentDate);
        const weekStartDate = start.toISOString().split("T")[0];
        const data = await getRecipesForWeek(weekStartDate);
        setRecipes(data);
      };

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
          <Pressable onPress={handlePrevWeek}>
            <Image source={require("@/assets/images/back.png")} style={{width: 18, height: 18}}/>
          </Pressable>
          
          <Text style={styles.week}>{`${formatDate(start)} - ${formatDate(end)}`}</Text>

          <Pressable onPress={handleNextWeek}>
            <Image source={require("@/assets/images/next.png")} style={{width: 18, height: 18}}/>
          </Pressable>
        </View>
        
        <View>
          {recipes.length === 0 ? (
            <Image source={require("@/assets/images/NoResult.jpg")}/>
          ) : (
            recipes.map((recipe) => (
              <View key={recipe.$id}>
                <Text>{recipe.title}</Text>
              </View>
            ))
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
    marginHorizontal: 5,
  }
})