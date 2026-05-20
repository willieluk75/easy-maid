import type { Metadata } from "next";
import BottomTabBar from "@/components/BottomTabBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Easy Maid — 僱主",
  description: "香港外傭招聘平台（僱主端）",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        <div className="pb-14">
          {children}
        </div>
        <BottomTabBar />
      </body>
    </html>
  );
}
