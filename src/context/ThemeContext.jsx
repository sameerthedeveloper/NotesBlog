import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ThemeContext = createContext();

export const useAppTheme = () => useContext(ThemeContext);

export const AppThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("themeMode");
    return savedMode || "light";
  });

  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () => {
      const isLight = mode === "light";
      
      // Iconic Google Blue Tonal Palette (MD3)
      const palette = {
        mode,
        primary: {
          main: isLight ? "#0B57D0" : "#A8C7FA", 
          container: isLight ? "#D3E3FD" : "#0842A0",
          onContainer: isLight ? "#041E49" : "#D3E3FD",
        },
        secondary: {
          main: isLight ? "#444746" : "#C4C7C5",
          container: isLight ? "#E1E3E1" : "#333534",
        },
        background: {
          default: isLight ? "#F0F4F9" : "#131314", 
          paper: isLight ? "#FFFFFF" : "#1E1F22",   
        },
        surface: {
          main: isLight ? "#FFFFFF" : "#1F1F1F",
          variant: isLight ? "#E1E3E1" : "#444746",
        },
        text: {
          primary: isLight ? "#1F1F1F" : "#E3E3E3",
          secondary: isLight ? "#444746" : "#C4C7C5",
        },
        divider: isLight ? "#E1E3E1" : "#444746",
      };

      return createTheme({
        palette,
        shape: {
          borderRadius: 12, // Restored moderate radius
        },
        typography: {
          fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: { fontSize: "4rem", fontWeight: 800, letterSpacing: "-0.05em" },
          h2: { fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.04em" },
          h3: { fontSize: "2.25rem", fontWeight: 800, letterSpacing: "-0.03em" },
          h4: { fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em" },
          h5: { fontSize: "1.5rem", fontWeight: 700 },
          h6: { fontSize: "1.125rem", fontWeight: 700 },
          button: { fontWeight: 600, textTransform: "none", fontSize: "0.9375rem" },
          body1: { fontSize: "1rem", lineHeight: 1.6 },
          labelLarge: { fontSize: "0.875rem", fontWeight: 700 },
        },
        shadows: Array(25).fill("none"),
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarColor: isLight ? "#D3E3FD transparent" : "#0842A0 transparent",
                "&::-webkit-scrollbar": { width: "10px" },
                "&::-webkit-scrollbar-thumb": { 
                    backgroundColor: isLight ? "#C4C7C5" : "#444746", 
                    borderRadius: "10px",
                    border: `3px solid ${isLight ? '#F0F4F9' : '#131314'}`
                },
              },
            },
          },
          MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
              root: {
                borderRadius: 12, // Raised for standard MuiButtons
                padding: "8px 24px",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              },
              containedPrimary: {
                backgroundColor: palette.primary.main,
                color: "#FFFFFF",
                "&:hover": { backgroundColor: "#1765cc" },
              },
            },
          },
          MuiCard: {
            defaultProps: { variant: "elevation", elevation: 1 },
            styleOverrides: {
              root: {
                borderRadius: 16, // Beautiful 16px edge for cards
                border: `1px solid ${palette.divider}`,
                backgroundColor: palette.background.paper,
                boxShadow: isLight ? "0px 4px 12px rgba(0,0,0,0.04)" : "0px 4px 12px rgba(0,0,0,0.2)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                   borderColor: palette.primary.main,
                   backgroundColor: alpha(palette.primary.main, 0.02),
                }
              },
            },
          },
          MuiTextField: {
            defaultProps: { variant: "outlined" },
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 12, // Smooth inputs
                  backgroundColor: isLight ? alpha(palette.text.primary, 0.02) : alpha(palette.text.primary, 0.05),
                  "& fieldset": { borderColor: 'transparent' },
                  "&.Mui-focused": {
                      backgroundColor: isLight ? '#FFFFFF' : '#111111',
                      "& fieldset": { borderColor: palette.primary.main, borderWidth: '2px' },
                  }
                },
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundColor: isLight ? "#F0F4F9" : "#131314",
                color: palette.text.primary,
                boxShadow: "none",
                minHeight: 64,
                borderBottom: "none"
              },
            },
          },
          MuiDrawer: {
            styleOverrides: {
              paper: {
                backgroundColor: isLight ? "#F0F4F9" : "#131314",
                borderRight: "none",
                width: 256,
                padding: "12px",
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 12, // Soft highlight
                margin: "2px 8px",
                padding: "8px 20px",
                "&.Mui-selected": {
                  backgroundColor: palette.primary.container,
                  color: palette.primary.onContainer,
                  "& .MuiListItemIcon-root": { color: palette.primary.onContainer },
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 8, // Little radius for tags
                fontWeight: 600,
              }
            }
          },
          MuiFab: {
             styleOverrides: {
                 root: {
                     borderRadius: 16, // Return to Squircle
                     boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
                     backgroundColor: isLight ? '#FFFFFF' : '#333333',
                     color: palette.primary.main,
                     "&:hover": { backgroundColor: isLight ? '#f8f9fa' : '#444444' }
                 }
             }
          }
        },
      });
    },
    [mode]
  );

  const value = { mode, toggleColorMode };

  return (
    <ThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
