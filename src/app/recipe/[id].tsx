import { View, Text, ScrollView, Image, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";
import { useFavorites } from "@/hooks/useFavorites";
import { LoadingScreen } from "@/components/loadingScreen";
import InfoCard from "@/components/infoCard";
import { getRecipeRatings } from "@/services/ratingService";
import { RatingBars } from "@/components/RatingBars";
import RatingSheet from "@/components/modals/RatingModal";
import BasicBottomSheet from "@/components/BasicBottomSheet";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const styles = createStyles(theme);

  const { favorites, toggle } = useFavorites();

  const recipeId = Array.isArray(id) ? id[0] : id;
  const isFavorite = recipeId != null && favorites.has(recipeId);

  const [recipe, setRecipe] = useState<any>(null);
  const [rating, setRatings] = useState<any>(null);

  const loadRecipe = async () => {
  if (!recipeId) return;

  const { data: recipeData } = await supabase
      .from("recipes")
      .select("*")
      .eq("id", recipeId)
      .single();

    setRecipe(recipeData);

    const ratingData = await getRecipeRatings(recipeId) || null;
    setRatings(ratingData);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadRecipe();
    }, [recipeId])
  );

  const [expanded, setExpanded] = useState(false);
  const [hasMoreText, setHasMoreText] = useState(false);
  const [measured, setMeasured] = useState(false);  

  useEffect(() => {
    setExpanded(false);
    setHasMoreText(false);
    setMeasured(false);
  }, [recipe?.description]);

  const emptyDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  const [ratingVisible, setRatingVisible] = useState(false);
  const [detailRatingVisible, setDetailRatingVisible] = useState(false);

  if (!recipe) return <LoadingScreen />;

  const attribute = recipe.attribute;
  const attribute_title = attribute === "vegan" ? "Vegan" : attribute === "vegetarian" ? "Veggie" : attribute === "meat" ? "Fleisch" : "Dessert";
  const attribue_icon = attribute === "vegan" ? icons.vegan({ color: theme.vegan}) : attribute === "vegetarian" ? icons.vegetarian({color: theme.veggie}) : attribute === "meat" ? icons.meat({color: theme.meat}) : icons.dessert({color: theme.dessert});

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
        <ScrollView style={styles.contentCard} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 130}}>
            <Text style={styles.title}>
              {recipe.title}
            </Text>

            {/* Infos */}
            { (recipe.attribute || recipe.duration || recipe.difficulty) && (
              <ScrollView horizontal showsVerticalScrollIndicator={false} contentContainerStyle={{paddingVertical: 10, gap: 12, alignItems: "flex-start", marginTop: 10,}} style={{overflow: "visible"}}>
                  {attribute && <InfoCard title={attribute_title} icon={attribue_icon}/>}
                  {difficulty && 
                      <InfoCard 
                          title={difficulty} 
                          icon={icons.hat({color: theme.accent.primary})}
                      />
                  }

                  {duration !== null && duration !== undefined && 
                      <InfoCard 
                          title={duration + " min"} 
                          icon={icons.time({color: theme.accent.primary})}
                      />
                  }
              </ScrollView>
            )}

            {/* Rating */}
            <View>
              <View style={{flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 15}}>
                <Text style={[styles.heading, {marginTop: 0}]}>Bewertung</Text>
                <Pressable style={styles.card} onPress={() => setRatingVisible(true)}>
                    <Text style={styles.rate}>Bewerten</Text>
                </Pressable>
              </View>
            
              <View style={{justifyContent: "space-between", flexDirection: "row", marginTop: 20}}>
                {/* ... BARS .... */}
                <RatingBars distribution={rating?.distribution ?? emptyDistribution} count={rating?.count ?? 0}/>

                {/* AVG RATING */}
                <View style={styles.avgRatingContainer}>
                  <View style={{flexDirection: "row", alignItems: "center", gap: 10, justifyContent: "center"}}>
                    <Text style={styles.ratingText}>{rating?.avgRating?.toFixed(1) ?? "-"}</Text>
                    {icons.star({color: theme.text.colored, size: 30})}
                  </View>
                  <Text style={{color: theme.text.primary, marginTop: 10, fontWeight: "500", fontSize: 14,}}>Ø Bewertung</Text>
                </View>
              </View>

              {!detailRatingVisible 
                ? (
                    <Pressable style={{flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 20, gap: 10}} onPress={() => setDetailRatingVisible(true)} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
                      <Text style={styles.moreText}>Details anzeigen</Text>
                      {icons.down({color: theme.text.op})}
                    </Pressable>
                  ) : (
                    <View style={{ marginTop: 25 }}>
                      {rating?.ratings?.map((r: any, index: number) => (
                        <View
                          key={`${r.user_id}-${index}`}
                          style={{
                            paddingVertical: 14,
                            borderBottomWidth: 0.5,
                            borderBottomColor: theme.text.op + "25",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            {/* Avatar */}
                            <Image
                              source={{
                                uri:
                                  r.profiles?.avatar_url ??
                                  `https://api.dicebear.com/7.x/initials/png?seed=${encodeURIComponent(
                                    r.profiles?.username ?? "User"
                                  )}`,
                              }}
                              style={{
                                width: 42,
                                height: 42,
                                borderRadius: 21,
                                marginRight: 12,
                                backgroundColor: theme.card.background,
                              }}
                            />

                            {/* Username */}
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  color: theme.text.primary,
                                  fontSize: 15,
                                  fontWeight: "600",
                                }}
                              >
                                {r.profiles.username}
                              </Text>
                            </View>

                            {/* Sterne */}
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 2,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                {[0, 1, 2, 3, 4].map((index) => (
                                  <React.Fragment key={`${r.id}-star-${index}`}>
                                    {icons.star({
                                      size: 15,
                                      color:
                                        index < r.rating
                                          ? theme.text.colored
                                          : theme.text.op + "40",
                                    })}
                                  </React.Fragment>
                                ))}
                              </View>
                            </View>
                          </View>

                          {/* Kommentar */}
                          {r.comment && (
                            <Text
                              style={{
                                marginLeft: 54,
                                color: theme.text.op,
                                fontSize: 14,
                                lineHeight: 21,
                              }}
                            >
                              {r.comment}
                            </Text>
                          )}
                        </View>
                      ))}

                      <Pressable
                        style={{
                          flexDirection: "row",
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: 20,
                          gap: 10,
                        }}
                        onPress={() => setDetailRatingVisible(false)}
                        hitSlop={{
                          top: 10,
                          bottom: 10,
                          left: 10,
                          right: 10,
                        }}
                      >
                        <Text style={styles.moreText}>Weniger anzeigen</Text>
                        {icons.up({ color: theme.text.op })}
                      </Pressable>
                    </View>
                  )
              }
            </View>
          
            {/* Link */}
            { recipe.link && (
              <View>
                <Text style={styles.heading}>Rezeptlink</Text>
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
                  <Text style={{ color: theme.text.link }} numberOfLines={1}>
                    {recipe.link}
                  </Text>
                  {icons.right({ color: theme.text.op, size: 15, })}
                </Pressable>
              </View>
            )}

            {/* Description */}
            { recipe.description && (
              <View>
                <Text style={styles.heading}>Beschreibung</Text>
                <Text
                  style={styles.description}
                  numberOfLines={measured && !expanded ? 3 : undefined}
                  onTextLayout={(e) => {
                    if (!measured) {
                      setHasMoreText(e.nativeEvent.lines.length > 3);
                      setMeasured(true);
                    }
                  }}
                >
                  {recipe.description}
                </Text>

                {hasMoreText && (
                  <Pressable
                    style={{
                      flexDirection: "row",
                      gap: 4,
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: 7,
                    }}
                    onPress={() => setExpanded((v) => !v)}
                  >
                    <Text style={styles.more}>
                      {expanded ? "Weniger anzeigen" : "Mehr anzeigen"}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
        </ScrollView>

        <View style={styles.bottomContainer}>
          <Pressable
            style={styles.planButton}
            onPress={() => {
              if (!recipeId) {
                return;
              }

              router.push({
                pathname: "/",
                params: { planningRecipeId: recipeId },
              });
            }}
          >
            {icons.calendar({ color: "white", size: 22 })}
            <Text style={styles.planText}>
              Planen
            </Text>
          </Pressable>

          <Pressable 
            style={styles.editButton}
            onPress={() => {
              router.push({
                pathname: "/recipe/edit",
                params: {
                  id: recipeId
                }
              });
            }}
          >
            {icons.edit({ color: theme.text.primary, size: 22 })}
            <Text style={styles.editText}>
              Bearbeiten
            </Text>
          </Pressable>
        </View>

        <BasicBottomSheet
          visible={ratingVisible}
          onClose={() => setRatingVisible(false)}
        >
          <RatingSheet
            visible={ratingVisible}
            onClose={() => setRatingVisible(false)}
            recipeId={recipeId}
            initialRating={rating?.userRating ?? null}
            onSaved={async () => {
              const r = await getRecipeRatings(recipeId);
              setRatings(r);
            }}
          />
        </BasicBottomSheet>
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

    heading: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.text.primary,
      
      marginTop: 40,
    },

    linkBox: {
        marginTop: 15,

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

    description: {
      marginTop: 10,

      fontSize: 14,
      fontWeight: "500",
      color: theme.text.op,
    },

    more: {
      color: theme.accent.primary,
    },

    avgRatingContainer: {
      backgroundColor: theme.ratingContainer.background,

      height: 125,
      width: 120,
      borderRadius: 20,

      justifyContent: "center",
      alignItems: "center",
    },

    ratingText: {
      fontSize: 22,
      fontWeight: "600",

      color: theme.text.primary,
    },

    rate: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.accent.primary,
    },

    card: {
        backgroundColor: theme.card.background,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,

        padding: 14,
        height: 50,
        width: "auto",

        alignSelf: "flex-start",

        borderRadius: 13,

        shadowColor: theme.accent.primary,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 4,
        shadowOpacity: 0.08,
        elevation: 3,
    },

    moreText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.text.op,
    },

    bottomContainer: {
      position: "absolute",

      bottom: 0,
      left: 20,
      right: 20,

      flexDirection: "row",
      gap: 12,

      height: 100,

      alignItems: "center",
      justifyContent: "space-between",

      backgroundColor: theme.background,
    },

    planButton: {
      flex: 1,

      height: 56,

      borderRadius: 16,

      backgroundColor: theme.accent.primary,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 10,
      marginBottom: 20,

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 5,
    },

    editButton: {
      flex: 1,

      height: 56,

      borderRadius: 16,

      backgroundColor: theme.card.background,

      borderWidth: 1,
      borderColor: theme.text.op + "20",

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      gap: 10,
      marginBottom: 20,
    },

    planText: {
      color: "white",

      fontSize: 16,
      fontWeight: "600",
    },

    editText: {
      color: theme.text.primary,

      fontSize: 16,
      fontWeight: "600",
    },
  });
