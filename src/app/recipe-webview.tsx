import { View, Text, StyleSheet, Pressable } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, router } from "expo-router";
import React from "react";

import { useTheme } from "@/hooks/useTheme";
import { icons } from "@/assets/icons";

export default function RecipeWebView() {
  const { url } = useLocalSearchParams();
  const theme = useTheme();
  const styles = createStyles(theme);

  const safeUrl = Array.isArray(url) ? url[0] : url;

  if (!safeUrl) {
    return (
      <View style={styles.container}>
        <Text style={{ color: theme.text.primary }}>
          Kein gültiger Link vorhanden
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER OVERLAY */}
      <View style={styles.headerOverlay}>
        <Pressable
          onPress={() => router.back()}
          style={styles.iconButton}
        >
          {icons.close({ color: theme.text.primary })}
        </Pressable>
      </View>

      {/* WEBVIEW CARD */}
      <View style={styles.contentCard}>
        <WebView
          source={{ uri: safeUrl }}
          startInLoadingState
          style={styles.webview}
        />
      </View>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    headerOverlay: {
      position: "absolute",
      top: 60,
      left: 5,
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
      borderColor: theme.accent.primary,
      borderWidth: 2,

      justifyContent: "center",
      alignItems: "center",
    },

    contentCard: {
      flex: 1,

      backgroundColor: theme.background,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      overflow: "hidden",
    },

    webview: {
      flex: 1,
    },
  });