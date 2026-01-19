import type { Metadata } from "next";
import { Geist, Geist_Mono, Black_Ops_One, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { ArticlesProvider } from "@/contexts/ArticlesContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Toaster } from "sonner";

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://briefly60.online",
  ),
  title: {
    default: "Briefly60 - News in 60 Words",
    template: "%s | Briefly60",
  },
  description:
    "Get the latest news from popular newspapers summarized in just 60 words. Stay informed quickly with brief, accurate news summaries.",
  keywords: [
    "news",
    "summarized news",
    "brief news",
    "60 words",
    "daily news",
    "quick news",
    "news summary",
    "newspaper",
    "current events",
  ],
  authors: [{ name: "Briefly60" }],
  creator: "Briefly60",
  publisher: "Briefly60",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Viewport and mobile optimization
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },

  // PWA and mobile
  manifest: "/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Briefly60",
  },

  // Open Graph
  openGraph: {
    type: "website",
    title: "Briefly60 - News in 60 Words",
    description:
      "Get the latest news from popular newspapers summarized in just 60 words. Stay informed quickly with brief, accurate news summaries.",
    siteName: "Briefly60",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Briefly60 - News in 60 Words",
      },
    ],
    locale: "en_US",
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Briefly60 - News in 60 Words",
    description:
      "Get the latest news from popular newspapers summarized in just 60 words. Stay informed quickly with brief, accurate news summaries.",
    images: ["/og-image.png"],
    creator: "@briefly60",
    site: "@briefly60",
  },

  // Verification tags (add your verification codes)
  verification: {
    google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // bing: "your-bing-verification-code",
  },

  // Additional meta tags
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "format-detection": "telephone=no",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Briefly60",
              url:
                process.env.NEXT_PUBLIC_SITE_URL || "https://briefly60.online",
              description:
                "Get the latest news from popular newspapers summarized in just 60 words",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://briefly60.online"}/discover?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${blackOpsOne.variable} ${inter.variable} ${liPadmasetu.variable} antialiased bg-background text-foreground min-h-screen font-sans`}
      >
        <ErrorBoundary>
          <ErrorProvider>
            <ThemeProvider>
              <AuthProvider>
                <ArticlesProvider>
                  <LayoutWrapper>{children}</LayoutWrapper>
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      className: "bg-background text-foreground border",
                    }}
                  />
                </ArticlesProvider>
              </AuthProvider>
            </ThemeProvider>
          </ErrorProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
