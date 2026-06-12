import { useColorScheme } from "react-native";
import { Colors } from "@/styles/Colors";
import { useThemeContext } from "@/providers/ThemeProvider";

export function useTheme() {
    const themeContext = useThemeContext();

    if (themeContext) {
        return themeContext.theme;
    }

    const scheme = useColorScheme();

    return scheme === "dark" ? Colors.dark : Colors.light;
}