'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function FeedPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchFeed = async (uid: string | null) => {
    const { data, error } = await supabase.rpc('get_feed', {
      p_user_id: uid,
    });
    if (!error && data) {
      setItems(data as FeedItem[]);
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

  const toggleLike = async (item: FeedItem, index: number) => {
    if (!userId) return;

    // Optimistic update
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
    if (!userId) return;

    const newBookmarked = !item.bookmarked;
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], bookmarked: newBookmarked };
      return next;
    });

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
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#dddddd] px-4 py-3">
        <h1 className="text-base font-bold text-[#222222]">動態</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <p className="text-[#929292] text-sm">載入中...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#929292] space-y-2">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <p className="text-sm">暫時沒有動態</p>
        </div>
      ) : (
        <div className="max-w-lg mx-auto space-y-4 py-4">
          {items.map((item, index) => (
            <div key={item.id} className="bg-white rounded-[14px] shadow-sm overflow-hidden">
              {/* Worker header — clickable */}
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
                <div>
                  <p className="text-sm font-semibold text-[#222222]">{item.worker_name}</p>
                  {item.nationality && (
                    <p className="text-xs text-[#929292]">{item.nationality}</p>
                  )}
                </div>
              </Link>

              {/* Media */}
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  controls
                  playsInline
                  className="w-full max-h-[500px] object-cover bg-black"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.caption || ''}
                  className="w-full max-h-[500px] object-cover"
                />
              )}

              {/* Caption */}
              {item.caption && (
                <p className="px-4 pt-3 text-sm text-[#3f3f3f]">{item.caption}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 px-4 py-3">
                <button
                  onClick={() => toggleLike(item, index)}
                  className="flex items-center gap-1.5 group"
                >
                  {item.liked ? (
                    <svg className="w-5 h-5 text-[#c13515]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-[#929292] group-hover:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  )}
                  <span className={`text-xs font-medium ${item.liked ? 'text-[#c13515]' : 'text-[#929292]'}`}>
                    {item.like_count > 0 ? item.like_count : ''}
                  </span>
                </button>

                <button
                  onClick={() => toggleBookmark(item, index)}
                  className="flex items-center gap-1.5 group"
                >
                  {item.bookmarked ? (
                    <svg className="w-5 h-5 text-[#ff385c]" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0111.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 01-1.085.67L12 18.089l-7.165 3.583A.75.75 0 013.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-[#929292] group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    </div>
  );
}
