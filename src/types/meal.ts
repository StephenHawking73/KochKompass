export type Meal = {
    id: string | number;
    title: string;
    planned_date: string | Date;
    description?: string;
    image_url?: string;
};

export type WeekPlan = {
    weekId: string | number,
    label: string;          // "KW 24"
    meals: Meal[];
}