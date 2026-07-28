import React, { createContext, useContext, useState } from "react";


type WeekLayoutContextType = {
    extraRowsByDate: Record<string, number>;
    addExtraRow: (date: string) => void;
    removeExtraRow: (date: string) => void;
};


const WeekLayoutContext = createContext<WeekLayoutContextType | undefined>(
    undefined
);


export function WeekLayoutProvider({
    children,
}: {
    children: React.ReactNode;
}) {

    const [extraRowsByDate, setExtraRowsByDate] =
        useState<Record<string, number>>({});


    function addExtraRow(date: string) {
        setExtraRowsByDate((current) => ({
            ...current,
            [date]: (current[date] ?? 0) + 1,
        }));
    }

    function removeExtraRow(date: string) {
        setExtraRowsByDate((current) => ({
            ...current,
            [date]: Math.max((current[date] ?? 0) - 1, 0),
        }));
    }


    return (
        <WeekLayoutContext.Provider
            value={{
                extraRowsByDate,
                addExtraRow,
                removeExtraRow,
            }}
        >
            {children}
        </WeekLayoutContext.Provider>
    );
}


export function useWeekLayout() {

    const context = useContext(WeekLayoutContext);

    if (!context) {
        throw new Error(
            "useWeekLayout must be used inside WeekLayoutProvider"
        );
    }

    return context;
}