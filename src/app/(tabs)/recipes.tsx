import { View, Text, StyleSheet, TextInput, ScrollView, Platform, FlatList, Pressable } from 'react-native'
import React, { useCallback, useMemo, useState } from 'react'
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
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { addMealToPlan } from '@/services/mealService';
import { Meal, Recipe } from '@/types/types';
import DeleteMealSheet from '@/components/modals/DeleteMealModal';
import { deleteRecipe } from '@/services/recipeService';

type Option = {
  label: string;
  value: SortOption;
}

export default function RecipiesScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const params = useLocalSearchParams<{
    planningDate?: string;
    planningMealType?: Meal["meal_type"];
    planningPosition?: string;
  }>();
  const planningDate = getParam(params.planningDate);
  const planningMealType = getParam(params.planningMealType);
  const planningPosition = getParam(params.planningPosition);
  const isPlanningMode =
    Boolean(planningDate) &&
    (planningMealType === "lunch" || planningMealType === "dinner") &&
    planningPosition != null;

  const sortOptions: Option[] = [
    { label: "Beliebteste", value: "popular" },
    { label: "A-Z", value: "az" },
    { label: "Z-A", value: "za" },
    { label: "Lange nicht gekocht", value: "lastCooked" },
    { label: "Noch nie gekocht", value: "neverCooked" },
    { label: "Neu hinzugefügt", value: "new" },
  ];

  const { recipes, loading: loadingRecipes, refresh } = useRecipes(); 
  
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    favoritesOnly: false,
  });
  
  const [inputText, setInputText] = useState("");
  const favorites = useFavorites();

  const displayedMeals = useMemo(() => {
    const searched = recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(inputText.toLowerCase())
    );

    const filteredMeals = searched.filter((recipe) => {
      const matchesType = filters.type.length === 0 || filters.type.includes(recipe.attribute) || (
        filters.type.includes("vegetarian") && recipe.attribute === "vegan"
      );

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

  const handleExitPlanningMode = () => {
    router.replace("/recipes");
  };

  const handleRecipePress = async (recipeId: string) => {
    if (!isPlanningMode || !planningDate || !planningMealType || planningPosition == null) {
      router.push({pathname: "/recipe/[id]", params: { id: recipeId }});
      return;
    }

    try {
      const result = await addMealToPlan(
        recipeId,
        planningDate,
        planningMealType,
        Number(planningPosition)
      );

      if (result?.error) {
        throw result.error;
      }

      router.replace("/recipes");
      requestAnimationFrame(() => {
        router.replace({
          pathname: "/",
          params: {
            focusDate: planningDate,
            plannedAt: String(Date.now()),
          },
        });
      });
    } catch (error) {
      console.error("recipe planning failed", error);
    }
  };

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState(false);

  return (
    <SafeAreaView style={{flex: 1, paddingHorizontal: 30, backgroundColor: theme.background}}>
      {/* Add button */}
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Rezepte</Text>

        <Pressable 
          style={styles.addButton}
          onPress={() => {
            router.push({
              pathname: "/recipe/edit",
              params: {}
            });
          }}
        >
          <Text style={styles.addPlus}>+</Text>
        </Pressable>
      </View>
      

      {isPlanningMode && (
        <View style={styles.modeBanner}>
          <View style={styles.modeHeader}>
            <View style={styles.modeTitleRow}>
              {icons.calendar({ color: theme.accent.primary, size: 17 })}
              <Text style={styles.modeTitle}>Rezept für den Slot auswählen</Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={handleExitPlanningMode}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {icons.close({ color: theme.text.op, size: 15 })}
            </Pressable>
          </View>
          <Text style={styles.modeText}>Die Auswahl wird direkt in den Speiseplan eingetragen.</Text>
        </View>
      )}

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
          <MealCardList recipe={item} favorites={favorites.favorites} toggleFavorite={favorites.toggle} onPress={() => handleRecipePress(item.id)} onLongPress={() => setSelectedRecipe(item)}/>
        )}
        showsVerticalScrollIndicator={false}
      />    

      <DeleteMealSheet
        visible={selectedRecipe !== null}
        mealTitle={selectedRecipe?.title ?? ""}
        loading={deleting}
        onClose={() => setSelectedRecipe(null)}
        onDelete={async () => {

          if (!selectedRecipe)
            return;

          setDeleting(true);

          try {

            // deine delete Funktion
            const { error } = await deleteRecipe(selectedRecipe.id);

            if (error)
              throw error;


            setSelectedRecipe(null);

            refresh();

          } finally {

            setDeleting(false);

          }

        }}
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

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
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
    },

    modeBanner: {
      marginTop: 22,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.accent.primary + "55",
      backgroundColor: theme.accent.op,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },

    modeHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },

    modeTitle: {
      color: theme.text.primary,
      fontSize: 15,
      fontWeight: "700",
    },

    modeTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexShrink: 1,
    },

    closeButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.card.background,
    },

    modeText: {
      color: theme.text.op,
      fontSize: 13,
      fontWeight: "500",
      marginTop: 3,
    },

    addButton: {
      backgroundColor: theme.accent.primary,
      width: 42,
      height: 42,
      borderRadius: 21,

      alignItems: "center",
      justifyContent: "center",
    },

    addPlus: {
      color: "white",
      fontSize: 28,
      fontWeight: "500",
      marginTop: -2,
    }
})

function getParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}
