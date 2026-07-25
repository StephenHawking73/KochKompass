import { useThemeContext } from "@/providers/ThemeProvider";
import { useColorScheme } from "react-native";

export function useThemeMode() {
    const themeContext = useThemeContext();

    if (themeContext) {
        return {
            colorScheme: themeContext.colorScheme,
            isDark: themeContext.isDark,
        };
    }

    const scheme = useColorScheme();
    const colorScheme = scheme === "dark" ? "dark" : "light";

    return {
        colorScheme,
        isDark: colorScheme === "dark",
    };
}