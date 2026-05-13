import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mr.Seager's music web-player",
  description: "Mr.Seager's music web-player created using Next.JS, TypeScript and Tailwind",
  icons: { 
    icon: "/images/music-note-icon-34232.png", 
  },
  openGraph: {
    title: "Mr.Seager's music web-player",
    description: "X-Men characters page created using Next.JS, TypeScript and Tailwind",
    images: [
      {
        url: "/images/Screenshot_12-5-2026_103158_localhost.jpeg",
        width: 200,
        height: 200,
      },
    ],
  },
  twitter: {
    card: "summary",
    images: ["/images/Screenshot_12-5-2026_103158_localhost.jpeg"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
