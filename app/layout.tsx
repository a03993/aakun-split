import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Providers from "@/app/providers";

import Header from "@/app/_components/Header";

import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        template: "%s | 分帳AA君",
        default: "分帳AA君",
    },
    description: "專門解決算錢難題，聚餐出遊輕鬆記錄，精準AA讓感情不降溫！",
    openGraph: {
        siteName: "分帳AA君",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="zh-TW" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
            <body className="flex h-screen flex-col">
                <Providers>
                    <Header />
                    <main className="flex flex-1 flex-col overflow-auto bg-gray-50">{children}</main>
                </Providers>
            </body>
        </html>
    );
}
