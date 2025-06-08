import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";


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
      <View style= {{flex: 1, backgroundColor: "#fff"}}>
        <Text style={styles.greeting}>{greeting}, Aaron 👋</Text>
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