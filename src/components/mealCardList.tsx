import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Recipe } from "@/types/types";
import { icons } from "@/assets/icons";

type Props = {
  recipe: Recipe;
  favorites: Set<string>;
  toggleFavorite: (id: string) => any;
  onPress?: () => void;
};

export default function MealCardList({ recipe, onPress, favorites, toggleFavorite }: Props) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const isFavorite = favorites.has(recipe.id);

  const onPressHeart = () => {
    toggleFavorite(recipe.id);
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={
            recipe.image_url
              ? { uri: recipe.image_url }
              : { uri: "https://www.gesundfit.de/wp-content/uploads/2023/09/hirse-kochen-wuerzen-adobe-scaled.jpeg" }
          }
          style={styles.image}
        />

        <Pressable style={styles.heartButton} onPress={onPressHeart}>
          {isFavorite 
            ? icons.heart_filled({color: theme.accent.primary})
            : icons.heart({color: theme.text.primary})
          }
        </Pressable>
      </View>

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
            {recipe.title}
        </Text>
          
        <View style={styles.subtitleRow}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>{recipe.rating?.toFixed(1) ?? "-"}</Text>
            {icons.star({color: theme.text.colored})}
            <Text style={styles.ratingTitle}>({recipe.rating_count > 0 ? recipe.rating_count : "-"})</Text>
          </View>
          
          {/* Attributes */}
          <View style={styles.attributeContainer}>
            {recipe.attribute === "meat" && (
              <>
                {icons.meat({color: theme.meat})}
              </>
            )}
            {recipe.attribute === "vegetarian" && (
              <>
                {icons.vegetarian({color: theme.veggie})}
              </>
            )}
            {recipe.attribute === "vegan" && (
              <>
                {icons.vegan({color: theme.vegan})}
              </>
            )}
            {recipe.attribute === "dessert" && (
              <>
                {icons.dessert({color: theme.dessert})}
              </>
            )}
          </View>

        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    card: {
      borderRadius: 22,
      overflow: "hidden",
      backgroundColor: theme.card.background,

      flexBasis: "47%",
      maxWidth: "47%",
    },

    imageContainer: {
      overflow: "hidden",
      position: "relative",
    },

    heartButton: {
      position: "absolute",
      top: 10,
      right: 10,

      width: 30,
      height: 30,
      borderRadius: 18,

      backgroundColor: theme.card.background,

      justifyContent: "center",
      alignItems: "center",
    },

    image: {
      width: "100%",
      aspectRatio: 1,
      borderRadius: 13,
    },

    content: {
      padding: 12,
      gap: 10,
    },

    title: {
      color: theme.text.primary,
      fontSize: 16,
      fontWeight: 700,
    },

    subtitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    subtitle: {
      color: theme.text.op,
      fontSize: 12,
      fontWeight: 500,
    },

    ratingTitle: {
      color: theme.text.colored,
      fontSize: 12,
      fontWeight: 600,
    },

    ratingContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.accent.op,

      padding: 4,
      gap: 5,
      borderRadius: 6,
    },

    attributeContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
  });