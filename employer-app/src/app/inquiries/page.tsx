'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface InquiryWithWorker {
  id: string;
  message: string;
  status: string;
  created_at: string;
  worker_id: string;
  worker_name: string;
  worker_photo_url: string | null;
  worker_nationality: string | null;
}

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: '待回覆', bg: 'bg-[#fff8e1]', text: 'text-[#e67e22]' },
  replied: { label: '已回覆', bg: 'bg-[#e8f5e9]', text: 'text-[#2e7d32]' },
  closed:  { label: '已關閉', bg: 'bg-[#f2f2f2]', text: 'text-[#929292]' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

export default function EmployerInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<InquiryWithWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasEmployer, setHasEmployer] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/signin');
        return;
      }

      // Look up employer record
      const { data: emp } = await supabase
        .from('employers')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!emp) {
        setHasEmployer(false);
        setLoading(false);
        return;
      }

      setHasEmployer(true);

      // Fetch inquiries with worker info
      const { data: rows } = await supabase
        .from('inquiries')
        .select('id, message, status, created_at, worker_id')
        .eq('employer_id', emp.id)
        .order('created_at', { ascending: false });

      if (rows && rows.length > 0) {
        const workerIds = [...new Set(rows.map(r => r.worker_id))];
        const { data: workers } = await supabase
          .from('workers')
          .select('id, name, photo_url, nationality')
          .in('id', workerIds);

        const workerMap = new Map((workers || []).map(w => [w.id, w]));

        const items: InquiryWithWorker[] = rows.map(r => {
          const w = workerMap.get(r.worker_id);
          return {
            id: r.id,
            message: r.message,
            status: r.status,
            created_at: r.created_at,
            worker_id: r.worker_id,
            worker_name: w?.name || '未知外傭',
            worker_photo_url: w?.photo_url || null,
            worker_nationality: w?.nationality || null,
          };
        });
        setInquiries(items);
      }

      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <p className="text-[#6a6a6a] text-sm">載入中...</p>
      </div>
    );
  }

  if (hasEmployer === false) {
    return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <div className="sticky top-0 z-10 bg-white border-b border-[#f2f2f2] px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[#222222]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-[#222222]">我的詢問</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <span className="text-6xl mb-6">📝</span>
          <p className="text-lg text-[#6a6a6a] mb-2">尚未完成僱主登記</p>
          <p className="text-sm text-[#929292] mb-8">請先完成登記以查看詢問記錄</p>
          <Link
            href="/signup"
            className="bg-[#222222] text-white text-sm font-semibold rounded-[8px] px-8 h-12 hover:bg-black transition-colors inline-flex items-center justify-center"
          >
            前往登記
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#f2f2f2] px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-[#222222]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-semibold text-[#222222]">我的詢問</h1>
      </div>

      {inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <span className="text-6xl mb-6">💬</span>
          <p className="text-lg text-[#6a6a6a] mb-8">暫無詢問</p>
          <Link
            href="/workers"
            className="bg-[#222222] text-white text-sm font-semibold rounded-[8px] px-8 h-12 hover:bg-black transition-colors inline-flex items-center justify-center"
          >
            瀏覽外傭
          </Link>
        </div>
      ) : (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          {inquiries.map(inquiry => {
            const badge = STATUS_BADGE[inquiry.status] || STATUS_BADGE.closed;
            const isExpanded = expandedId === inquiry.id;

            return (
              <div
                key={inquiry.id}
                className="bg-white rounded-[14px] border border-[#f2f2f2] overflow-hidden"
                onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
              >
                <div className="p-4 flex items-start gap-3 cursor-pointer active:bg-[#f7f7f7] transition-colors">
                  {/* Worker avatar */}
                  <div className="w-12 h-12 rounded-full border border-[#f2f2f2] bg-[#f7f7f7] flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {inquiry.worker_photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={inquiry.worker_photo_url} alt={inquiry.worker_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg text-[#6a6a6a]">{inquiry.worker_name.charAt(0)}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-[#222222] truncate">{inquiry.worker_name}</p>
                      <span className="text-xs text-[#929292] flex-shrink-0 ml-2">{formatDate(inquiry.created_at)}</span>
                    </div>
                    <p className={`text-sm text-[#6a6a6a] ${isExpanded ? '' : 'line-clamp-1'}`}>{inquiry.message}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                      {inquiry.worker_nationality && (
                        <span className="text-xs text-[#929292]">{inquiry.worker_nationality}</span>
                      )}
                    </div>
                  </div>

                  {/* Expand icon */}
                  <svg
                    className={`w-4 h-4 text-[#c1c1c1] flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-[#f2f2f2]">
                    <div className="pt-3 space-y-2">
                      <div>
                        <span className="text-xs text-[#929292]">詢問內容</span>
                        <p className="text-sm text-[#222222] mt-0.5 whitespace-pre-wrap">{inquiry.message}</p>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-[#929292]">詢問日期：{formatDate(inquiry.created_at)}</span>
                        <Link
                          href={`/workers/${inquiry.worker_id}`}
                          className="text-xs text-[#222222] font-medium underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          查看外傭
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
