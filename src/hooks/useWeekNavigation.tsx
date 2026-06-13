import { useState } from "react";
import { addDays, format, startOfWeek } from "date-fns";

export function useWeekNavigation() {
    const today = new Date();

    const [weekStart, setWeekStart] = useState(
        startOfWeek(today, { weekStartsOn: 1 })
    );

    const weekEnd = addDays(weekStart, 6);

    const goToPreviousWeek = () => {
        setWeekStart(prev => addDays(prev, -7));
    };

    const goToNextWeek = () => {
        setWeekStart(prev => addDays(prev, 7))
    }

    const weekLabel = `KW ${getWeekNumber(weekStart)}`
    const weekDatesLabel = `${format(weekStart, "dd.MM.yy")} - ${format(weekEnd, "dd.MM.yy")}`;

    return {
        weekStart,
        weekEnd,
        weekLabel,
        weekDatesLabel,
        goToNextWeek,
        goToPreviousWeek,
    }
}

function getWeekNumber(date: Date) {
    const temp = new Date(date.getTime());
    temp.setHours(0, 0, 0, 0);
    temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
    const week1 = new Date(temp.getFullYear(), 0, 4);
    return (
        1 +
        Math.round(
            ((temp.getTime() - week1.getTime()) / 86400000 - 3 +((week1.getDay() + 6) % 7)) / 7
        )
    );
}