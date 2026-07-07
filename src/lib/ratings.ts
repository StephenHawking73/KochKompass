import { supabase } from "@/lib/supabase";

export async function rateRecipe(
  recipeId: string,
  rating: number | null
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();


  if (!user) {
    throw new Error("Nicht eingeloggt!");
  }


  if (rating === null) {
    const { error } = await supabase
      .from("ratings")
      .delete()
      .eq("recipe_id", recipeId)
      .eq("user_id", user.id);


    if (error) throw error;

    return;
  }


  const { error } = await supabase
    .from("ratings")
    .upsert({
      recipe_id: recipeId,
      user_id: user.id,
      rating,
    });


  if (error) throw error;
}