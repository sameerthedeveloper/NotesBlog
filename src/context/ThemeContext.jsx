"use client";

import React, { createContext, useContext } from "react";
import { useTheme as useNextTheme } from "next-themes";

const ThemeContext = createContext();

export const useAppTheme = () => useContext(ThemeContext);

export const AppThemeProvider = ({ children }) => {
  const { theme, setTheme } = useNextTheme();
  const mode = theme === "dark" ? "dark" : "light";

  const toggleColorMode = () => {
    setTheme(mode === "light" ? "dark" : "light");
  };

  const value = { mode, toggleColorMode };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
