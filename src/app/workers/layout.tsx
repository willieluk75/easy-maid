import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '外傭列表',
  description: '瀏覽所有可用的外傭資料',
};

export default function WorkersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
