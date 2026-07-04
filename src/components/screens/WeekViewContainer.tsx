import { Platform, ScrollView, StyleSheet } from "react-native";
import { RefreshControl } from "react-native-gesture-handler";
import { ReactNode } from "react";

interface WeekViewContainerProps {
  children: ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function WeekViewContainer({
  children,
  refreshing,
  onRefresh,
}: WeekViewContainerProps) {
  const styles = createStyles();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: Platform.OS === "android" ? 120 : 80,
      }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {children}
    </ScrollView>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 6,
    },
  });
