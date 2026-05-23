'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Worker {
  id: string;
  name: string;
  nationality: string | null;
  photo_url: string | null;
  status: string;
  skill_care_babies: boolean;
  skill_care_toddler: boolean;
  skill_care_children: boolean;
  skill_care_elderly: boolean;
  skill_care_disabled: boolean;
  skill_care_bedridden: boolean;
  skill_care_pet: boolean;
  skill_household: boolean;
  skill_car_washing: boolean;
  skill_gardening: boolean;
  skill_cooking: boolean;
  skill_driving: boolean;
  skill_pickup_taobao: boolean;
}

const SKILL_LABELS: { key: keyof Worker; zh: string }[] = [
  { key: 'skill_care_babies',    zh: '照顧嬰兒' },
  { key: 'skill_care_toddler',   zh: '照顧幼童' },
  { key: 'skill_care_children',  zh: '照顧小童' },
  { key: 'skill_care_elderly',   zh: '照顧長者' },
  { key: 'skill_care_disabled',  zh: '照顧傷殘' },
  { key: 'skill_care_bedridden', zh: '照顧臥床' },
  { key: 'skill_care_pet',       zh: '照顧寵物' },
  { key: 'skill_household',      zh: '家務' },
  { key: 'skill_car_washing',    zh: '洗車' },
  { key: 'skill_gardening',      zh: '打理花園' },
  { key: 'skill_cooking',        zh: '烹飪' },
  { key: 'skill_driving',        zh: '駕駛' },
  { key: 'skill_pickup_taobao',  zh: '代購淘寶' },
];

function workerSkills(w: Worker): string[] {
  return SKILL_LABELS.filter(s => w[s.key] === true).map(s => s.zh);
}

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    supabase
      .from('workers')
      .select(`
        id, name, nationality, photo_url, status,
        skill_care_babies, skill_care_toddler, skill_care_children,
        skill_care_elderly, skill_care_disabled, skill_care_bedridden,
        skill_care_pet, skill_household, skill_car_washing,
        skill_gardening, skill_cooking, skill_driving, skill_pickup_taobao
      `)
      .in('status', ['available', 'processing'])
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!error && data) setWorkers(data as Worker[]);
        setLoading(false);
      });
  }, []);

  const q = searchQuery.toLowerCase();
  const filteredWorkers = q
    ? workers.filter(w => w.name.toLowerCase().includes(q))
    : workers;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-900">外傭列表</h1>
        <Link href="/feed" className="text-sm text-blue-600 font-medium">動態</Link>
      </div>

      {/* Search bar */}
      <div className="sticky top-[49px] z-10 bg-white border-b border-gray-100 px-4 py-2">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜尋姓名..."
          className="w-full rounded-full border border-[#dddddd] px-4 py-2 text-sm placeholder-[#929292] focus:outline-none focus:border-[#222222] transition-colors"
        />
      </div>

      {loading ? (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 bg-white rounded-2xl p-4">
              <div className="w-16 h-16 rounded-xl bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
                <div className="flex gap-1">
                  <div className="h-5 w-14 bg-gray-200 animate-pulse rounded-full" />
                  <div className="h-5 w-14 bg-gray-200 animate-pulse rounded-full" />
                  <div className="h-5 w-14 bg-gray-200 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 space-y-2">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm">{q ? `沒有找到「${searchQuery}」` : '暫時沒有外傭資料'}</p>
        </div>
      ) : (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          {filteredWorkers.slice(0, displayCount).map(w => {
            const skills = workerSkills(w);
            return (
              <Link
                key={w.id}
                href={`/workers/${w.id}`}
                className="flex items-start gap-4 bg-white rounded-2xl p-4 shadow-sm active:bg-gray-50 transition-colors"
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {w.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.photo_url} alt={w.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-900 truncate">{w.name}</p>
                    {w.status === 'available' ? (
                      <span className="flex-shrink-0 text-xs font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Available
                      </span>
                    ) : (
                      <span className="flex-shrink-0 text-xs font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                        Processing
                      </span>
                    )}
                  </div>
                  {w.nationality && (
                    <p className="text-xs text-gray-400 mb-2">{w.nationality}</p>
                  )}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {skills.slice(0, 4).map(s => (
                        <span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="text-xs text-gray-400 px-1 py-0.5">
                          +{skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Chevron */}
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
          {filteredWorkers.length > displayCount && (
            <button
              onClick={() => setDisplayCount(c => c + 20)}
              className="w-full text-sm font-medium text-[#222222] py-3 rounded-full border border-[#dddddd] hover:bg-gray-50 transition-colors"
            >
              載入更多
            </button>
          )}
        </div>
      )}
    </div>
  );
}
