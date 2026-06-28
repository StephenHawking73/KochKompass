import { View, Text, ScrollView, Image } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/hooks/useTheme";

export default function RecipeDetail() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();

  const [recipe, setRecipe] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", id)
        .single();

      setRecipe(data);
    };

    load();
  }, [id]);

  if (!recipe) return null;

  return (
    <>
    <View>
        <Image
          source={{ uri: recipe.image_url }}
          style={{ width: "100%", height: 350 }}
        />
    </View>

    <ScrollView>
        <View style={{ padding: 16, marginTop: 10, }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: theme.text.primary }}>
                {recipe.title}
            </Text>

            <Text style={{ marginTop: 10, color: theme.text.op }}>
                {recipe.description}
            </Text>
        </View>
    </ScrollView>
    </>
  );
}