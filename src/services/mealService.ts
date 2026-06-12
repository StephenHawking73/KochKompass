import { supabase } from "@/lib/supabase";

export async function getMeals() {
  const { data, error } = await supabase
    .from("meals")
    .select("*");

  if (error) throw error;

  return data;
}