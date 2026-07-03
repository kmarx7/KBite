import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Noto_Sans_KR } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { getDir } from "@/lib/i18n/config";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import SavedSync from "@/components/SavedSync";
import type { Language } from "@/types";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://kbite.vercel.app";

export const metadata: Metadata = {
  title: "KBite — Find Your Home Food in Korea",
  description:
    "Location-based restaurant discovery for foreigners in Korea. Find halal, vegan, and authentic home cuisine near you.",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title: "KBite — Find Your Home Food in Korea",
    description:
      "Find halal, vegan, and authentic home cuisine restaurants in Korea. Available in 9 languages.",
    url: APP_URL,
    siteName: "KBite",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KBite — Find Your Home Food in Korea",
    description:
      "Find halal, vegan, and authentic home cuisine restaurants in Korea.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KBite",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF6B35",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await getLocale()) as Language;

  return (
    <html
      lang={locale}
      dir={getDir(locale)}
      className={`${plusJakarta.variable} ${notoSansKR.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-bg-tertiary text-text-primary">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <AnalyticsProvider />
        <SavedSync />
        <Analytics />
      </body>
    </html>
  );
}
