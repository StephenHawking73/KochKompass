import { useLocalSearchParams, router } from "expo-router";
import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/providers/AuthProvider";
import { useAppAlert } from "@/providers/AlertProvider";
import { joinGroup } from "@/services/groupService";

export default function JoinCodeScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const theme = useTheme();
  const { refreshActiveGroup } = useAuth();
  const { showAlert } = useAppAlert();

  useEffect(() => {
    async function handle() {
      if (!code) {
        router.replace("/group" as any);
        return;
      }

      try {
        await joinGroup(String(code).toUpperCase());
        await refreshActiveGroup();
        router.replace("/group" as any);
      } catch (error: any) {
        showAlert({ title: error?.message ?? "Beitritt fehlgeschlagen." });
        router.replace("/group" as any);
      }
    }

    handle();
  }, [code]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color={theme.accent.primary} />
      <Text style={{ color: theme.text.primary, marginTop: 16 }}>Einladung wird verarbeitet...</Text>
    </SafeAreaView>
  );
}
