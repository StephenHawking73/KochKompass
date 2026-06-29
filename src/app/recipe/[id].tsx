import { View, Text, ScrollView, Image, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";
import { useFavorites } from "@/hooks/useFavorites";
import { LoadingScreen } from "@/components/loadingScreen";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const styles = createStyles(theme);

  const { favorites, loading, toggle } = useFavorites();

  const recipeId = Array.isArray(id) ? id[0] : id;
  const isFavorite = favorites.has(recipeId);

  const [recipe, setRecipe] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: recipeData } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      setRecipe(recipeData);
    };

    load();
  }, [id]);

  if (!recipe) return null;

  return (
    <View style={styles.container}>
        <View style={styles.headerOverlay}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
                {icons.back({ color: theme.text.primary })}
            </Pressable>

            <Pressable style={styles.iconButton} onPress={() => toggle(recipeId)}>
                {isFavorite 
                    ? icons.heart_filled({color: theme.accent.primary})
                    : icons.heart({color: theme.text.primary})
                }
            </Pressable>

        </View>

        {/* HERO IMAGE */}
        <Image
          source={
            recipe.image_url
              ? { uri: recipe.image_url }
              : { uri: "https://www.gesundfit.de/wp-content/uploads/2023/09/hirse-kochen-wuerzen-adobe-scaled.jpeg" }
          }
          style={styles.heroImage}
        />

        {/* CONTENT */}
        <ScrollView style={styles.contentCard} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>
            {recipe.title}
            </Text>
        </ScrollView>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    heroImage: {
      width: "100%",
      height: 360,
    },

    contentCard: {
      backgroundColor: theme.background,

      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,

      padding: 24,

      marginTop: -24,
    },

    headerOverlay: {
      position: "absolute",

      top: 60,
      left: 0,
      right: 0,

      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 16,

      zIndex: 10,
    },

    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 21,

      backgroundColor: theme.button.background,

      justifyContent: "center",
      alignItems: "center",
    },

    title: {
      fontSize: 25,
      fontWeight: "700",
      color: theme.text.primary,
    },
  });