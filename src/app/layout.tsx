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
  title: "Alphaa Africa Travels & Tours",
  description: "Seamless Flights, Curated Holidays & Expert Support",
  icons: {
    icon: "/logo.png",
  },
};

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
      <body suppressHydrationWarning className="min-h-full flex flex-col overflow-x-hidden">{children}</body>
    </html>
  );
}
