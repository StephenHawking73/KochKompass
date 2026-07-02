import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";

type Props = {
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  count: number;
};

export function RatingBars({ distribution, count }: Props) {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {[5, 4, 3, 2, 1].map((stars) => {
        const amount = distribution[stars as keyof typeof distribution];

        const percent =
          count === 0 ? 0 : (amount / count) * 100;

        return (
          <View key={stars} style={styles.row}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
                <Text style={styles.label}>{stars}</Text>
                {icons.star({color: theme.text.op, size: 12})}
            </View>

            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${percent}%`,
                  },
                ]}
              />
            </View>

            <Text style={styles.count}>{amount}</Text>
          </View>
        );
      })}
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      gap: 10,
      justifyContent: "center",
      paddingRight: 16,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
    },

    label: {
      width: 14,
      color: theme.text.primary,
      fontWeight: "600",
    },

    barBackground: {
      flex: 1,
      height: 8,
      borderRadius: 999,

      backgroundColor: theme.ratingContainer.background,

      overflow: "hidden",

      marginHorizontal: 10,
    },

    barFill: {
      height: "100%",
      borderRadius: 999,

      backgroundColor: theme.text.colored,
    },

    count: {
      width: 22,
      textAlign: "right",
      color: theme.text.op,
      fontSize: 13,
    },
  });