import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import BottomTabBar from "@/components/BottomTabBar";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

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
    <html lang="zh-TW" className={dmSans.variable}>
      <body className="antialiased">
        <div className="pb-14">
          {children}
        </div>
        <BottomTabBar />
      </body>
    </html>
  );
}
