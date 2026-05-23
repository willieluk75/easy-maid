import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Easy Maid — 香港外傭招聘平台",
    template: "%s | Easy Maid",
  },
  description: "Easy Maid 是香港首選外傭招聘平台，協助僱主尋找合適的家庭傭工。瀏覽外傭資料、技能及動態。",
  keywords: ["外傭", "香港", "家庭傭工", "招聘", "Easy Maid"],
  openGraph: {
    title: "Easy Maid — 香港外傭招聘平台",
    description: "瀏覽外傭資料、技能及動態，尋找最合適的家庭傭工。",
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
      <body>{children}</body>
    </html>
  );
}
