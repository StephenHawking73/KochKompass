export type SortOption = 
  | "popular"
  | "az"
  | "za"
  | "lastCooked"
  | "neverCooked"
  | "new"

type RecipeType =
  | "all"
  | "vegetarian"
  | "vegan"
  | "meat"

export type FilterState = {
  type: RecipeType;
  favoritesOnly: boolean;
};