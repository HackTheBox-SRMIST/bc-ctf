import BackgroundEffects from "@/components/BackgroundEffects";
import CursorProvider from "@/components/CursorProvider";
import type { Metadata } from "next";
import { Press_Start_2P, Roboto_Mono, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const pixelFont = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const techFont = Share_Tech_Mono({
  variable: "--font-tech",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const monoFont = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BC-CTF",
  description: "Black Cat CTF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="no-scrollbar overflow-hidden" suppressHydrationWarning>
      <body
        className={`${pixelFont.variable} ${monoFont.variable} ${techFont.variable} antialiased no-scrollbar overflow-hidden w-full h-screen`}
        suppressHydrationWarning
      >
        <BackgroundEffects />
        <CursorProvider />
        {children}
      </body>
    </html>
  );
}
