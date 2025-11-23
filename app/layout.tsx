import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./_styles/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeumorStudio",
  description: "Estudio de interfaces neumórficas + automatización",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased 
          min-h-screen
          bg-slate-100 text-slate-900
          dark:bg-slate-900 dark:text-slate-100
        `}
      >
        {children}
      </body>
    </html>
  );
}
