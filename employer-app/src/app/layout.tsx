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
  title: {
    default: "Easy Maid 僱主 — 香港外傭招聘平台",
    template: "%s | Easy Maid 僱主",
  },
  description: "Easy Maid 僱主端 — 瀏覽外傭資料、發送查詢、管理收藏",
  keywords: ["香港外傭", "家庭傭工", "招聘", "Easy Maid", "僱主", "外傭平台"],
  openGraph: {
    title: "Easy Maid 僱主 — 香港外傭招聘平台",
    description: "瀏覽外傭資料、發送查詢、管理收藏，輕鬆招聘合適的家庭傭工。",
    siteName: "Easy Maid",
    locale: "zh_TW",
    type: "website",
  },
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
