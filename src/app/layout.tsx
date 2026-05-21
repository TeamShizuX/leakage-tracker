import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#030303",
};

export const metadata: Metadata = {
  title: "Leakage Tracker",
  description: "AI-Powered WhatsApp Expense Tracker",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Leakage",
    statusBarStyle: "black-translucent",
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
      className={`${outfit.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1 mt-16">{children}</main>
      </body>
    </html>
  );
}
