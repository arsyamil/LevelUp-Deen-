import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";
import { routes } from "@/lib/routes";
import { ReactNode } from "react";

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
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-bg text-text antialiased`}
      >
        <ClerkProvider
          signInUrl={routes.login}
          signUpUrl={routes.register}
          signInFallbackRedirectUrl={routes.dashboard}
          signUpFallbackRedirectUrl={routes.onboarding}
          afterSignOutUrl={routes.login}
        >
          <RegisterServiceWorker />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
