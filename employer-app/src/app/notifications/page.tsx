'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  { href: '/notifications', label: '通知', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  )},
  { href: '/profile', label: '我的', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.375 3.375 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )},
];

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
  const pathname = usePathname();

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
    <div className="min-h-screen bg-[#f7f7f7] pb-14">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#f2f2f2] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-[28px] font-bold text-[#222222]">通知</h1>
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
        <div className="max-w-lg mx-auto px-4 py-4 space-y-2">
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
            const cls = `block rounded-[20px] p-4 transition-colors ${n.read ? 'bg-white' : 'bg-[#f0f7ff]'}`;
            const shadow = { boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px' } as const;
            return n.link ? (
              <Link key={n.id} href={n.link} className={cls} style={shadow} onClick={() => handleMarkRead(n.id, n.read)}>{inner}</Link>
            ) : (
              <div key={n.id} className={cls} style={shadow} onClick={() => handleMarkRead(n.id, n.read)}>{inner}</div>
            );
          })}
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
