export type SortOption = 
  | "popular"
  | "az"
  | "za"
  | "lastCooked"
  | "neverCooked"
  | "new";

type RecipeType =
  | "vegetarian"
  | "vegan"
  | "meat"
  | "dessert";

export type FilterState = {
  type: RecipeType[];
  favoritesOnly: boolean;
};