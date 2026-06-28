import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookIt | Live Event Booking Platform",
  description: "Discover and book tickets for live music concerts, tech conferences, comedy shows, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.className} ${geistMono.variable} h-full bg-slate-950 text-slate-100 flex flex-col antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <footer className="bg-slate-950 border-t border-slate-900 py-8 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} BookIt Inc. All rights reserved.</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
