'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface FeedItem {
  id: string;
  worker_id: string;
  url: string;
  storage_path: string | null;
  type: string;
  caption: string | null;
  created_at: string;
  worker_name: string;
  nationality: string | null;
  photo_url: string | null;
  like_count: number;
  liked: boolean;
  bookmarked: boolean;
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
  { href: '/profile', label: '我的', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )},
];

const DEMO_FEED: FeedItem[] = [
  {
    id: 'demo-1', worker_id: 'demo-w1', url: '/images/feed/feed-1.jpg', storage_path: null, type: 'image',
    caption: '今日幫僱主打掃完廚房，灶台光亮如新 ✨', created_at: '2026-05-19T10:00:00Z',
    worker_name: 'Priya Sharma', nationality: '印度', photo_url: '/images/workers/worker-1.jpg',
    like_count: 24, liked: false, bookmarked: false,
  },
  {
    id: 'demo-2', worker_id: 'demo-w2', url: '/images/feed/feed-2.jpg', storage_path: null, type: 'image',
    caption: '為小朋友準備嘅健康午餐 🍱', created_at: '2026-05-18T12:30:00Z',
    worker_name: 'Siti Rahayu', nationality: '印尼', photo_url: '/images/workers/worker-2.jpg',
    like_count: 38, liked: false, bookmarked: false,
  },
  {
    id: 'demo-3', worker_id: 'demo-w3', url: '/images/feed/feed-3.jpg', storage_path: null, type: 'image',
    caption: '摺衫技巧分享！整齊又省位 👕', created_at: '2026-05-17T09:15:00Z',
    worker_name: 'Maria Santos', nationality: '菲律賓', photo_url: '/images/workers/worker-3.jpg',
    like_count: 15, liked: false, bookmarked: false,
  },
  {
    id: 'demo-4', worker_id: 'demo-w4', url: '/images/feed/feed-4.jpg', storage_path: null, type: 'image',
    caption: '同 BB 玩得好開心 😊', created_at: '2026-05-16T15:45:00Z',
    worker_name: 'Nandar Win', nationality: '緬甸', photo_url: '/images/workers/worker-4.jpg',
    like_count: 52, liked: false, bookmarked: false,
  },
  {
    id: 'demo-5', worker_id: 'demo-w5', url: '/images/feed/feed-5.jpg', storage_path: null, type: 'image',
    caption: '客廳打掃完畢，一塵不染 🏠', created_at: '2026-05-15T11:00:00Z',
    worker_name: 'Anita Gurung', nationality: '尼泊爾', photo_url: '/images/workers/worker-6.jpg',
    like_count: 19, liked: false, bookmarked: false,
  },
];

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();

  const PAGE_SIZE = 20;

  const fetchFeed = async (uid: string | null) => {
    const { data, error } = await supabase.rpc('get_feed', {
      p_user_id: uid,
      p_offset: 0,
      p_limit: PAGE_SIZE,
    });
    if (!error && data && data.length > 0) {
      setItems(data as FeedItem[]);
      setHasMore(data.length >= PAGE_SIZE);
    } else {
      setItems([...DEMO_FEED]);
      setHasMore(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      fetchFeed(uid);
    });
  }, []);

  const isDemo = items.length > 0 && items[0].id.startsWith('demo-');

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || isDemo) return;
    setLoadingMore(true);
    const { data, error } = await supabase.rpc('get_feed', {
      p_user_id: userId,
      p_offset: items.length,
      p_limit: PAGE_SIZE,
    });
    if (!error && data && data.length > 0) {
      setItems(prev => [...prev, ...(data as FeedItem[])]);
      setHasMore(data.length >= PAGE_SIZE);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  };

  const toggleLike = async (item: FeedItem, index: number) => {
    const newLiked = !item.liked;
    setItems(prev => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        liked: newLiked,
        like_count: next[index].like_count + (newLiked ? 1 : -1),
      };
      return next;
    });

    if (!userId) return;
    if (newLiked) {
      await supabase.from('media_likes').insert({
        user_id: userId,
        media_id: item.id,
      });
    } else {
      await supabase
        .from('media_likes')
        .delete()
        .eq('user_id', userId)
        .eq('media_id', item.id);
    }
  };

  const toggleBookmark = async (item: FeedItem, index: number) => {
    const newBookmarked = !item.bookmarked;
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], bookmarked: newBookmarked };
      return next;
    });

    if (!userId) return;
    if (newBookmarked) {
      await supabase.from('media_bookmarks').insert({
        user_id: userId,
        media_id: item.id,
      });
    } else {
      await supabase
        .from('media_bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('media_id', item.id);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-14">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#f2f2f2]">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-[28px] font-bold text-[#222222]">動態</h1>
        </div>
      </div>

      {loading ? (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-[20px] overflow-hidden animate-pulse"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <div className="flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-full bg-[#dddddd] flex-shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-24 bg-[#dddddd] rounded" />
                  <div className="h-4 w-16 bg-[#dddddd] rounded-full" />
                </div>
              </div>
              <div className="aspect-[16/10] bg-[#dddddd]" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-[#dddddd] rounded" />
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#dddddd]" />
                  <div className="w-10 h-10 rounded-full bg-[#dddddd]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <span className="text-6xl">📸</span>
          <p className="text-[#6a6a6a] text-sm">暫時沒有動態</p>
          <Link
            href="/workers"
            className="bg-[#222222] text-white text-sm font-semibold px-6 py-3 rounded-[8px] hover:bg-[#000000] transition-colors"
          >
            瀏覽外傭
          </Link>
        </div>
      ) : (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-[20px] overflow-hidden"
              style={{ boxShadow: CARD_SHADOW }}
            >
              {/* Worker header */}
              <Link
                href={`/workers/${item.worker_id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#f7f7f7] transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f7f7f7] flex-shrink-0">
                  {item.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.photo_url} alt={item.worker_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <p className="text-sm font-semibold text-[#222222] truncate">{item.worker_name}</p>
                  {item.nationality && (
                    <span className="flex-shrink-0 text-xs bg-[#f2f2f2] text-[#222222] rounded-full px-2 py-0.5">
                      {item.nationality}
                    </span>
                  )}
                </div>
              </Link>

              {/* Media */}
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  controls
                  playsInline
                  className="w-full aspect-[16/10] object-cover bg-black rounded-[8px] mx-3"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.caption || ''}
                  className="w-full aspect-[16/10] object-cover rounded-[8px] mx-3"
                />
              )}

              {/* Caption */}
              {item.caption && (
                <p className="px-4 pt-3 text-sm text-[#3f3f3f]">{item.caption}</p>
              )}

              {/* Actions */}
              <div className="flex items-center px-4 py-3">
                <button
                  onClick={() => toggleLike(item, index)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/80 hover:shadow-md transition-all"
                  aria-label="Like"
                >
                  {item.liked ? (
                    <svg className="w-5 h-5 text-[#c13515]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-[#929292]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  )}
                </button>

                <span className="text-sm text-[#6a6a6a] ml-1">
                  {item.like_count > 0 ? item.like_count : ''}
                </span>

                <div className="flex-1" />

                <button
                  onClick={() => toggleBookmark(item, index)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/80 hover:shadow-md transition-all"
                  aria-label="Bookmark"
                >
                  {item.bookmarked ? (
                    <svg className="w-5 h-5 text-[#ff385c]" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-[#929292]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {!loading && hasMore && !isDemo && (
        <div className="max-w-lg mx-auto px-4 pb-4 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-6 py-3 bg-white text-[#222222] text-sm font-semibold rounded-full border border-[#dddddd] hover:bg-[#f7f7f7] transition-colors disabled:opacity-50"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                載入中...
              </span>
            ) : '載入更多'}
          </button>
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
