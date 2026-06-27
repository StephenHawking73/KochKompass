import { View, Text, StyleSheet, TextInput, ScrollView, Platform, FlatList } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/hooks/useTheme';
import { useMeals } from '@/hooks/useMeals';
import { icons } from '@/assets/icons';
import MealCardList from '@/components/mealCardList';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecipes } from '@/hooks/useRecipes';

export default function Ratings() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const { recipes, loading: loadingRecipes } = useRecipes();    
  
  const [inputText, setInputText] = useState("");

  const filteredMeals = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(inputText.toLowerCase())
  );

  const favorites = useFavorites();

  return (
    <SafeAreaView style={{flex: 1, paddingHorizontal: 30, backgroundColor: theme.background}}>
      {/* Title */}
      <Text style={styles.title}>Rezepte</Text>

      {/* Search */}
      <View style={styles.searchBar}>
        {icons.search({ color: theme.text.primary, marginLeft: 17, })}      
        <TextInput style={styles.inputField} placeholder='Rezepte suchen...' onChangeText={setInputText} value={inputText}/>  
      </View>

      {/* Liste */}
      <FlatList
        data={filteredMeals}
        keyExtractor={(item: any) => item.id}
        numColumns={2}
        columnWrapperStyle={{
          gap: 15,
          marginBottom: 15,
        }}
        contentContainerStyle={{
          paddingTop: 20,
          paddingBottom: 80,
          marginTop: 20,
        }}
        renderItem={({ item }) => (
          <MealCardList recipe={item} favorites={favorites.favorites} toggleFavorite={favorites.toggle}/>
        )}
        showsVerticalScrollIndicator={false}
      />    
    </SafeAreaView>
  )
}

const createStyles = (theme: any) => 
  StyleSheet.create({
    title: {
      fontSize: 30,
      fontWeight: "700",
      color: theme.text.primary,
      marginTop: 20,
    },

    searchBar: {
      height: 45,
      marginTop: 20,

      borderRadius: 12,
      borderColor: theme.searchBar.border,
      borderWidth: 0.5,

      backgroundColor: theme.searchBar.background,

      flexDirection: "row",
      alignItems: "center",
    },

    inputField: {
      flex: 1,

      marginHorizontal: 10,
      color: theme.text.op,
    },
})