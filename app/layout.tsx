import type { Metadata } from "next";
import { Geist, Geist_Mono, Black_Ops_One, Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import { AuthProvider } from "@/contexts/AuthContext";

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${blackOpsOne.variable} ${inter.variable} antialiased bg-background text-foreground min-h-screen font-sans`}
      >
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <footer className="bg-card border-t border-border mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="col-span-1 md:col-span-2">
                  <div className="mb-4">
                    <Logo size="lg" href="/" />
                  </div>
                  <p className="text-muted-foreground text-sm max-w-md font-inter">
                    Stay informed with news from popular newspapers, summarized
                    in just 60 words. Quick, accurate, and reliable news
                    summaries for busy readers.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-4 font-inter">
                    Quick Links
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground font-inter">
                    <li>
                      <Link
                        href="/"
                        className="hover:text-primary transition-colors"
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/trending"
                        className="hover:text-primary transition-colors"
                      >
                        Trending
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/categories"
                        className="hover:text-primary transition-colors"
                      >
                        Categories
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about"
                        className="hover:text-primary transition-colors"
                      >
                        About
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-4 font-inter">
                    Account
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground font-inter">
                    <li>
                      <Link
                        href="/auth/login"
                        className="hover:text-primary transition-colors"
                      >
                        Login
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/settings"
                        className="hover:text-primary transition-colors"
                      >
                        Settings
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy"
                        className="hover:text-primary transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terms"
                        className="hover:text-primary transition-colors"
                      >
                        Terms of Service
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground font-inter">
                <p>&copy; 2024 Briefly60. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
