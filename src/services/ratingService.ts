import { supabase } from "@/lib/supabase";

export async function getRecipeRatings(recipeId: string) {
  const { data: ratings, error: rErr } = await supabase
    .from("ratings")
    .select("rating, user_id, profiles(username)")
    .eq("recipe_id", recipeId);

  const { data: summary, error: sErr } = await supabase
    .from("recipe_ratings_summary")
    .select("*")
    .eq("recipe_id", recipeId)
    .single();

  if (rErr || sErr) {
    console.error(rErr || sErr);
    return null;
  }

  return {
    ratings,
    avgRating: summary?.avg_rating ?? 0,
    count: summary?.rating_count ?? 0,
  };
}