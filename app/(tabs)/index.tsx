import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";

export default function Home() {

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
        <SafeAreaView>
            <Text style={styles.greeting}>{greeting}</Text>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 30,
    marginTop: 20,
  }
})