import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";

import { AuthBootstrap } from "@/components/AuthBootstrap";
import { Toaster } from "@/components/Toaster";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-app",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PayrollPilot",
  description: "Modern payroll and workforce management",
  applicationName: "PayrollPilot",
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", type: "image/png" }]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${sourceSerif.variable}`}>
      <body className="appBody">
        <AuthBootstrap />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
