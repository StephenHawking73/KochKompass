export type Meal = {
    id: string | number;
    recipeId: string;
    title: string;
    planned_date: Date;
    meal_type: "lunch" | "dinner";
    meal_position: number;
    description?: string;
    image_url?: string;
};

export type WeekPlan = {
    weekId: string | number,
    label: string;          // "KW 24"
    meals: Meal[];
}