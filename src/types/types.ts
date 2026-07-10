export type Meal = {
    id: string;
    title: string;
    planned_date: string;
    recipe_id: string;
    meal_type: "lunch" | "dinner";
    meal_position: number;
    position?: number;
    image_url?: string;
    attribute?: string;
};

export type Difficulty =
    | "Einfach"
    | "Mittel"
    | "Schwer";


export type RecipeAttribute =
    | "vegan"
    | "vegetarian"
    | "meat"
    | "dessert";

export type Recipe = {
    id?: string;
    title: string;
    description?: string;
    image_url?: string;
    attribute?: RecipeAttribute | null;
    duration?: number | null;
    difficulty?: Difficulty | null;
    link: string;
    rating: number;
    rating_count: number;
    last_cooked_at: string;
    created_at: string;
    distribution: JSON;
};

export type RecipeInput = {
    title: string;
    description?: string;
    image_url?: string;
    attribute?: RecipeAttribute | null;
    duration?: number | null;
    difficulty?: Difficulty | null;
    link: string;
};

export type WeekPlan = {
    weekId: string | number,
    label: string;          // "KW 24"
    meals: Meal[];
}

export type MealSlot = {
    date: string;
    type: "lunch" | "dinner";
}

