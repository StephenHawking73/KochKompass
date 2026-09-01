import { View, Text, StyleSheet, TextInput, ScrollView, Platform, FlatList, Pressable, Alert } from 'react-native'
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
import { addMealToPlan, getMealLimitStatusForRecipe } from '@/services/mealService';
import { Difficulty, Meal, Recipe } from '@/types/types';
import DeleteRecipeModal from '@/components/modals/DeleteRecipeModal';
import { deleteRecipe } from '@/services/recipeService';
import { usePlanningStore } from '@/store/planningStore';
import { useAppAlert } from "@/providers/AlertProvider";

type Option = {
  label: string;
  value: SortOption;
}

export default function RecipiesScreen() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { showAlert } = useAppAlert();
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

  const planningSlotLabel = planningDate && planningMealType && planningPosition
    ? `${formatPlanningDate(planningDate)}, ${planningMealType === "lunch" ? "Mittag" : "Abend"}, Slot ${Number(planningPosition) + 1}`
    : null;

  const sortOptions: Option[] = [
    { label: "Beliebteste", value: "popular" },
    { label: "Schnellste", value: "fastest"},
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
    quickOnly: false,
    simple: false,
    middle: false,
    hard: false,
  });
  
  const [inputText, setInputText] = useState("");
  const favorites = useFavorites();

  const displayedMeals = useMemo(() => {
    const searched = recipes.filter((recipe) =>
      recipe.title.toLowerCase().includes(inputText.toLowerCase())
    );

    const filteredMeals = searched.filter((recipe) => {
      const matchesType =
        filters.type.length === 0 ||
        filters.type.includes(recipe.attribute) ||
        (
          filters.type.includes("vegetarian") &&
          recipe.attribute === "vegan"
        );

      const matchesFavorite =
        !filters.favoritesOnly ||
        (recipe.id ? favorites.favorites.has(recipe.id) : false);

      const matchesQuick =
        !filters.quickOnly ||
        (recipe.duration ?? Infinity) < 30;

      const selectedDifficulties = [
        filters.simple ? "Einfach" : null,
        filters.middle ? "Mittel" : null,
        filters.hard ? "Schwer" : null,
      ].filter((value): value is Difficulty => value !== null);

      const matchesDifficulty =
        selectedDifficulties.length === 0 ||
        (recipe.difficulty != null && selectedDifficulties.includes(recipe.difficulty));

      const matchesNeverCooked =
        sortBy !== "neverCooked" ||
        recipe.last_cooked_at === null;

      return (
        matchesType &&
        matchesFavorite &&
        matchesQuick &&
        matchesDifficulty &&
        matchesNeverCooked
      );
    });

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

        case "fastest":
          return (a.duration ?? Infinity) - (b.duration ?? Infinity);

        default:
          return 0;
      }
    });
  }, [recipes, inputText, filters, sortBy, favorites.favorites]);

  const count = displayedMeals.length;

  const handleExitPlanningMode = () => {
    clearPlanningMode();
    router.replace("/recipes");
  };

  const handleRecipeLongPress = (recipe: Recipe) => {
    if (planningBlocked) {
      showAlert({
        title: "Planungsmodus aktiv",
        message: "Beende zuerst den Planungsmodus, bevor du ein Rezept löschst oder erneut ein Rezept auswählst.",
      });
      return;
    }

    router.push({
      pathname: "/(tabs)",
      params: {
        planningRecipeId: recipe.id,
        planningRecipeTitle: recipe.title,
      },
    });
  };

  const handleRecipePress = async (recipeId: string) => {
    if (!isPlanningMode || !planningDate || !planningMealType || planningPosition == null) {
      router.push({pathname: "/recipe/[id]", params: { id: recipeId }});
      return;
    }

    const proceedWithPlanning = async () => {
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
        const message = error instanceof Error && error.message ? error.message : "Das Rezept konnte nicht in den Plan übernommen werden.";
        showAlert({
          title: "Einplanen fehlgeschlagen",
          message,
        });
      }
    };

    try {
      const status = await getMealLimitStatusForRecipe(recipeId, planningDate);

      if (status.exceedsLimit && status.limit != null) {
        const wouldBe = status.currentCount + 1;
        showAlert({
          title: "Fleischlimit erreicht",
          message: `Du hast bereits ${status.currentCount} von ${status.limit} Fleischgerichten in dieser Woche geplant. Wenn du noch eines einplanst, wären es ${wouldBe}. Möchtest du wirklich mehr Fleisch in der Woche machen?`,
          actions: [
            { text: "Abbrechen", style: "cancel" },
            { text: "Trotzdem einplanen", style: "destructive", onPress: proceedWithPlanning },
          ],
        });
        return;
      }

      await proceedWithPlanning();
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : "Die Planungsprüfung konnte nicht abgeschlossen werden.";
      showAlert({
        title: "Planungsprüfung fehlgeschlagen",
        message,
      });
      await proceedWithPlanning();
    }
  };

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { planningRecipeId: activePlanningRecipeId, clearPlanningMode } = usePlanningStore();
  const planningBlocked = isPlanningMode || Boolean(activePlanningRecipeId);

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
          <View style={styles.modeContent}>
            {icons.calendar({ color: theme.accent.primary, size: 16 })}
            
            <Text style={styles.modeLabel} numberOfLines={1}>
              Rezept auswählen
            </Text>

            <Pressable
              style={styles.closeModeButton}
              onPress={handleExitPlanningMode}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {icons.close({ color: theme.text.op, size: 13 })}
            </Pressable>
          </View>
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
          <MealCardList
            recipe={item}
            favorites={favorites.favorites}
            toggleFavorite={favorites.toggle}
            onPress={() => {
              if (item.id) {
                handleRecipePress(item.id);
              }
            }}
            onLongPress={() => handleRecipeLongPress(item)}
            onDoublePress={() => {
              if (!planningBlocked) {
                setSelectedRecipe(item);
              }
            }}
          />
        )}
        showsVerticalScrollIndicator={false}
      />    

      <DeleteRecipeModal
        visible={selectedRecipe !== null && !planningBlocked}
        mealTitle={selectedRecipe?.title ?? ""}
        loading={deleting}
        onClose={() => setSelectedRecipe(null)}
        onDelete={async () => {

          if (!selectedRecipe)
            return;

          if (planningBlocked) {
            setSelectedRecipe(null);
            showAlert({
              title: "Löschen gesperrt",
              message: "Beende den Planungsmodus, bevor du ein Rezept löschst.",
            });
            return;
          }

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
      marginTop: 14,
      marginBottom: 12,
      borderRadius: 10,
      backgroundColor: theme.accent.op,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    modeContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    modeLabel: {
      color: theme.text.primary,
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
    },

    closeModeButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.card.background + "40",
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

function formatPlanningDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}
