import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Easy Maid",
  description: "Easy Maid App with Supabase Auth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
