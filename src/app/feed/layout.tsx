import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '動態',
  description: '瀏覽外傭分享的日常生活動態',
};

export default function FeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
