import { create } from "zustand";

type FavoritesStore = {
  favorites: Set<string>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setFavorites: (ids: string[]) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
};

export const useFavoritesStore =
  create<FavoritesStore>((set) => ({
    favorites: new Set(),

    loading: false,

    setLoading: (loading) => 
        set({
            loading,
        }),

    setFavorites: (ids) =>
      set({
        favorites: new Set(ids),
      }),

    addFavorite: (id) =>
      set((state) => {
        const next = new Set(state.favorites);
        next.add(id);

        return {
          favorites: next,
        };
      }),

    removeFavorite: (id) =>
      set((state) => {
        const next = new Set(state.favorites);
        next.delete(id);

        return {
          favorites: next,
        };
      }),
  }));