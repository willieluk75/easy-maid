'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function BookmarksPage() {
  const [tab, setTab] = useState<'media' | 'workers'>('media');
  const [mediaBookmarks, setMediaBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }

      // Fetch bookmarked media with worker info
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

  if (!userId && !loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <div className="sticky top-0 z-10 bg-white border-b border-[#dddddd] px-4 py-3">
          <h1 className="text-base font-bold text-[#222222]">收藏</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-24 text-[#929292] space-y-3">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          <p className="text-sm">請先登入查看收藏</p>
          <Link href="/signin" className="text-sm text-[#ff385c] font-medium">前往登入</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#dddddd]">
        <div className="px-4 py-3">
          <h1 className="text-base font-bold text-[#222222]">收藏</h1>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-[#dddddd]">
          <button
            onClick={() => setTab('media')}
            className={`flex-1 text-sm font-medium py-2 border-b-2 transition-colors ${
              tab === 'media'
                ? 'text-[#ff385c] border-blue-600'
                : 'text-[#929292] border-transparent hover:text-[#3f3f3f]'
            }`}
          >
            媒體
          </button>
          <button
            onClick={() => setTab('workers')}
            className={`flex-1 text-sm font-medium py-2 border-b-2 transition-colors ${
              tab === 'workers'
                ? 'text-[#ff385c] border-blue-600'
                : 'text-[#929292] border-transparent hover:text-[#3f3f3f]'
            }`}
          >
            外傭
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-[#929292] text-sm">載入中...</p>
        </div>
      ) : tab === 'media' ? (
        mediaBookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#929292] space-y-2">
            <p className="text-sm">還沒有收藏的媒體</p>
          </div>
        ) : (
          <div className="max-w-lg mx-auto grid grid-cols-3 gap-1 p-1">
            {mediaBookmarks.map(item => (
              <Link
                key={item.id}
                href={`/workers/${item.worker_id}`}
                className="aspect-square overflow-hidden bg-[#f7f7f7] relative"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-[#929292] space-y-2">
          <p className="text-sm">外傭收藏功能即將推出</p>
        </div>
      )}
    </div>
  );
}
