import { supabase } from "@/lib/supabase";

export async function getFavorites() {
    const { data, error } = await supabase.from("favorites").select("meal_id");

    if (error) {
        console.log(error);
        return [];
    };

    return data.map((f) => f.meal_id)
}

export async function addFavorite(mealId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("favorites")
    .insert({
      user_id: user.id,
      meal_id: mealId,
    });

    if (error) {
        console.log(error);
        return [];
    };
}

export async function removeFavorite(mealId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", user.id)
    .eq("meal_id", mealId);

    if (error) {
        console.log(error);
        return [];
    };
}

export async function toggleFavorite(
  mealId: string,
  isFavorite: boolean
) {
  if (isFavorite) {
    await removeFavorite(mealId);
  } else {
    await addFavorite(mealId);
  }
}