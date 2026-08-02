import React, { useEffect, useRef } from "react";
import { View, ActivityIndicator, Text, Animated, Easing, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

export function LoadingScreen({ text = "Lade...", visible = true, overlay = false }) {
  const theme = useTheme();
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    const animation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => animation.stop();
  }, [rotation, visible]);

  if (!visible) return null;

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, overlay && styles.overlay]}>
      <View style={[styles.card, { backgroundColor: theme.card.background }]}> 
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <ActivityIndicator size="large" color={theme.accent.primary} />
        </Animated.View>

        <Text style={[styles.title, { color: theme.text.primary }]}>{text}</Text>
        <Text style={[styles.subtitle, { color: theme.text.op }]}>Bitte warten, das kann einen Moment dauern.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 10, 10, 0.35)",
    zIndex: 20,
  },
  card: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: "center",
    minWidth: 240,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
  },
});