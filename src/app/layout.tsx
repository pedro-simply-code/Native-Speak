import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { AppI18nProvider } from "@/components/i18n/app-i18n-provider";
import { LocaleInitScript } from "@/components/i18n/locale-init-script";
import { defaultLocale } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Native Speak | Live Spanish with certified teachers",
  description:
    "Learn Spanish fast with live personalized online classes. Programs for preschool through adults and school partners.",
  icons: {
    icon: "/logo/native-speak-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang={defaultLocale}
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LocaleInitScript />
        <AppI18nProvider initialLocale={defaultLocale}>{children}</AppI18nProvider>
      </body>
    </html>
  );
}
