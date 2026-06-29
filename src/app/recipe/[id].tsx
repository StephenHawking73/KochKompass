import { View, Text, ScrollView, Image, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";
import { useFavorites } from "@/hooks/useFavorites";
import { LoadingScreen } from "@/components/loadingScreen";
import InfoCard from "@/components/infoCard";
import { WebView } from "react-native-webview"

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const styles = createStyles(theme);

  const { favorites, toggle } = useFavorites();

  const recipeId = Array.isArray(id) ? id[0] : id;
  const isFavorite = recipeId != null && favorites.has(recipeId);

  const [recipe, setRecipe] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: recipeData } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .single();

      setRecipe(recipeData);
    };

    load();
  }, [id]);

  if (!recipe) return <LoadingScreen />;

  const attribute = recipe.attribute;
  const attribute_title = attribute === "vegan" ? "Vegan" : attribute === "vegetarian" ? "Veggie" : "Fleisch";
  const attribue_icon = attribute === "vegan" ? icons.vegan({ color: "darkcyan"}) : attribute === "vegetarian" ? icons.vegetarian({color: "yellowgreen"}) : icons.meat({color: "brown"});

  const duration = recipe.duration;
  const difficulty = recipe.difficulty;

  return (
    <View style={styles.container}>
        <View style={styles.headerOverlay}>
            <Pressable onPress={() => router.back()} style={styles.iconButton}>
                {icons.back({ color: theme.text.primary })}
            </Pressable>

            <View style={{flexDirection: "row", gap: 10}}>
              <Pressable 
                style={styles.iconButton} 
                onPress={() => {
                  if (recipeId) toggle(recipeId)
                }
              }>
                  {isFavorite 
                      ? icons.heart_filled({color: theme.accent.primary})
                      : icons.heart({color: theme.text.primary})
                  }
              </Pressable>

              <Pressable style={styles.iconButton}>
                  {icons.more({color: theme.text.primary})}
              </Pressable>
            </View>
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

            {/* Infos */}
            <ScrollView horizontal showsVerticalScrollIndicator={false} contentContainerStyle={{paddingVertical: 10, gap: 12, alignItems: "flex-start", marginTop: 10,}} style={{overflow: "visible"}}>
                {attribute && <InfoCard title={attribute_title} icon={attribue_icon}/>}
                {duration && <InfoCard title={duration + " min"} icon={icons.time(({color: theme.accent.primary}))}/>}
                {difficulty && <InfoCard title={difficulty} icon={icons.hat(({color: theme.accent.primary}))}/>}
            </ScrollView>

            {recipe.link && (
              <View>
                <Text style={styles.linkHeader}>Rezeptlink</Text>
                <Pressable
                  style={styles.linkBox}
                  onPress={() =>
                    router.push({
                      pathname: "/recipe-webview",
                      params: { url: recipe.link },
                    })
                  }
                >
                  {icons.link({ color: theme.text.link })}
                  <Text style={{ color: theme.text.link }}>
                    Rezept öffnen
                  </Text>
                </Pressable>
              </View>
            )}
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

    infosRow: {
      flexDirection: "row",
      
      justifyContent: "space-between",
      alignItems: "center",
      
      marginTop: 15,
    },

    linkHeader: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text.primary,
      
      marginTop: 20,
    },

    linkBox: {
        marginTop: 20,

        backgroundColor: theme.card.background,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,

        padding: 14,
        height: 50,
        width: "100%",

        alignSelf: "flex-start",

        borderRadius: 13,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 4,
        shadowOpacity: 0.08,
        elevation: 3,
    },
  });