'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<string, { emoji: string; color: string }> = {
  inquiry_received: { emoji: '📨', color: 'bg-blue-50' },
  status_changed: { emoji: '🔄', color: 'bg-yellow-50' },
  comment_received: { emoji: '💬', color: 'bg-green-50' },
  system: { emoji: '🔔', color: 'bg-purple-50' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '剛剛';
  if (mins < 60) return `${mins} 分鐘前`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} 小時前`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} 日前`;
  return new Date(dateStr).toLocaleDateString('zh-TW');
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) loadNotifications(uid);
      else setLoading(false);
    });
  }, []);

  const loadNotifications = async (uid: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  };

  const markAllRead = async () => {
    if (!userId) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkRead = async (id: string, read: boolean) => {
    if (read) return;
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#f2f2f2] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/feed" className="text-[#222222]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-[#222222]">通知</h1>
          {unreadCount > 0 && (
            <span className="text-xs bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full font-medium">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-[#222222] font-medium">
            全部已讀
          </button>
        )}
      </div>

      {loading ? (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[20px] p-4 animate-pulse flex items-start gap-3"
              style={{ boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px' }}>
              <div className="w-10 h-10 rounded-full bg-[#f7f7f7]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-[#f7f7f7] rounded" />
                <div className="h-3 w-1/2 bg-[#f7f7f7] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <span className="text-4xl">🔔</span>
          <p className="text-sm text-[#6a6a6a]">暫時沒有通知</p>
        </div>
      ) : (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-2">
          {notifications.map(n => {
            const cfg = TYPE_ICONS[n.type] || TYPE_ICONS.system;
            const inner = (
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full ${cfg.color} flex items-center justify-center text-lg flex-shrink-0`}>
                  {cfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.read ? 'font-semibold text-[#222222]' : 'text-[#222222]'}`}>{n.title}</p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-[#ff385c] flex-shrink-0 mt-1.5" />}
                  </div>
                  {n.body && (
                    <p className="text-xs text-[#6a6a6a] mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                  <p className="text-xs text-[#929292] mt-1">{timeAgo(n.created_at)}</p>
                </div>
              </div>
            );
            const cls = `block rounded-[20px] p-4 transition-colors ${!n.read ? 'bg-[#f0f7ff]' : 'bg-white'}`;
            const shadow = { boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px' } as const;
            return n.link ? (
              <Link key={n.id} href={n.link} className={cls} style={shadow} onClick={() => handleMarkRead(n.id, n.read)}>{inner}</Link>
            ) : (
              <div key={n.id} className={cls} style={shadow} onClick={() => handleMarkRead(n.id, n.read)}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
