import { useThemeContext, type ThemeMode } from "@/providers/ThemeProvider";
import { useColorScheme } from "react-native";

export function useThemeMode() {
    const themeContext = useThemeContext();

    if (themeContext) {
        return {
            colorScheme: themeContext.colorScheme,
            themeMode: themeContext.themeMode,
            isDark: themeContext.isDark,
            setThemeMode: themeContext.setThemeMode,
        };
    }

    const scheme = useColorScheme();
    const colorScheme = scheme === "dark" ? "dark" : "light";

    return {
        colorScheme,
        themeMode: "system" as ThemeMode,
        isDark: colorScheme === "dark",
        setThemeMode: () => undefined,
    };
}