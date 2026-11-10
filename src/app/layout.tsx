import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { SiteAppearanceProvider } from "@/components/theme/site-appearance-provider";
import { AppearanceInitScript } from "@/components/theme/appearance-init-script";

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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AppearanceInitScript />
        <SiteAppearanceProvider>{children}</SiteAppearanceProvider>
      </body>
    </html>
  );
}
