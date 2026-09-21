import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";
import {
  DEFAULT_LOCALE,
  getDirection,
  isValidLocale,
  LOCALE_COOKIE_NAME,
  type Locale,
} from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const cairoArabic = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Clinic Management System",
  description: "Modern healthcare SaaS platform for clinic booking and management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const initialLocale: Locale = isValidLocale(rawLocale)
    ? rawLocale
    : DEFAULT_LOCALE;
  const initialDir = getDirection(initialLocale);

  return (
    <html
      lang={initialLocale}
      dir={initialDir}
      className={`${geistSans.variable} ${geistMono.variable} ${cairoArabic.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Providers initialLocale={initialLocale}>{children}</Providers>
      </body>
    </html>
  );
}
