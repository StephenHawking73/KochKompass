import { View, Text, StyleSheet, TextInput, ScrollView, Platform, FlatList } from 'react-native'
import React, { useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '@/hooks/useTheme';
import { useMeals } from '@/hooks/useMeals';
import { icons } from '@/assets/icons';
import MealCardList from '@/components/mealCardList';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecipes } from '@/hooks/useRecipes';
import { FilterState, SortOption } from '@/types/recipeFilters';
import RecipeFilterBar from '@/components/Filter/RecipeFilterBar';
import SortDropdown from '@/components/SortDropdown';

type Option = {
  label: string;
  value: SortOption;
}

export default function RecipiesScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);

  const sortOptions: Option[] = [
    { label: "Beliebteste", value: "popular" },
    { label: "A-Z", value: "az" },
    { label: "Z-A", value: "za" },
    { label: "Lange nicht gekocht", value: "lastCooked" },
    { label: "Noch nie gekocht", value: "neverCooked" },
    { label: "Neu hinzugefügt", value: "new" },
  ];

  const { recipes, loading: loadingRecipes, refresh } = useRecipes();  
  
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [filters, setFilters] = useState<FilterState>({
    type: "all",
    favoritesOnly: false,
  });
  
  const [inputText, setInputText] = useState("");
  const favorites = useFavorites();

  const displayedMeals = useMemo(() => {
    const searched = recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(inputText.toLowerCase())
    );

    const filteredMeals = searched.filter((recipe) => {
      const matchesType = filters.type === "all" || recipe.attribute === filters.type;

      const matchesFavorite = !filters.favoritesOnly || favorites.favorites.has(recipe.id);

      const matchesNeverCooked = sortBy !== "neverCooked" || recipe.last_cooked_at === null;

      return matchesType && matchesFavorite && matchesNeverCooked;
    })

    return [...filteredMeals].sort((a, b) => {
      switch (sortBy) {
        case "az":
          return a.title.localeCompare(b.title);

        case "za":
          return b.title.localeCompare(a.title);

        case "popular":
          return (b.rating ?? 0) - (a.rating ?? 0);

        case "lastCooked":
          if (!a.last_cooked_at && !b.last_cooked_at) return 0;
          if (!a.last_cooked_at) return 1;
          if (!b.last_cooked_at) return -1;

          const timeA = new Date(a.last_cooked_at).getTime();
          const timeB = new Date(b.last_cooked_at).getTime();

          return timeA - timeB;

        case "new":
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          );

        default:
          return 0;
      }
    });
  }, [recipes, inputText, filters, sortBy, favorites.favorites]);

  const count = displayedMeals.length;

  return (
    <SafeAreaView style={{flex: 1, paddingHorizontal: 30, backgroundColor: theme.background}}>
      {/* Title */}
      <Text style={styles.title}>Rezepte</Text>

      {/* Search */}
      <View style={styles.searchBar}>
        {icons.search({ color: theme.text.primary, marginLeft: 17, })}      
        <TextInput style={styles.inputField} placeholder='Rezepte suchen...' onChangeText={setInputText} value={inputText}/>  
      </View>

      {/* Filter */}
      <View style={{marginTop: 15, }}>
        <RecipeFilterBar filters={filters} setFilters={setFilters}/>
      </View>

      {/* List */}
      <View style={{marginTop: 20}}/>
      <FlatList
        data={displayedMeals}
        keyExtractor={(item: any) => item.id}
        numColumns={2}
        refreshing={loadingRecipes}
        onRefresh={refresh}
        columnWrapperStyle={{
          gap: 15,
          marginBottom: 20,
        }}
        ListHeaderComponent={
          <View style={{flexDirection: "row", justifyContent: "space-between", alignItems: "center",}}>
            {/* Count */}
            <Text style={styles.countText}>
              {count === recipes.length
                ? `${recipes.length} ${
                    recipes.length === 1 ? "Gericht" : "Gerichte"
                  }`
                : `${count} von ${recipes.length} Gerichten`
              } 
            </Text>

            {/* Order */}
            <SortDropdown value={sortBy} onChange={setSortBy} options={sortOptions}/>
          </View>
        }
        ListHeaderComponentStyle={{
          marginBottom: 20,
          zIndex: 100,
          overflow: "visible",
        }}
        contentContainerStyle={{
          paddingBottom: 80,
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

    countText: {
      color: theme.text.op,
      fontSize: 14,
      fontWeight: 400,
    }
})