import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Roboto_Slab } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { NextThemeProvider } from "@/components/providers/next-theme-provider";
import { AppThemeProvider } from "@/context/ThemeContext";
import { PlatformSettingsProvider } from "@/context/PlatformSettingsContext";
import { AuthProvider } from "@/context/AuthContext";
import { MonetizationProvider } from "@/context/MonetizationContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-app-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-app-mono",
  subsets: ["latin"],
});

const robotoSlab = Roboto_Slab({
  variable: "--font-app-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpenNotes - Secure Rich Text Notes",
  description:
    "OpenNotes - Modern, secure, HTML-based rich text note sharing platform.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "OpenNotes - Secure Rich Text Notes",
    description:
      "Create, edit, sanitize, and share rich text HTML notes effortlessly.",
    type: "website",
  },
  other: {
    "google-adsense-account": "ca-pub-4366510851653349",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetBrainsMono.variable} ${robotoSlab.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ErrorBoundary>
          <NextThemeProvider>
            <AppThemeProvider>
              <PlatformSettingsProvider>
                <AuthProvider>
                  <MonetizationProvider>
                    <TooltipProvider>
                      <Toaster position="top-right" richColors />
                      {children}
                      <ScrollToTopButton />
                    </TooltipProvider>
                  </MonetizationProvider>
                </AuthProvider>
              </PlatformSettingsProvider>
            </AppThemeProvider>
          </NextThemeProvider>
        </ErrorBoundary>
        <ServiceWorkerRegistration />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4366510851653349"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
