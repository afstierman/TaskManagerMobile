import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme | null) => void;
  toggleTheme: () => void;
  userTheme: Theme | null;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
  userTheme: null,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemTheme = useSystemColorScheme() as Theme | null;
  const [userTheme, setUserTheme] = useState<Theme | null>(null);

  // theme: user override, else system
  const theme = useMemo<Theme>(() => userTheme || systemTheme || 'light', [userTheme, systemTheme]);

  const setTheme = (t: Theme | null) => setUserTheme(t);
  const toggleTheme = () => {
    setUserTheme((prev) => {
      if (prev) return prev === 'dark' ? 'light' : 'dark';
      // If no user override, toggle from system
      return (systemTheme === 'dark' ? 'light' : 'dark') as Theme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, userTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
