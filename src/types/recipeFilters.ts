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
  | "dessert"
  | null
  | undefined;

export type FilterState = {
  type: RecipeType[];
  favoritesOnly: boolean;
};