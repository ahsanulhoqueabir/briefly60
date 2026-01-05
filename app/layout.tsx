import type { Metadata } from "next";
import { Geist, Geist_Mono, Black_Ops_One, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Logo font - Bold and distinctive for "Briefly" branding
const blackOpsOne = Black_Ops_One({
  weight: ["400"],
  variable: "--font-black-ops-one",
  subsets: ["latin"],
});

// Content font - Excellent readability for news content
const inter = Inter({
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  subsets: ["latin"],
});

// Bangla font - Li Padmasetu Unicode for Bengali content
const liPadmasetu = localFont({
  src: [
    {
      path: "../fonts/Li Padmasetu Unicode.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Li Padmasetu Unicode Italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-li-padmasetu",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Briefly60 - News in 60 Words",
  description:
    "Get the latest news from popular newspapers summarized in just 60 words. Stay informed quickly with brief, accurate news summaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${blackOpsOne.variable} ${inter.variable} ${liPadmasetu.variable} antialiased bg-background text-foreground min-h-screen font-sans`}
      >
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className={`min-h-[calc(100vh-4rem)] pb-20 md:pb-0`}>
              {children}
            </main>
            <Footer />
            <MobileBottomNav />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
