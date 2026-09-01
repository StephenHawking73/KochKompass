import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { Colors } from "@/styles/Colors";
import type { ThemeType } from "@/styles/Theme";

export type ThemeMode = "light" | "dark" | "system";

type ThemeContextValue = {
    colorScheme: "light" | "dark";
    themeMode: ThemeMode;
    theme: ThemeType;
    isDark: boolean;
    setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const STORAGE_KEY = "app-theme-mode";

function resolveThemeMode(scheme: string | null | undefined): "light" | "dark" {
    return scheme === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>("system");

    useEffect(() => {
        const loadThemeMode = async () => {
            try {
                const storedThemeMode = await AsyncStorage.getItem(STORAGE_KEY);

                if (storedThemeMode === "light" || storedThemeMode === "dark" || storedThemeMode === "system") {
                    setThemeModeState(storedThemeMode);
                }
            } catch {
                // Theme preference is optional; avoid noisy console output in production builds.
            }
        };

        loadThemeMode();
    }, []);

    useEffect(() => {
        const persistThemeMode = async () => {
            try {
                await AsyncStorage.setItem(STORAGE_KEY, themeMode);
            } catch {
                // Theme preference is optional; avoid noisy console output in production builds.
            }
        };

        persistThemeMode();
    }, [themeMode]);

    const resolvedColorScheme = useMemo(() => {
        if (themeMode === "dark") {
            return "dark" as const;
        }

        if (themeMode === "light") {
            return "light" as const;
        }

        return resolveThemeMode(systemColorScheme);
    }, [themeMode, systemColorScheme]);

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
    };

    const value = useMemo(
        () => ({
            colorScheme: resolvedColorScheme,
            themeMode,
            theme: Colors[resolvedColorScheme],
            isDark: resolvedColorScheme === "dark",
            setThemeMode,
        }),
        [resolvedColorScheme, themeMode]
    );

    return (
        <ThemeContext.Provider value={value}>
            <StatusBar style={resolvedColorScheme === "dark" ? "light" : "dark"} />
            {children}
        </ThemeContext.Provider>
    );
}

export function useThemeContext() {
    return useContext(ThemeContext);
}
