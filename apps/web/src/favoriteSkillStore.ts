import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface FavoriteSkillState {
  readonly favorites: ReadonlyArray<string>;
  readonly toggleFavorite: (skillKey: string) => void;
  readonly isFavorite: (skillKey: string) => boolean;
}

const FAVORITE_SKILL_STORAGE_KEY = "t3code:favorite-skills:v1";

export const useFavoriteSkillStore = create<FavoriteSkillState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (skillKey) => {
        set((state) => {
          const exists = state.favorites.includes(skillKey);
          return {
            favorites: exists
              ? state.favorites.filter((favorite) => favorite !== skillKey)
              : [...state.favorites, skillKey].toSorted((left, right) =>
                  left.localeCompare(right),
                ),
          };
        });
      },
      isFavorite: (skillKey) => get().favorites.includes(skillKey),
    }),
    {
      name: FAVORITE_SKILL_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ favorites: state.favorites }),
    },
  ),
);
