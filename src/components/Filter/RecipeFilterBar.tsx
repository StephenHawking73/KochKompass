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
        label="Veggie"
        selected={filters.type.includes("vegetarian")}
        onPress={() =>
          setFilters((prev) => {
            const withoutMeat = prev.type.filter(
              (t) => t !== "meat" && t !== "dessert"
            );

            return {
              ...prev,
              type: withoutMeat.includes("vegetarian")
                ? withoutMeat.filter(
                    (t) => t !== "vegetarian"
                  )
                : [...withoutMeat, "vegetarian"],
            };
          })
        }
      />

      <FilterChip
        label="Vegan"
        selected={filters.type.includes("vegan")}
        onPress={() =>
          setFilters((prev) => {
            const withoutMeat = prev.type.filter(
              (t) => t !== "meat" && t !== "dessert"
            );

            return {
              ...prev,
              type: withoutMeat.includes("vegan")
                ? withoutMeat.filter(
                    (t) => t !== "vegan"
                  )
                : [...withoutMeat, "vegan"],
            };
          })
        }
      />

      <FilterChip
        label="Fleisch"
        selected={filters.type.includes(
          "meat"
        )}
        onPress={() =>
          setFilters((prev) => ({
            ...prev,
            type: prev.type.includes(
              "meat"
            )
              ? []
              : ["meat"],
          }))
        }
      />

      <FilterChip
        label="Dessert"
        selected={filters.type.includes(
          "dessert"
        )}
        onPress={() =>
          setFilters((prev) => ({
            ...prev,
            type: prev.type.includes(
              "dessert"
            )
              ? []
              : ["dessert"],
          }))
        }
      />

      <FilterChip
        label="< 30min"
        selected={filters.quickOnly}
        onPress={() =>
          setFilters((prev) => ({
            ...prev,
            quickOnly:
              !prev.quickOnly,
          }))
        }
      />

      <FilterChip
        label="Einfach"
        selected={filters.simple}
        onPress={() =>
          setFilters((prev) => ({
            ...prev,
            simple:
              !prev.simple,
          }))
        }
      />

      <FilterChip
        label="Mittel"
        selected={filters.middle}
        onPress={() =>
          setFilters((prev) => ({
            ...prev,
            middle:
              !prev.middle,
          }))
        }
      />

      <FilterChip
        label="Schwer"
        selected={filters.hard}
        onPress={() =>
          setFilters((prev) => ({
            ...prev,
            hard:
              !prev.hard,
          }))
        }
      />
    </ScrollView>
  );
}