import { Manrope } from "next/font/google";
import type { Metadata } from "next";

import "./globals.css";

import { AppToaster } from "./components/AppToaster";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ERP System | Manage Your Business",
  description: "Developed to help you manage your business efficiently.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.className} antialiased`}>
        {/* <SupabaseListener /> */}
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
