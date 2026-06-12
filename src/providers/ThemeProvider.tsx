import { StatusBar } from "expo-status-bar";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "@/styles/Colors";
import type { ThemeType } from "@/styles/Theme";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
    colorScheme: ThemeMode;
    theme: ThemeType;
    isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveThemeMode(scheme: string | null | undefined): ThemeMode {
    return scheme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const colorScheme = resolveThemeMode(useColorScheme());

    const value = useMemo(
        () => ({
            colorScheme,
            theme: Colors[colorScheme],
            isDark: colorScheme === "dark",
        }),
        [colorScheme]
    );

    return (
        <ThemeContext.Provider value={value}>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    return useContext(ThemeContext);
}
