import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '外傭列表',
  description: '篩選和搜尋外傭',
};

export default function WorkersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
