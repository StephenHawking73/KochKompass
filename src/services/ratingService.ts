import { supabase } from "@/lib/supabase";

export async function getRecipeRatings(recipeId: string) {
  const { 
    data: {user},
  } = await supabase.auth.getUser();

  const { data: ratings, error: rErr } = await supabase
    .from("ratings")
    .select("rating, user_id, profiles(username, avatar_url), comment")
    .eq("recipe_id", recipeId);

  const { data: summary, error: sErr } = await supabase
    .from("recipe_ratings_summary")
    .select("*")
    .eq("recipe_id", recipeId)
    .maybeSingle();

  if (rErr || sErr) {
    console.error(rErr || sErr);
    return null;
  }

  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  ratings.forEach((r) => {
    distribution[r.rating as keyof typeof distribution]++;
  })

  const userRating = ratings.find(
    (r) => r.user_id === user?.id
  )?.rating ?? null;

  const userComment = ratings.find(
    (r) => r.user_id === user?.id
  )?.comment ?? null;

  return {
    ratings,
    avgRating: summary?.avg_rating ?? 0,
    count: summary?.rating_count ?? 0,
    distribution,
    userRating,
    userComment,
  };
}