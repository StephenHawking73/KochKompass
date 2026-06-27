import { useCallback, useEffect, useState } from "react";
import {
  getFavorites,
  toggleFavorite,
} from "@/services/favoritesService";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const data = await getFavorites();

      setFavorites(new Set(data));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  async function toggle(mealId: string) {
    const isFavorite = favorites.has(mealId);

    await toggleFavorite(mealId, isFavorite);

    setFavorites((prev) => {
      const next = new Set(prev);

      if (isFavorite) {
        next.delete(mealId);
      } else {
        next.add(mealId);
      }

      return next;
    });
  }

  return {
    favorites,
    loading,
    toggle,
  };
}