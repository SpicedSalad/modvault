import type { Metadata } from "next";
import { Inter, Silkscreen } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { MinecraftLoadingScreen } from "@/components/MinecraftLoadingScreen";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const silkscreen = Silkscreen({
  weight: ["400", "700"],
  variable: "--font-silkscreen",
  subsets: ["latin"],
});

const minecraftia = localFont({
  src: "./fonts/Minecraftia.ttf",
  variable: "--font-minecraftia",
});

export const metadata: Metadata = {
  title: "ModVault - Premium Minecraft Modding & Tweaks",
  description: "A premium Minecraft modding and tweaks community platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${silkscreen.variable} ${minecraftia.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <MinecraftLoadingScreen />
        <Navigation />
        <main className="flex-1 flex flex-col relative w-full overflow-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
