import { Zalando_Sans_SemiExpanded } from "next/font/google";
import type { Metadata } from "next";

import "./globals.css";

import { AppToaster } from "./components/AppToaster";

const mainFont = Zalando_Sans_SemiExpanded({
  variable: "--font-zalando",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
      <body className={`${mainFont.className} antialiased`}>
        {/* <SupabaseListener /> */}
        <h1 className="sr-only">ERP System</h1>
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
