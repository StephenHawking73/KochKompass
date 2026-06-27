export type Meal = {
    id: string;
    title: string;
    planned_date: string;
    meal_type: "lunch" | "dinner";
    meal_position: number;
    image_url?: string;
};

export type Recipe = {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    attribute: "vegan" | "vegetarian" | "meat";
    rating: number;
}

export type WeekPlan = {
    weekId: string | number,
    label: string;          // "KW 24"
    meals: Meal[];
}

export type MealSlot = {
    date: string;
    type: "lunch" | "dinner";
}