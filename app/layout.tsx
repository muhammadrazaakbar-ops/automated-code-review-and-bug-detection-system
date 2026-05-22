import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CodeHawk",
    template: "%s",
  },
  description:
    "CodeHawk is an AI-powered GitHub app that reviews pull requests and flags bugs by severity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        jetbrainsMono.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full bg-background text-foreground font-sans flex flex-col">
        {children}
      </body>
    </html>
  );
}
