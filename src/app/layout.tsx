import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { BRAND } from "@/lib/constants";

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
  metadataBase: new URL(BRAND.url),
  title: {
    default: `${BRAND.name} - AI Agent Token Launchpad`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.tagline,
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: `${BRAND.name} - AI Agent Token Launchpad`,
    description: BRAND.tagline,
    url: BRAND.url,
    siteName: BRAND.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${BRAND.name} - AI Agent Token Launchpad`,
    description: BRAND.tagline,
    creator: BRAND.twitter,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
