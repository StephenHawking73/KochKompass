import { useState } from "react";

export function useWeekNavigation() {
    const [currentDate, setCurrentDate] = useState(
        new Date()
    );

    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeek = addDays(startOfWeek, 6);

    const weekNumber = getWeekNumber(currentDate);

    const weekLabel = `KW ${weekNumber}`;

    const dateLabel =
        `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;

    const goToNextWeek = () => {
        setCurrentDate(prev => addDays(prev, 7));
    };

    const goToPreviousWeek = () => {
        setCurrentDate(prev => addDays(prev, -7));
    };

    return {
        weekStart: startOfWeek,
        weekEnd: endOfWeek,
        weekLabel,
        dateLabel,
        goToNextWeek,
        goToPreviousWeek,
    };
}

function addDays(date: Date, days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}

function getStartOfWeek(date: Date) {
    const d = new Date(date);

    const day = d.getDay();

    const diff =
        d.getDate() -
        day +
        (day === 0 ? -6 : 1);

    d.setDate(diff);

    return d;
}

function formatDate(date: Date) {
    return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
}

function getWeekNumber(date: Date) {
    const temp = new Date(date);

    temp.setHours(0, 0, 0, 0);

    temp.setDate(
        temp.getDate() +
            3 -
            ((temp.getDay() + 6) % 7)
    );

    const week1 = new Date(
        temp.getFullYear(),
        0,
        4
    );

    return (
        1 +
        Math.round(
            ((temp.getTime() -
                week1.getTime()) /
                86400000 -
                3 +
                ((week1.getDay() + 6) % 7)) /
                7
        )
    );
}