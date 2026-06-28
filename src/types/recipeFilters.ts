export type SortOption = 
  | "popular"
  | "az"
  | "za"
  | "lastCooked"
  | "neverCooked"
  | "new"
  | "old"

type RecipeType =
  | "all"
  | "vegetarian"
  | "vegan"
  | "meat"

export type FilterState = {
  type: RecipeType;
  favoritesOnly: boolean;
};