import { useEffect } from "react";
import { getFavorites, toggleFavorite } from "@/services/favoritesService";
import { useFavoritesStore } from "@/store/favoritesStore";

export function useFavorites() {
  const favorites = useFavoritesStore(
    (s) => s.favorites
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
    load();
  }, []);

  async function load() {
    const data = await getFavorites();
    setFavorites(data);
  }

  async function toggle(id: string) {
    const isFavorite = favorites.has(id);

    await toggleFavorite(id, isFavorite);

    if (isFavorite) {
      removeFavorite(id);
    } else {
      addFavorite(id);
    }
  }

  return {
    favorites,
    toggle,
  };
}