"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function NextThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="themeMode"
      themes={["light", "dark"]}
    >
      {children}
    </NextThemesProvider>
  );
}
