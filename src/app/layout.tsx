import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CompareFloatingButton } from "@/components/layout/CompareFloatingButton";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "PrismAlgo Studio — Premium Algorithm Visualizer",
  description:
    "A cinematic, educational algorithm visualization studio. Master sorting, pathfinding, trees, graphs, and dynamic programming with beautiful interactive animations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-radial-glow min-h-screen`}>
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
            <CompareFloatingButton />
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
