export type Meal = {
    id: string | number,
    name: string, 
    description?: string,
    image_url?: string,
    rating?: number,
    
}

export type WeekPlan = {
    weekId: string | number,
    label: string;          // "KW 24"
    meals: Meal[];
}