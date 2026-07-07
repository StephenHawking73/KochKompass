import React, { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import * as Haptics from "expo-haptics";

import { icons } from "@/assets/icons";
import { useTheme } from "@/hooks/useTheme";
import { rateRecipe } from "@/lib/ratings";

const AnimatedPressable =
  Animated.createAnimatedComponent(Pressable);

type Props = {
  visible: boolean;
  onClose: () => void;
  recipeId: string;
  initialRating?: number | null;
  onSaved?: () => void;
};

type StarProps = {
  active: boolean;
  onPress: () => void;
  theme: any;
  style: any;
};

function RatingStar({
  active,
  onPress,
  theme,
  style,
}: StarProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: scale.value,
      },
    ],
  }));

  const handlePress = () => {
    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light
    );

    scale.value = withSpring(1.08, {
      damping: 15,
      stiffness: 350,
      mass: 0.5,
    });

    setTimeout(() => {
      scale.value = withSpring(1, {
        damping: 18,
        stiffness: 300,
        mass: 0.5,
      });
    }, 70);

    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        style,
        animatedStyle,
      ]}
    >
      {active
        ? icons.star({
            size: 48,
            color: theme.accent.primary,
          })
        : icons.star_o({
            size: 48,
            color: theme.text.op,
          })}
    </AnimatedPressable>
  );
}

export default function RatingSheet({
  visible,
  onClose,
  recipeId,
  initialRating = null,
  onSaved,
}: Props) {
  const theme = useTheme();
  const styles = createStyles(theme);

  const [rating, setRating] =
    useState<number | null>(initialRating);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating, visible]);

  const save = async () => {
    setLoading(true);

    try {
      await rateRecipe(recipeId, rating);

      onSaved?.();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Rezept bewerten
        </Text>

        <Text style={styles.subtitle}>
          Wie hat dir dieses Rezept geschmeckt?
        </Text>
      </View>


      <View style={styles.starContainer}>
        {[1, 2, 3, 4, 5].map((value) => (
          <RatingStar
            key={value}
            active={
              rating !== null &&
              value <= rating
            }
            theme={theme}
            style={styles.starButton}
            onPress={() =>
              setRating((current) => 
                (current === value ? null : value)
              )
            }
          />
        ))}
      </View>


      <View style={styles.buttonRow}>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.cancelButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.cancelText}>
            Abbrechen
          </Text>
        </Pressable>


        <Pressable
          disabled={loading}
          onPress={save}
          style={({ pressed }) => [
            styles.saveButton,
            (loading) && {
              opacity: 0.45,
            },
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.saveText}>
            Speichern
          </Text>
        </Pressable>
      </View>
    </View>
  );
}


const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 8,
    },

    header: {
      alignItems: "center",
      marginBottom: 25,
    },

    title: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.text.primary,
    },

    subtitle: {
      marginTop: 10,

      fontSize: 15,
      lineHeight: 22,

      textAlign: "center",
      color: theme.text.op,

      paddingHorizontal: 12,
    },


    starContainer: {
      flexDirection: "row",

      justifyContent: "center",
      alignItems: "center",

      gap: 15,
    },


    starButton: {
      paddingHorizontal: 4,
      paddingVertical: 8,
    },


    buttonRow: {
      flexDirection: "row",

      gap: 14,

      marginTop: 50,
    },


    cancelButton: {
      flex: 1,

      height: 56,

      borderRadius: 18,

      justifyContent: "center",
      alignItems: "center",

      backgroundColor: theme.card.background,

      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 8,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      elevation: 2,
    },


    saveButton: {
      flex: 1,

      height: 56,

      borderRadius: 18,

      justifyContent: "center",
      alignItems: "center",

      backgroundColor: theme.accent.primary,

      shadowColor: theme.accent.primary,

      shadowOpacity: 0.25,

      shadowRadius: 12,

      shadowOffset: {
        width: 0,
        height: 5,
      },

      elevation: 4,
    },


    cancelText: {
      fontSize: 16,
      fontWeight: "600",

      color: theme.text.primary,
    },


    saveText: {
      fontSize: 16,
      fontWeight: "700",

      color: "#fff",
    },


    pressed: {
      opacity: 0.8,
    },
  });