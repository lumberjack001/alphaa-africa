import type { Metadata } from "next";
import { Montserrat, Outfit } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alphaaafrica.com"),
  title: {
    default: "Get the Cheapest and Best flights, Hotels and Tours anywhere in the world with Alphaa Africa",
    template: "%s | Alphaa Africa Travels & Tours",
  },
  description: "Get the cheapest and best flight deals, luxury hotel bookings, curated holiday tours, and visa assistance anywhere in the world with Alphaa Africa.",
  keywords: [
    "cheapest flights",
    "cheap flights to Africa",
    "best hotel booking deals",
    "curated safari tours",
    "holiday packages Africa",
    "Alphaa Africa Travels and Tours",
    "flight reservation Lagos",
    "cheap flight deals global",
    "hotel reservation Africa",
    "travel agency Lagos Nigeria",
  ],
  authors: [{ name: "Alphaa Africa Travels & Tours" }],
  creator: "Alphaa Africa",
  publisher: "Alphaa Africa",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Get the Cheapest and Best flights, Hotels and Tours anywhere in the world with Alphaa Africa",
    description: "Book affordable flights, luxury hotels, custom safari tours, and travel packages across Africa and worldwide with Alphaa Africa.",
    url: "https://alphaaafrica.com",
    siteName: "Alphaa Africa Travels & Tours",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Alphaa Africa Travels & Tours - Best Flight, Hotel & Tour Deals",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Get the Cheapest and Best flights, Hotels and Tours anywhere in the world with Alphaa Africa",
    description: "Book affordable flights, luxury hotels, and custom safari tours worldwide with Alphaa Africa.",
    images: ["/og-image.jpg"],
  },
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
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  "name": "Alphaa Africa Travels & Tours",
  "image": "https://alphaaafrica.com/logo.png",
  "@id": "https://alphaaafrica.com/#organization",
  "url": "https://alphaaafrica.com",
  "telephone": "+234 800 ALPHAA",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Victoria Island",
    "addressLocality": "Lagos",
    "addressCountry": "NG"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 6.4281,
    "longitude": 3.4219
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "opens": "08:00",
    "closes": "20:00"
  },
  "sameAs": [
    "https://facebook.com/alphaaafrica",
    "https://instagram.com/alphaaafrica",
    "https://twitter.com/alphaaafrica"
  ],
  "description": "Get the cheapest and best flight deals, luxury hotel bookings, curated holiday tours, and visa assistance anywhere in the world with Alphaa Africa."
};

import IdleTimeoutProvider from "@/components/IdleTimeoutProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${outfit.variable} h-full antialiased scroll-smooth`}
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col overflow-x-hidden">
        <IdleTimeoutProvider>
          {children}
        </IdleTimeoutProvider>
      </body>
    </html>
  );
}
