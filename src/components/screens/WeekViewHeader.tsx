import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";

export default function WeekViewHeader() {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.header}>
      <View style={styles.dayColumn} />

      <View style={styles.headerCenter}>
        {icons.sun({ color: theme.icons.sun })}
        <Text style={styles.headerText}>Mittagessen</Text>
      </View>

      <View style={styles.headerCenter}>
        {icons.moon({ color: theme.icons.moon })}
        <Text style={styles.headerText}>Abendessen</Text>
      </View>

      <View style={styles.plusColumn} />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      marginTop: 30,
    },
    headerCenter: {
      flex: 1,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },
    headerText: {
      fontWeight: "600",
      color: theme.text.primary,
    },
    dayColumn: {
      width: 40,
      justifyContent: "flex-start",
    },
    plusColumn: {
      width: 20,
      alignItems: "center",
    },
  });
