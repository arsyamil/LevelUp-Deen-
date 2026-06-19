import type { Metadata } from "next";
import { Audiowide } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { AppProviders } from "@/components/providers";
import { ReactNode } from "react";

const audiowide = Audiowide({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-audiowide",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Level Up Deen",
    template: "%s | Level Up Deen",
  },
  description:
    "Platform pengembangan diri harian berbasis gamifikasi Islami untuk Deen, Body, Mind, dan Wealth.",
  applicationName: "Level Up Deen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${audiowide.variable} ${geistSans.variable} ${geistMono.variable} min-h-screen bg-bg text-text antialiased`}
      >
        <AppProviders attribute="class" defaultTheme="dark" enableSystem={false}>
          <RegisterServiceWorker />
          {children}
          <Analytics />
          <SpeedInsights />
        </AppProviders>
      </body>
    </html>
  );
}
