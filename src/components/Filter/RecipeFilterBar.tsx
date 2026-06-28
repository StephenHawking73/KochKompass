import { useTheme } from "@/hooks/useTheme";
import { FilterState, SortOption } from "@/types/recipeFilters";
import React from "react";
import { ScrollView } from "react-native";
import FilterChip from "./FilterChip";

type RecipeFilterBarProps = {
  filters: FilterState;
  setFilters: React.Dispatch<
    React.SetStateAction<FilterState>
  >;
};

export default function RecipeFilterBar({
  filters,
  setFilters,
}: RecipeFilterBarProps) {

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 2,
        alignItems: "center",
      }}
    >      
      <FilterChip
        label="Favoriten"
        selected={filters.favoritesOnly}
        onPress={() =>
          setFilters((prev) => ({
            ...prev,
            favoritesOnly:
              !prev.favoritesOnly,
          }))
        }
      />

      <FilterChip
        label="Vegetarisch"
        selected={filters.type === "vegetarian"}
        onPress={() =>
          setFilters((prev) => ({
            ...prev,
            type:
              prev.type === "vegetarian"
                ? "all"
                : "vegetarian",
          }))
        }
      />

      <FilterChip
        label="Vegan"
        selected={filters.type === "vegan"}
        onPress={() =>
          setFilters((prev) => ({
            ...prev,
            type:
              prev.type === "vegan"
                ? "all"
                : "vegan",
          }))
        }
      />

      <FilterChip
        label="Fleisch"
        selected={filters.type === "meat"}
        onPress={() =>
          setFilters((prev) => ({
            ...prev,
            type:
              prev.type === "meat"
                ? "all"
                : "meat",
          }))
        }
      />
    </ScrollView>
  );
}