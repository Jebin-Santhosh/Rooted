import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext({
  mode: 'light',
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const systemScheme = Appearance.getColorScheme();
  const [mode, setMode] = useState(systemScheme === 'dark' ? 'dark' : 'light');

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(
    () => ({
      mode,
      isDark: mode === 'dark',
      toggleTheme,
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  return useContext(ThemeContext);
}

