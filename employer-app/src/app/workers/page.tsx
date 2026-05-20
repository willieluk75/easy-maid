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

const SKILL_OPTIONS: { key: keyof Worker; zh: string }[] = [
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
  return SKILL_OPTIONS.filter(s => w[s.key] === true).map(s => s.zh);
}

export default function WorkersPage() {
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // 篩選狀態
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [selectedNationality, setSelectedNationality] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<Set<keyof Worker>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });

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
      .then(({ data, error }) => {
        if (!error && data) {
          setAllWorkers(data as Worker[]);
          // 收集不重複國籍
          const nations = [...new Set(data.map((w: Worker) => w.nationality).filter(Boolean))] as string[];
          setNationalities(nations);
        }
        setLoading(false);
      });
  }, []);

  // 用戶端篩選
  const filtered = allWorkers.filter(w => {
    if (selectedNationality && w.nationality !== selectedNationality) return false;
    if (selectedSkills.size > 0) {
      for (const skill of selectedSkills) {
        if (!w[skill]) return false;
      }
    }
    return true;
  });

  const toggleSkill = (key: keyof Worker) => {
    setSelectedSkills(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedNationality('');
    setSelectedSkills(new Set());
  };

  const hasFilters = selectedNationality || selectedSkills.size > 0;

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#dddddd]">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-base font-bold text-[#222222]">外傭列表</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`text-sm font-medium px-3 py-1 rounded-full border transition-colors ${
                hasFilters
                  ? 'bg-[#fff0f3] text-[#ff385c] border-[#ffcdd2]'
                  : 'text-[#6a6a6a] border-[#dddddd] hover:bg-[#f7f7f7]'
              }`}
            >
              {hasFilters ? `篩選 (${selectedSkills.size + (selectedNationality ? 1 : 0)})` : '篩選'}
            </button>
            {userId ? (
              <Link href="/profile" className="text-sm text-[#3f3f3f]">我的帳號</Link>
            ) : (
              <Link href="/signin" className="text-sm text-[#ff385c] font-medium">登入</Link>
            )}
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="px-4 pb-3 space-y-3 border-t border-gray-50">
            {/* 國籍 dropdown */}
            {nationalities.length > 1 && (
              <div className="pt-3">
                <label className="text-xs text-[#929292] font-medium mb-1 block">國籍</label>
                <select
                  value={selectedNationality}
                  onChange={e => setSelectedNationality(e.target.value)}
                  className="w-full text-sm border border-[#dddddd] rounded-[14px] px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#222222]"
                >
                  <option value="">全部</option>
                  {nationalities.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}

            {/* 技能 chips */}
            <div>
              <label className="text-xs text-[#929292] font-medium mb-2 block">技能（可多選）</label>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_OPTIONS.map(s => (
                  <button
                    key={s.key}
                    onClick={() => toggleSkill(s.key)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      selectedSkills.has(s.key)
                        ? 'bg-[#ff385c] text-white border-blue-600'
                        : 'bg-white text-[#3f3f3f] border-[#dddddd] hover:bg-[#f7f7f7]'
                    }`}
                  >
                    {s.zh}
                  </button>
                ))}
              </div>
            </div>

            {/* 清除按鈕 */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#c13515] font-medium"
              >
                清除所有篩選
              </button>
            )}
          </div>
        )}
      </div>

      {/* 結果計數 */}
      {hasFilters && (
        <div className="max-w-lg mx-auto px-4 pt-3">
          <p className="text-xs text-[#929292]">找到 {filtered.length} 位外傭</p>
        </div>
      )}

      {loading ? (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-white rounded-[14px] p-4 shadow-sm animate-pulse"
            >
              {/* Skeleton avatar */}
              <div className="w-16 h-16 rounded-[8px] bg-[#dddddd] flex-shrink-0" />

              {/* Skeleton info */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-24 bg-[#dddddd] rounded" />
                  <div className="h-5 w-16 bg-[#dddddd] rounded-full" />
                </div>
                <div className="h-3 w-16 bg-[#dddddd] rounded" />
                <div className="flex flex-wrap gap-1">
                  <div className="h-5 w-14 bg-[#dddddd] rounded-full" />
                  <div className="h-5 w-14 bg-[#dddddd] rounded-full" />
                  <div className="h-5 w-14 bg-[#dddddd] rounded-full" />
                  <div className="h-5 w-14 bg-[#dddddd] rounded-full" />
                </div>
              </div>

              {/* Skeleton chevron */}
              <div className="w-4 h-4 bg-[#dddddd] rounded flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#929292] space-y-2">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm">{hasFilters ? '沒有符合條件的外傭' : '暫時沒有外傭資料'}</p>
        </div>
      ) : (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          {filtered.map(w => {
            const skills = workerSkills(w);
            return (
              <Link
                key={w.id}
                href={`/workers/${w.id}`}
                className="flex items-start gap-4 bg-white rounded-[14px] p-4 shadow-sm active:bg-[#f7f7f7] transition-colors"
              >
                {/* Avatar */}
                <div className="w-16 h-16 rounded-[8px] overflow-hidden bg-[#f7f7f7] flex-shrink-0">
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
                    <p className="text-sm font-semibold text-[#222222] truncate">{w.name}</p>
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
                    <p className="text-xs text-[#929292] mb-2">{w.nationality}</p>
                  )}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {skills.slice(0, 4).map(s => (
                        <span key={s} className="text-xs bg-[#fff0f3] text-[#ff385c] px-2 py-0.5 rounded-full">
                          {s}
                        </span>
                      ))}
                      {skills.length > 4 && (
                        <span className="text-xs text-[#929292] px-1 py-0.5">
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
        </div>
      )}
    </div>
  );
}
