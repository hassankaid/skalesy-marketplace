import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

/** Sofia Pro — the Skalesy brand typeface, self-hosted across the whole UI. */
const sofiaPro = localFont({
  variable: "--font-sans",
  display: "swap",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "Segoe UI",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
  src: [
    { path: "../fonts/sofia-pro/SofiaPro-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/sofia-pro/SofiaPro-Italic.ttf", weight: "400", style: "italic" },
    { path: "../fonts/sofia-pro/SofiaPro-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/sofia-pro/SofiaPro-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/sofia-pro/SofiaPro-SemiBoldItalic.ttf", weight: "600", style: "italic" },
    { path: "../fonts/sofia-pro/SofiaPro-Bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/sofia-pro/SofiaPro-Black.ttf", weight: "900", style: "normal" },
  ],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Skalesy Marketplace",
    template: "%s · Skalesy Marketplace",
  },
  description:
    "Plateforme interne de pilotage Skalesy : centralise vision, tâches, questions, blocages, décisions, accès et roadmap d'un projet marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${sofiaPro.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
