'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface BookmarkItem {
  id: string;
  media_id: string;
  url: string;
  type: string;
  caption: string | null;
  worker_id: string;
  worker_name: string;
  nationality: string | null;
  photo_url: string | null;
  created_at: string;
}

const CARD_SHADOW = 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px';

const TABS = [
  { href: '/workers', label: '外傭', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )},
  { href: '/feed', label: '動態', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  )},
  { href: '/bookmarks', label: '收藏', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
    </svg>
  )},
  { href: '/profile', label: '我的', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )},
];

export default function BookmarksPage() {
  const [mediaBookmarks, setMediaBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }

      const { data: bookmarks } = await supabase
        .from('media_bookmarks')
        .select('id, media_id, created_at')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (bookmarks && bookmarks.length > 0) {
        const mediaIds = bookmarks.map(b => b.media_id);
        const { data: mediaData } = await supabase
          .from('worker_media')
          .select('id, url, type, caption, worker_id')
          .in('id', mediaIds);

        if (mediaData && mediaData.length > 0) {
          const workerIds = [...new Set(mediaData.map(m => m.worker_id))];
          const { data: workersData } = await supabase
            .from('workers')
            .select('id, name, nationality, photo_url')
            .in('id', workerIds);

          const workerMap = new Map((workersData || []).map(w => [w.id, w]));

          const items: BookmarkItem[] = mediaData.map(m => {
            const w = workerMap.get(m.worker_id);
            const bm = bookmarks.find(b => b.media_id === m.id);
            return {
              id: bm?.id || '',
              media_id: m.id,
              url: m.url,
              type: m.type,
              caption: m.caption,
              worker_id: m.worker_id,
              worker_name: w?.name || '',
              nationality: w?.nationality || null,
              photo_url: w?.photo_url || null,
              created_at: bm?.created_at || '',
            };
          });
          setMediaBookmarks(items);
        }
      }
      setLoading(false);
    });
  }, []);

  // Not logged in
  if (!userId && !loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] pb-14">
        <div className="sticky top-0 z-10 bg-white border-b border-[#f2f2f2]">
          <div className="max-w-lg mx-auto px-4 py-3">
            <h1 className="text-[28px] font-bold text-[#222222]">收藏</h1>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-24 px-4">
          <span className="text-6xl mb-6">🔖</span>
          <p className="text-lg text-[#6a6a6a] mb-8">登入後查看收藏</p>
          <Link
            href="/signin"
            className="bg-[#222222] text-white text-sm font-semibold rounded-[8px] px-8 h-12 hover:bg-black transition-colors"
          >
            登入
          </Link>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#f2f2f2] h-14">
          <div className="max-w-lg mx-auto flex items-center justify-around h-full">
            {TABS.map(tab => {
              const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] transition-colors ${
                    active ? 'text-[#222222]' : 'text-[#6a6a6a]'
                  }`}
                >
                  <span style={{ color: active ? '#222222' : '#6a6a6a' }}>{tab.icon}</span>
                  <span className="text-xs font-medium">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-14">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#f2f2f2]">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-[28px] font-bold text-[#222222]">收藏</h1>
        </div>
      </div>

      {loading ? (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-white rounded-[20px] p-4 animate-pulse"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <div className="w-20 h-20 rounded-[8px] bg-[#dddddd] flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-5 w-28 bg-[#dddddd] rounded" />
                <div className="h-4 w-20 bg-[#dddddd] rounded-full" />
              </div>
              <svg className="w-4 h-4 text-[#c1c1c1] flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))}
        </div>
      ) : mediaBookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <span className="text-6xl mb-6">🔖</span>
          <p className="text-lg text-[#6a6a6a] mb-8">還沒有收藏</p>
          <Link
            href="/workers"
            className="bg-[#222222] text-white text-sm font-semibold rounded-[8px] px-8 h-12 hover:bg-black transition-colors"
          >
            探索外傭
          </Link>
        </div>
      ) : (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          {mediaBookmarks.map(item => (
            <Link
              key={item.id}
              href={`/workers/${item.worker_id}`}
              className="flex items-start gap-4 bg-white rounded-[20px] p-4 active:bg-[#f7f7f7] transition-colors"
              style={{ boxShadow: CARD_SHADOW }}
            >
              {/* Thumbnail */}
              <div className="w-20 h-20 rounded-[8px] overflow-hidden bg-[#f7f7f7] flex-shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-[#222222] truncate mb-1">{item.worker_name}</p>
                {item.nationality && (
                  <span className="inline-block text-xs bg-[#f2f2f2] text-[#222222] px-2.5 py-0.5 rounded-full">
                    {item.nationality}
                  </span>
                )}
              </div>

              {/* Chevron */}
              <svg className="w-4 h-4 text-[#c1c1c1] flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#f2f2f2] h-14">
        <div className="max-w-lg mx-auto flex items-center justify-around h-full">
          {TABS.map(tab => {
            const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href));
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] transition-colors ${
                  active ? 'text-[#222222]' : 'text-[#6a6a6a]'
                }`}
              >
                <span style={{ color: active ? '#222222' : '#6a6a6a' }}>{tab.icon}</span>
                <span className="text-xs font-medium">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
