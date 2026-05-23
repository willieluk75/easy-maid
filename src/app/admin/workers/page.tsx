'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Worker {
  id: string;
  name: string | null;
  nationality: string | null;
  photo_url: string | null;
  status: string;
  created_at: string;
  code: string | null;
}

const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: 'Pending' },
  { key: 'available', label: 'Available' },
  { key: 'processing', label: 'Processing' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' },
] as const;

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  available: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  hired: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function AdminWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    supabase
      .from('workers')
      .select('id,name,nationality,photo_url,status,created_at,code')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setWorkers(data as Worker[]);
        setLoading(false);
      });
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: workers.length };
    for (const w of workers) {
      c[w.status] = (c[w.status] ?? 0) + 1;
    }
    return c;
  }, [workers]);

  const filtered = useMemo(
    () => activeTab === 'all' ? workers : workers.filter(w => w.status === activeTab),
    [workers, activeTab],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[#222222] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#222222] mb-4">工人管理</h1>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#222222] text-white'
                : 'bg-white text-[#6a6a6a] border border-[#dddddd] hover:border-[#222222]'
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">{counts[tab.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Worker list */}
      {filtered.length === 0 ? (
        <p className="text-center text-[#6a6a6a] py-20">沒有符合條件的工人</p>
      ) : (
        <div className="space-y-2">
          {filtered.map(w => (
            <Link
              key={w.id}
              href={`/admin/workers/${w.id}`}
              className="flex items-center gap-4 bg-white rounded-xl p-4 border border-[#dddddd] hover:border-[#222222] transition-colors"
            >
              {/* Photo */}
              <div className="w-12 h-12 rounded-full overflow-hidden bg-[#f7f7f7] flex-shrink-0">
                {w.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={w.photo_url} alt={w.name ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#c1c1c1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-[#222222] truncate">
                  {w.name || '未填寫姓名'}
                </p>
                <p className="text-xs text-[#6a6a6a]">
                  {w.code && <span className="font-mono mr-2">{w.code}</span>}
                  {w.nationality}
                  {w.created_at && (
                    <span className="ml-2">{new Date(w.created_at).toLocaleDateString('zh-TW')}</span>
                  )}
                </p>
              </div>

              {/* Status badge */}
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[w.status] ?? 'bg-gray-100 text-gray-800'}`}>
                {w.status}
              </span>

              {/* Arrow */}
              <svg className="w-4 h-4 text-[#c1c1c1] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
