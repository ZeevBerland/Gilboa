import type { Metadata, Viewport } from "next";
import { Heebo, Varela_Round } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { LanguageProvider } from "@/lib/language";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heading",
  display: "swap",
});

const varelaRound = Varela_Round({
  weight: "400",
  subsets: ["hebrew", "latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "מדד גלבוע | Gilboa Culinary Guide",
  description:
    "Browse restaurant reviews by Niv Gilboa. Search, watch video reviews, and share your own ratings.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical third-party origins to reduce LCP latency */}
        <link rel="preconnect" href="https://img.youtube.com" />
        <link rel="dns-prefetch" href="https://img.youtube.com" />
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_CONVEX_URL ?? ""}
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href={process.env.NEXT_PUBLIC_CONVEX_URL ?? ""}
        />
      </head>
      <body
        className={`${heebo.variable} ${varelaRound.variable} font-body antialiased min-h-screen flex flex-col`}
      >
        <ConvexClientProvider>
          <LanguageProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </LanguageProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
