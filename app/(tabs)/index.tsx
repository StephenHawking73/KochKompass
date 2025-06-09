import { useAuth } from "@/src/context/AuthContext";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";


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
    
    return (
      <View style= {{flex: 1, backgroundColor: "#fff"}}>
        <Text style={styles.greeting}>{greeting}, {user.name} 👋</Text>
        <ScrollView>
          
        </ScrollView>
      </View>    
    )
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 30,
    marginTop: 80,
  }
})