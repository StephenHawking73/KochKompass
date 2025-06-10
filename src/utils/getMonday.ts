export const getWeekDates = (weekStart: Date): string[] => {
    const dates: string[] = [];
    const current = new Date(weekStart);

    for (let i = 0; i < 7; i++) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, '0');
        const day = String(current.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${day}`);

        // Nächster Tag
        current.setDate(current.getDate() + 1);
    }

    return dates;
};
