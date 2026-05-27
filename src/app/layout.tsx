import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";
import Link from "next/link";

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
      <body className="min-h-full flex flex-col bg-[#030303] text-white">
        <Navbar />
        <main className="flex-1 mt-16">{children}</main>
        
        <footer className="w-full border-t border-white/5 bg-black/40 backdrop-blur-xl relative overflow-hidden mt-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-red-900/10 to-transparent pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
              
              <div className="flex flex-col items-center md:items-start gap-3">
                <h3 className="text-xl font-black tracking-tight text-white">
                  Leakage Tracker
                </h3>
                <p className="text-gray-500 text-sm font-light text-center md:text-left max-w-xs">
                  Stop setting your money on fire. AI-powered financial tracking and insights directly via WhatsApp.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <h4 className="text-sm font-bold text-white tracking-widest uppercase">Legal</h4>
                <div className="flex flex-col items-center gap-2">
                  <Link href="/privacy" className="text-sm text-gray-400 hover:text-red-400 transition-colors">Privacy Policy</Link>
                  <Link href="/terms" className="text-sm text-gray-400 hover:text-red-400 transition-colors">Terms & Conditions</Link>
                </div>
              </div>
              
              <div className="flex flex-col items-center md:items-end gap-1">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">
                  A Product From
                </p>
                <div className="inline-block relative group cursor-default">
                  <div className="relative px-4 py-2 bg-black/50 border border-white/5 rounded-lg flex items-center justify-center">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500 font-black text-lg tracking-widest uppercase">
                      Icarus Venture Studio
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-600 mt-4 max-w-[250px] text-center md:text-right">
                  We collect account and messaging data strictly to provide expense tracking services. Your data is encrypted and protected by strict database rules.
                </p>
                <p className="text-[10px] text-gray-600 mt-1">
                  &copy; {new Date().getFullYear()} Icarus Venture Studio. All rights reserved.
                </p>
              </div>

            </div>
          </div>
          {/* Extra padding for mobile bottom nav so it doesn't overlap footer */}
          <div className="h-24 sm:h-0"></div>
        </footer>
      </body>
    </html>
  );
}
