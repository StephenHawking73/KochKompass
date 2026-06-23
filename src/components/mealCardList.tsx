import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Meal } from "@/types/types";
import { icons } from "@/assets/icons";

type Props = {
  meal: Meal;
  onPress?: () => void;
};

export default function MealCardList({ meal, onPress }: Props) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const onPressHeart = null;

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image
          source={
            meal.image_url
              ? { uri: meal.image_url }
              : { uri: "https://www.gesundfit.de/wp-content/uploads/2023/09/hirse-kochen-wuerzen-adobe-scaled.jpeg" }
          }
          style={styles.image}
        />

        <Pressable style={styles.heartButton} onPress={onPressHeart}>
          {icons.heart({
            color: theme.text.primary,
          })}
        </Pressable>
      </View>

      

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
            {meal.title}
        </Text>
          
        <View style={styles.subtitleRow}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingTitle}>4.6</Text>
            {icons.star({color: theme.accent.primary})}
          </View>
            
          <View style={styles.attributeContainer}>
            {meal.attribute === "meat" && (
              <>
                {icons.meat({color: "brown"})}
                <Text style={styles.subtitle}>Fleisch</Text>
              </>
            )}
            {meal.attribute === "vegetarian" && (
              <>
                {icons.vegetarian({color: "yellowgreen"})}
                <Text style={styles.subtitle}>Veggie</Text>
              </>
            )}
            {meal.attribute === "vegan" && (
              <>
                {icons.meat({color: "darkcyan"})}
                <Text style={styles.subtitle}>Vegan</Text>
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
      color: theme.accent.primary,
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