import { Colors } from "./Colors";

export type ThemeType = typeof Colors.light;

export const LightTheme = Colors.light;
export const DarkTheme = Colors.dark;
export const Theme = Colors; // statischer Zugriff auf beide Themes 