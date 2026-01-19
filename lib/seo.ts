import { Metadata } from "next";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: "website" | "article";
  canonicalUrl?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noIndex?: boolean;
}

export function generateSEOMetadata({
  title = "Briefly60 - News in 60 Words",
  description = "Get the latest news from popular newspapers summarized in just 60 words. Stay informed quickly with brief, accurate news summaries.",
  keywords = [
    "news",
    "summarized news",
    "brief news",
    "60 words",
    "daily news",
    "quick news",
  ],
  ogImage = "/og-image.png",
  ogType = "website",
  canonicalUrl,
  publishedTime,
  modifiedTime,
  author,
  noIndex = false,
}: SEOProps): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://briefly60.com";
  const fullCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  const fullOgImage = ogImage.startsWith("http")
    ? ogImage
    : `${siteUrl}${ogImage}`;

  return {
    title,
    description,
    keywords: keywords.join(", "),
    authors: author ? [{ name: author }] : undefined,
    robots: noIndex ? "noindex, nofollow" : "index, follow",

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
      title,
    },

    // Open Graph
    openGraph: {
      type: ogType,
      title,
      description,
      url: fullCanonicalUrl,
      siteName: "Briefly60",
      images: [
        {
          url: fullOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [fullOgImage],
      creator: "@briefly60",
      site: "@briefly60",
    },

    // Alternative URLs and canonical
    alternates: {
      canonical: fullCanonicalUrl,
    },

    // Additional meta tags
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "format-detection": "telephone=no",
    },
  };
}

// Schema.org structured data helper
export function generateSchemaOrg(
  type: "WebSite" | "NewsArticle" | "Organization",
  data: any,
) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://briefly60.com";

  const schemas: Record<string, any> = {
    WebSite: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Briefly60",
      url: baseUrl,
      description:
        "Get the latest news from popular newspapers summarized in just 60 words",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/discover?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },

    NewsArticle: {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      headline: data.title,
      description: data.description,
      image: data.image || `${baseUrl}/og-image.png`,
      datePublished: data.publishedTime,
      dateModified: data.modifiedTime || data.publishedTime,
      author: {
        "@type": data.authorType || "Organization",
        name: data.author || "Briefly60",
      },
      publisher: {
        "@type": "Organization",
        name: "Briefly60",
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`,
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": data.url || baseUrl,
      },
    },

    Organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Briefly60",
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      description: "News summarization platform",
      sameAs: [
        // Add your social media URLs here
      ],
    },
  };

  return schemas[type];
}
