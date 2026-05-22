'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface InquiryWithEmployer {
  id: string;
  message: string;
  status: string;
  created_at: string;
  employer_id: string;
  employer_contact_name: string;
  employer_company_name: string | null;
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

export default function WorkerInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<InquiryWithEmployer[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hasWorker, setHasWorker] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/signin');
        return;
      }

      // Look up worker record
      const { data: w } = await supabase
        .from('workers')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!w) {
        setHasWorker(false);
        setLoading(false);
        return;
      }

      setHasWorker(true);

      // Fetch inquiries with employer info
      const { data: rows } = await supabase
        .from('inquiries')
        .select('id, message, status, created_at, employer_id')
        .eq('worker_id', w.id)
        .order('created_at', { ascending: false });

      if (rows && rows.length > 0) {
        const employerIds = [...new Set(rows.map(r => r.employer_id))];
        const { data: employers } = await supabase
          .from('employers')
          .select('id, contact_name, company_name')
          .in('id', employerIds);

        const empMap = new Map((employers || []).map(e => [e.id, e]));

        const items: InquiryWithEmployer[] = rows.map(r => {
          const emp = empMap.get(r.employer_id);
          return {
            id: r.id,
            message: r.message,
            status: r.status,
            created_at: r.created_at,
            employer_id: r.employer_id,
            employer_contact_name: emp?.contact_name || '未知僱主',
            employer_company_name: emp?.company_name || null,
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

  if (hasWorker === false) {
    return (
      <div className="min-h-screen bg-[#f7f7f7]">
        <div className="sticky top-0 z-10 bg-white border-b border-[#f2f2f2] px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[#222222]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-[#222222]">收到的詢問</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <span className="text-6xl mb-6">📋</span>
          <p className="text-lg text-[#6a6a6a] mb-2">尚未登記外傭資料</p>
          <p className="text-sm text-[#929292] mb-8">請先完成外傭登記以查看詢問</p>
          <Link
            href="/worker/register"
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
        <h1 className="text-base font-semibold text-[#222222]">收到的詢問</h1>
      </div>

      {inquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <span className="text-6xl mb-6">💬</span>
          <p className="text-lg text-[#6a6a6a] mb-8">暫無詢問</p>
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
                  {/* Employer avatar */}
                  <div className="w-12 h-12 rounded-full border border-[#f2f2f2] bg-[#f7f7f7] flex-shrink-0 flex items-center justify-center">
                    <span className="text-lg text-[#6a6a6a]">{inquiry.employer_contact_name.charAt(0)}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-[#222222] truncate">{inquiry.employer_contact_name}</p>
                      <span className="text-xs text-[#929292] flex-shrink-0 ml-2">{formatDate(inquiry.created_at)}</span>
                    </div>
                    {inquiry.employer_company_name && (
                      <p className="text-xs text-[#929292] mb-1">{inquiry.employer_company_name}</p>
                    )}
                    <p className={`text-sm text-[#6a6a6a] ${isExpanded ? '' : 'line-clamp-1'}`}>{inquiry.message}</p>
                    <div className="mt-2">
                      <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
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
