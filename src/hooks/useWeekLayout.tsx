import React, { createContext, useContext, useState } from "react";


type WeekLayoutContextType = {
    extraRowsByDate: Record<string, number>;
    addExtraRow: (date: string) => void;
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


    return (
        <WeekLayoutContext.Provider
            value={{
                extraRowsByDate,
                addExtraRow,
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