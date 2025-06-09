export const getWeekRange = (baseDate: Date): { start: Date; end: Date } => {
    const date = new Date(baseDate);
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day; // Adjust for Sunday

    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return { start: monday, end: sunday };
}