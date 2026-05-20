'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface FeedItem {
  id: string;
  worker_id: string;
  url: string;
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

export default function FeedPage() {
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const loadFeed = useCallback(async (uid: string | null) => {
    const { data, error } = await supabase.rpc('get_feed', {
      p_user_id: uid ?? null,
    });
    if (!error && data) {
      setItems(data as FeedItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      loadFeed(uid);
    });
  }, [loadFeed]);

  const handleLike = async (item: FeedItem) => {
    if (!userId) { router.push('/signin'); return; }

    // Optimistic update
    setItems(prev => prev.map(it =>
      it.id !== item.id ? it : {
        ...it,
        liked: !it.liked,
        like_count: it.liked ? it.like_count - 1 : it.like_count + 1,
      }
    ));

    if (item.liked) {
      await supabase.from('media_likes')
        .delete()
        .eq('media_id', item.id)
        .eq('user_id', userId);
    } else {
      await supabase.from('media_likes')
        .insert({ media_id: item.id, user_id: userId });
    }
  };

  const handleBookmark = async (item: FeedItem) => {
    if (!userId) { router.push('/signin'); return; }

    // Optimistic update
    setItems(prev => prev.map(it =>
      it.id !== item.id ? it : { ...it, bookmarked: !it.bookmarked }
    ));

    if (item.bookmarked) {
      await supabase.from('media_bookmarks')
        .delete()
        .eq('media_id', item.id)
        .eq('user_id', userId);
    } else {
      await supabase.from('media_bookmarks')
        .insert({ media_id: item.id, user_id: userId });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[#6a6a6a] text-[14px]">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Top nav — Airbnb style */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#f2f2f2] px-6 py-4 flex items-center justify-between">
        <h1 className="page-title-airbnb">動態</h1>
        <div className="flex items-center gap-3">
          {userId ? (
            <Link href="/profile" className="text-[14px] text-[#222222] font-semibold hover:text-[#ff385c] transition-colors">我的資料</Link>
          ) : (
            <Link href="/signin" className="text-[14px] text-[#222222] font-semibold hover:text-[#ff385c] transition-colors">登入</Link>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#929292] space-y-3">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-[14px]">暫時沒有帖子</p>
        </div>
      ) : (
        <div className="max-w-[512px] mx-auto py-4 px-4 space-y-4">
          {items.map(item => (
            <article key={item.id} className="feed-card-airbnb">
              {/* Worker info row */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-[#f7f7f7] flex-shrink-0">
                  {item.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.photo_url} alt={item.worker_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#c1c1c1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#222222] truncate">{item.worker_name}</p>
                  {item.nationality && (
                    <p className="text-[12px] text-[#6a6a6a]">{item.nationality}</p>
                  )}
                </div>
              </div>

              {/* Media — Airbnb 16:10 aspect */}
              <div className="bg-black aspect-[16/10]">
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-contain"
                    controls
                    playsInline
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.caption ?? ''}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              {/* Actions — Airbnb circular icon buttons */}
              <div className="px-4 pt-3 pb-1 flex items-center">
                {/* Like */}
                <div className="flex items-center">
                  <button
                    onClick={() => handleLike(item)}
                    className="icon-btn-airbnb group"
                    aria-label={item.liked ? '取消讚好' : '讚好'}
                  >
                    <svg
                      className={`w-6 h-6 transition-colors ${item.liked ? 'text-[#ff385c] fill-[#ff385c]' : 'text-[#222222] group-active:text-[#ff385c]'}`}
                      viewBox="0 0 24 24"
                      fill={item.liked ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={item.liked ? 0 : 2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                  <span className={`text-[14px] font-medium ml-1 ${item.liked ? 'text-[#ff385c]' : 'text-[#222222]'}`}>
                    {item.like_count}
                  </span>
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Bookmark */}
                <button
                  onClick={() => handleBookmark(item)}
                  className="icon-btn-airbnb group"
                  aria-label={item.bookmarked ? '取消收藏' : '收藏'}
                >
                  <svg
                    className={`w-6 h-6 transition-colors ${item.bookmarked ? 'text-[#222222] fill-[#222222]' : 'text-[#222222] group-active:text-[#ff385c]'}`}
                    viewBox="0 0 24 24"
                    fill={item.bookmarked ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={item.bookmarked ? 0 : 2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>

              {/* Caption */}
              {item.caption && (
                <div className="px-4 pb-3">
                  <p className="text-[14px] text-[#222222] leading-[1.43]">
                    <span className="font-semibold mr-1">{item.worker_name}</span>
                    {item.caption}
                  </p>
                </div>
              )}

              {!item.caption && <div className="pb-2" />}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
