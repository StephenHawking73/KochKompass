import { useColorScheme } from "react-native";
import { Colors } from "@/styles/Colors";

export function useTheme() {
    const scheme = useColorScheme();

    return scheme === "dark" ? Colors.dark : Colors.light;
}