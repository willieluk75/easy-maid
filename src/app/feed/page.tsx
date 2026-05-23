'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const DEMO_FEED: FeedItem[] = [
  { id: 'demo-1', worker_id: 'demo-w1', url: '/images/feed/feed-1.jpg', type: 'image', caption: '今日幫僱主打掃完廚房，灶台光亮如新 ✨', created_at: '2026-05-19T10:00:00Z', worker_name: 'Priya Sharma', nationality: '印度', photo_url: '/images/workers/worker-1.jpg', like_count: 24, liked: false, bookmarked: false },
  { id: 'demo-2', worker_id: 'demo-w2', url: '/images/feed/feed-2.jpg', type: 'image', caption: '為小朋友準備嘅健康午餐 🍱', created_at: '2026-05-18T12:30:00Z', worker_name: 'Siti Rahayu', nationality: '印尼', photo_url: '/images/workers/worker-2.jpg', like_count: 38, liked: false, bookmarked: false },
  { id: 'demo-3', worker_id: 'demo-w3', url: '/images/feed/feed-3.jpg', type: 'image', caption: '摺衫技巧分享！整齊又省位 👕', created_at: '2026-05-17T09:15:00Z', worker_name: 'Maria Santos', nationality: '菲律賓', photo_url: '/images/workers/worker-3.jpg', like_count: 15, liked: false, bookmarked: false },
  { id: 'demo-4', worker_id: 'demo-w4', url: '/images/feed/feed-4.jpg', type: 'image', caption: '同 BB 玩得好開心 😊', created_at: '2026-05-16T15:45:00Z', worker_name: 'Nandar Win', nationality: '緬甸', photo_url: '/images/workers/worker-4.jpg', like_count: 52, liked: false, bookmarked: false },
  { id: 'demo-5', worker_id: 'demo-w5', url: '/images/feed/feed-5.jpg', type: 'image', caption: '客廳打掃完畢，一塵不染 🏠', created_at: '2026-05-15T08:00:00Z', worker_name: 'Anita Gurung', nationality: '尼泊爾', photo_url: '/images/workers/worker-6.jpg', like_count: 19, liked: false, bookmarked: false },
];

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
  comment_count?: number;
}

interface Comment {
  id: string;
  media_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name: string | null;
  author_photo: string | null;
}

const PAGE_SIZE = 20;

function FeedSkeleton() {
  return (
    <div className="max-w-[512px] mx-auto py-4 px-4 space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[20px] overflow-hidden animate-pulse"
          style={{ boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px' }}>
          {/* Header skeleton */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-[#f7f7f7]" />
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-[#f7f7f7] rounded" />
              <div className="h-3 w-12 bg-[#f7f7f7] rounded-full" />
            </div>
          </div>
          {/* Image skeleton */}
          <div className="aspect-[16/10] bg-[#f7f7f7]" />
          {/* Actions skeleton */}
          <div className="px-4 py-3 flex items-center gap-2">
            <div className="h-5 w-5 bg-[#f7f7f7] rounded-full" />
            <div className="h-4 w-8 bg-[#f7f7f7] rounded" />
            <div className="flex-1" />
            <div className="h-5 w-5 bg-[#f7f7f7] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FeedPage() {
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const loadFeed = useCallback(async (uid: string | null) => {
    const { data, error } = await supabase.rpc('get_feed', {
      p_user_id: uid ?? null,
      p_offset: 0,
      p_limit: PAGE_SIZE,
    });
    if (!error && data && data.length > 0) {
      setItems(data as FeedItem[]);
      setHasMore(data.length >= PAGE_SIZE);
    } else {
      setItems(DEMO_FEED);
      setHasMore(false);
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

  const isDemoModeRef = useRef(false);
  isDemoModeRef.current = items.length > 0 && items[0].id.startsWith('demo-');

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore || isDemoModeRef.current) return;
    setLoadingMore(true);
    const { data, error } = await supabase.rpc('get_feed', {
      p_user_id: userId ?? null,
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

  const loadComments = async (mediaId: string) => {
    const { data } = await supabase
      .from('media_comments')
      .select('id, media_id, user_id, content, created_at')
      .eq('media_id', mediaId)
      .order('created_at', { ascending: true });
    if (data && data.length > 0) {
      // Get author info
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: workers } = await supabase
        .from('workers')
        .select('user_id, name, photo_url')
        .in('user_id', userIds);
      const workerMap = Object.fromEntries((workers || []).map((w: any) => [w.user_id, { name: w.name, photo_url: w.photo_url }]));
      const enriched = data.map(c => ({
        ...c,
        author_name: workerMap[c.user_id]?.name ?? null,
        author_photo: workerMap[c.user_id]?.photo_url ?? null,
      }));
      setComments(prev => ({ ...prev, [mediaId]: enriched as Comment[] }));
    }
    setExpandedComments(prev => new Set(prev).add(mediaId));
  };

  const handleSubmitComment = async (mediaId: string) => {
    const text = commentInputs[mediaId]?.trim();
    if (!text || !userId) return;

    const { data } = await supabase
      .from('media_comments')
      .insert({ media_id: mediaId, user_id: userId, content: text })
      .select('id, media_id, user_id, content, created_at')
      .single();

    if (data) {
      const { data: w } = await supabase
        .from('workers')
        .select('name, photo_url')
        .eq('user_id', userId)
        .single();
      const newComment: Comment = {
        ...data,
        author_name: w?.name ?? null,
        author_photo: w?.photo_url ?? null,
      };
      setComments(prev => ({
        ...prev,
        [mediaId]: [...(prev[mediaId] || []), newComment],
      }));
      setCommentInputs(prev => ({ ...prev, [mediaId]: '' }));
      setItems(prev => prev.map(it =>
        it.id === mediaId ? { ...it, comment_count: (it.comment_count ?? 0) + 1 } : it
      ));
    }
  };

  const handleLike = async (item: FeedItem) => {
    if (!userId && !isDemoModeRef.current) { router.push('/signin'); return; }

    setItems(prev => prev.map(it =>
      it.id !== item.id ? it : {
        ...it,
        liked: !it.liked,
        like_count: it.liked ? it.like_count - 1 : it.like_count + 1,
      }
    ));

    if (!isDemoModeRef.current) {
      if (item.liked) {
        await supabase.from('media_likes')
          .delete()
          .eq('media_id', item.id)
          .eq('user_id', userId);
      } else {
        await supabase.from('media_likes')
          .insert({ media_id: item.id, user_id: userId });
      }
    }
  };

  const handleBookmark = async (item: FeedItem) => {
    if (!userId && !isDemoModeRef.current) { router.push('/signin'); return; }

    setItems(prev => prev.map(it =>
      it.id !== item.id ? it : { ...it, bookmarked: !it.bookmarked }
    ));

    if (!isDemoModeRef.current) {
      if (item.bookmarked) {
        await supabase.from('media_bookmarks')
          .delete()
          .eq('media_id', item.id)
          .eq('user_id', userId);
      } else {
        await supabase.from('media_bookmarks')
          .insert({ media_id: item.id, user_id: userId });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <div className="sticky top-0 z-10 bg-white border-b border-[#f2f2f2] px-6 py-4 flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#222222]">動態</h1>
        </div>
        <FeedSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#f2f2f2] px-6 py-4 flex items-center justify-between">
        <h1 className="text-[28px] font-bold text-[#222222]">動態</h1>
        <div className="flex items-center gap-3">
          {userId && (
            <Link href="/notifications" className="relative text-[14px] text-[#222222] font-semibold hover:text-[#ff385c] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </Link>
          )}
          {userId ? (
            <Link href="/profile" className="text-[14px] text-[#222222] font-semibold hover:text-[#ff385c] transition-colors">我的資料</Link>
          ) : (
            <Link href="/signin" className="text-[14px] text-[#222222] font-semibold hover:text-[#ff385c] transition-colors">登入</Link>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 gap-5">
          <div className="w-20 h-20 rounded-full bg-[#fff3f5] flex items-center justify-center">
            <svg className="w-10 h-10 text-[#ff385c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-center space-y-1">
            <p className="text-base font-semibold text-[#222222]">暫時沒有動態</p>
            <p className="text-sm text-[#6a6a6a] font-normal">快啲去探索更多內容啦</p>
          </div>
          <Link
            href="/"
            className="mt-2 px-6 py-3 bg-[#222222] text-white text-sm font-semibold rounded-[8px] hover:bg-[#222222]/90 transition-colors"
          >
            開始探索
          </Link>
        </div>
      ) : (
        <div className="max-w-[512px] mx-auto py-4 px-4 space-y-4">
          {items.map(item => (
            <article
              key={item.id}
              className="bg-white rounded-[20px] overflow-hidden"
              style={{ boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px' }}
            >
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
                  <p className="text-base font-semibold text-[#222222] truncate">{item.worker_name}</p>
                  {item.nationality && (
                    <span className="text-xs bg-[#f2f2f2] px-2 py-0.5 rounded-full text-[#6a6a6a] font-normal">{item.nationality}</span>
                  )}
                </div>
              </div>

              {/* Media */}
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
                    className="w-full h-full object-contain rounded-[8px]"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="px-4 pt-3 pb-1 flex items-center">
                {/* Like */}
                <div className="flex items-center">
                  <button
                    onClick={() => handleLike(item)}
                    className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all"
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
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-white hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all"
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
                  <p className="text-[22px] font-semibold tracking-[-0.44px] text-[#222222] mb-1">{item.worker_name}</p>
                  <p className="text-sm text-[#6a6a6a] font-normal leading-[1.43]">{item.caption}</p>
                </div>
              )}

              {!item.caption && <div className="pb-2" />}

              {/* Comments section */}
              {!isDemoModeRef.current && (
                <div className="px-4 pb-3 border-t border-[#f2f2f2] mt-1">
                  {/* Comment toggle */}
                  <button
                    onClick={() => {
                      if (!expandedComments.has(item.id)) loadComments(item.id);
                      else setExpandedComments(prev => { const next = new Set(prev); next.delete(item.id); return next; });
                    }}
                    className="text-sm text-[#6a6a6a] font-medium py-2"
                  >
                    {expandedComments.has(item.id) ? '隱藏留言' : `查看留言${item.comment_count ? ` (${item.comment_count})` : ''}`}
                  </button>

                  {/* Comments list */}
                  {expandedComments.has(item.id) && comments[item.id]?.map(c => (
                    <div key={c.id} className="flex items-start gap-2 py-1.5">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-[#f7f7f7] flex-shrink-0 mt-0.5">
                        {c.author_photo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.author_photo} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-[#c1c1c1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#222222]">{c.author_name}</span>
                        <span className="text-xs text-[#6a6a6a] ml-1">{c.content}</span>
                      </div>
                    </div>
                  ))}

                  {/* Comment input */}
                  {userId && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#f2f2f2]">
                      <input
                        type="text"
                        value={commentInputs[item.id] || ''}
                        onChange={e => setCommentInputs(prev => ({ ...prev, [item.id]: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter') handleSubmitComment(item.id); }}
                        placeholder="留言..."
                        className="flex-1 text-xs bg-[#f7f7f7] rounded-full px-3 py-2 placeholder-[#929292] focus:outline-none focus:ring-1 focus:ring-[#222222]"
                      />
                      <button
                        onClick={() => handleSubmitComment(item.id)}
                        className="text-xs font-semibold text-[#ff385c] disabled:text-[#c1c1c1]"
                        disabled={!commentInputs[item.id]?.trim()}
                      >
                        發送
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}

          {/* Load More */}
          {hasMore && !isDemoModeRef.current && (
            <div className="flex justify-center py-4">
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
        </div>
      )}
    </div>
  );
}
