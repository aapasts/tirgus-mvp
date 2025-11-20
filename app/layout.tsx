import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Tirgus - Modern Marketplace",
  description: "The best place to buy and sell items.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lv">
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)}>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
