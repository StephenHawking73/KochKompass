import { useEffect } from "react";
import { getFavorites, toggleFavorite } from "@/services/favoritesService";
import { useFavoritesStore } from "@/store/favoritesStore";

export function useFavorites() {
  const favorites = useFavoritesStore(
    (s) => s.favorites
  );

  const loading = useFavoritesStore(
    (s) => s.loading
  );

  const setLoading = useFavoritesStore(
    (s) => s.setLoading
  );

  const setFavorites = useFavoritesStore(
    (s) => s.setFavorites
  );

  const addFavorite = useFavoritesStore(
    (s) => s.addFavorite
  );

  const removeFavorite = useFavoritesStore(
    (s) => s.removeFavorite
  );

  useEffect(() => {
    if (favorites.size === 0) {
      load();
    }
  }, [favorites.size]);

  async function load() {
    setLoading(true);

    const data = await getFavorites();
    setFavorites(data);

    setLoading(false);
  }

  async function toggle(id: string) {
    const isFavorite = favorites.has(id);

    try {
      await toggleFavorite(id, isFavorite);

      if (isFavorite) {
        removeFavorite(id);
      } else {
        addFavorite(id);
      }
    } catch (error) {
      console.log("useFavorites - toggle:", error);
    }
  }

  return {
    favorites,
    toggle,
  };
}