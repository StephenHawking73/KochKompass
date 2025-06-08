import React, { createContext, ReactNode, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

export const ThemeContext = createContext({
    toggleTheme: () => {},
    isDarkTheme: false,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const colorSheme = useColorScheme();
    const [isDarkTheme, setIsDarkTheme] = useState(colorSheme === 'dark');

    const toggleTheme = () => {
        setIsDarkTheme(prevTheme => !prevTheme);
    };

    const theme = useMemo(() => (isDarkTheme ? MD3DarkTheme : MD3LightTheme), [isDarkTheme]);

    return (
        <ThemeContext.Provider value={{ toggleTheme, isDarkTheme }}>
            <PaperProvider theme={theme}>{children}</PaperProvider>
        </ThemeContext.Provider>
    )
}