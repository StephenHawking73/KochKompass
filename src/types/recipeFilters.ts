export type SortOption = 
  | "popular"
  | "az"
  | "za"
  | "lastCooked"
  | "neverCooked"
  | "new"
  | "fastest";

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
  quickOnly: boolean;
  simple: boolean;
  middle: boolean;
  hard: boolean;
};