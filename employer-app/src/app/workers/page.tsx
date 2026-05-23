'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

const DEMO_WORKERS: Worker[] = [
  {
    id: 'demo-1',
    name: 'Priya Sharma',
    nationality: '印度',
    photo_url: '/images/workers/worker-1.jpg',
    status: 'available',
    skill_care_babies: false, skill_care_toddler: false, skill_care_children: false,
    skill_care_elderly: true, skill_care_disabled: false, skill_care_bedridden: false,
    skill_care_pet: false, skill_household: true, skill_car_washing: false,
    skill_gardening: false, skill_cooking: true, skill_driving: false, skill_pickup_taobao: false,
  },
  {
    id: 'demo-2',
    name: 'Siti Rahayu',
    nationality: '印尼',
    photo_url: '/images/workers/worker-2.jpg',
    status: 'available',
    skill_care_babies: true, skill_care_toddler: false, skill_care_children: false,
    skill_care_elderly: false, skill_care_disabled: false, skill_care_bedridden: false,
    skill_care_pet: false, skill_household: true, skill_car_washing: false,
    skill_gardening: false, skill_cooking: true, skill_driving: false, skill_pickup_taobao: false,
  },
  {
    id: 'demo-3',
    name: 'Maria Santos',
    nationality: '菲律賓',
    photo_url: '/images/workers/worker-3.jpg',
    status: 'processing',
    skill_care_babies: false, skill_care_toddler: false, skill_care_children: false,
    skill_care_elderly: false, skill_care_disabled: false, skill_care_bedridden: false,
    skill_care_pet: true, skill_household: true, skill_car_washing: false,
    skill_gardening: false, skill_cooking: true, skill_driving: false, skill_pickup_taobao: false,
  },
  {
    id: 'demo-4',
    name: 'Nandar Win',
    nationality: '緬甸',
    photo_url: '/images/workers/worker-4.jpg',
    status: 'available',
    skill_care_babies: false, skill_care_toddler: false, skill_care_children: false,
    skill_care_elderly: false, skill_care_disabled: false, skill_care_bedridden: false,
    skill_care_pet: false, skill_household: true, skill_car_washing: false,
    skill_gardening: true, skill_cooking: true, skill_driving: false, skill_pickup_taobao: false,
  },
  {
    id: 'demo-5',
    name: 'Linh Nguyen',
    nationality: '越南',
    photo_url: '/images/workers/worker-5.jpg',
    status: 'available',
    skill_care_babies: false, skill_care_toddler: false, skill_care_children: true,
    skill_care_elderly: false, skill_care_disabled: false, skill_care_bedridden: false,
    skill_care_pet: false, skill_household: true, skill_car_washing: false,
    skill_gardening: false, skill_cooking: true, skill_driving: false, skill_pickup_taobao: false,
  },
  {
    id: 'demo-6',
    name: 'Anita Gurung',
    nationality: '尼泊爾',
    photo_url: '/images/workers/worker-6.jpg',
    status: 'available',
    skill_care_babies: false, skill_care_toddler: false, skill_care_children: false,
    skill_care_elderly: true, skill_care_disabled: false, skill_care_bedridden: false,
    skill_care_pet: false, skill_household: true, skill_car_washing: false,
    skill_gardening: false, skill_cooking: true, skill_driving: false, skill_pickup_taobao: false,
  },
];

function workerSkills(w: Worker): string[] {
  return SKILL_OPTIONS.filter(s => w[s.key] === true).map(s => s.zh);
}

const CARD_SHADOW = 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px';

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
  { href: '/profile', label: '我的', icon: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )},
];

export default function WorkersPage() {
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();

  const [nationalities, setNationalities] = useState<string[]>([]);
  const [selectedNationality, setSelectedNationality] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<Set<keyof Worker>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);

      if (!uid) {
        setAllWorkers(DEMO_WORKERS);
        setNationalities([...new Set(DEMO_WORKERS.map(w => w.nationality).filter((n): n is string => !!n))]);
        setLoading(false);
        return;
      }

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
          if (!error && data && data.length > 0) {
            setAllWorkers(data as Worker[]);
            const nations = [...new Set(data.map((w: Worker) => w.nationality).filter(Boolean))] as string[];
            setNationalities(nations);
          } else {
            setAllWorkers(DEMO_WORKERS);
            setNationalities([...new Set(DEMO_WORKERS.map(w => w.nationality).filter((n): n is string => !!n))]);
          }
          setLoading(false);
        });
    });
  }, []);

  const sq = searchQuery.toLowerCase();
  const filtered = allWorkers.filter(w => {
    if (sq && !w.name.toLowerCase().includes(sq)) return false;
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
    <div className="min-h-screen bg-[#f7f7f7] pb-14">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#f2f2f2]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-[28px] font-bold text-[#222222]">外傭列表</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`border border-[#dddddd] rounded-[8px] text-sm px-4 py-2 transition-colors ${
                hasFilters
                  ? 'bg-[#f7f7f7] text-[#222222]'
                  : 'text-[#6a6a6a] hover:bg-[#f7f7f7]'
              }`}
            >
              {hasFilters ? `篩選 (${selectedSkills.size + (selectedNationality ? 1 : 0)})` : '篩選'}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="max-w-lg mx-auto px-4 pb-2">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜尋姓名..."
            className="w-full rounded-full border border-[#dddddd] px-4 py-2 text-sm placeholder-[#929292] focus:outline-none focus:border-[#222222] transition-colors"
          />
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="max-w-lg mx-auto px-4 pb-3 space-y-3 border-t border-[#f2f2f2]">
            {nationalities.length > 1 && (
              <div className="pt-3">
                <label className="text-xs text-[#929292] font-medium mb-1 block">國籍</label>
                <select
                  value={selectedNationality}
                  onChange={e => setSelectedNationality(e.target.value)}
                  className="w-full text-sm border border-[#dddddd] rounded-[8px] px-4 py-2 bg-white focus:outline-none"
                >
                  <option value="">全部</option>
                  {nationalities.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs text-[#929292] font-medium mb-2 block">技能（可多選）</label>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_OPTIONS.map(s => (
                  <button
                    key={s.key}
                    onClick={() => toggleSkill(s.key)}
                    className={`text-xs px-2.5 py-0.5 rounded-full transition-colors ${
                      selectedSkills.has(s.key)
                        ? 'bg-[#222222] text-white'
                        : 'bg-[#f2f2f2] text-[#222222] hover:bg-[#e8e8e8]'
                    }`}
                  >
                    {s.zh}
                  </button>
                ))}
              </div>
            </div>

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

      {/* Result count */}
      {hasFilters && (
        <div className="max-w-lg mx-auto px-4 pt-3">
          <p className="text-xs text-[#929292]">找到 {filtered.length} 位外傭</p>
        </div>
      )}
      {!hasFilters && sq && (
        <div className="max-w-lg mx-auto px-4 pt-3">
          <p className="text-xs text-[#929292]">找到 {filtered.length} 位外傭</p>
        </div>
      )}

      {loading ? (
        <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start gap-4 bg-white rounded-[20px] p-4 animate-pulse"
              style={{ boxShadow: CARD_SHADOW }}
            >
              <div className="w-12 h-12 rounded-full bg-[#dddddd] flex-shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-24 bg-[#dddddd] rounded" />
                  <div className="h-5 w-16 bg-[#dddddd] rounded-full" />
                </div>
                <div className="h-4 w-16 bg-[#dddddd] rounded-full" />
                <div className="flex flex-wrap gap-1">
                  <div className="h-5 w-14 bg-[#dddddd] rounded-full" />
                  <div className="h-5 w-14 bg-[#dddddd] rounded-full" />
                  <div className="h-5 w-14 bg-[#dddddd] rounded-full" />
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
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
          {filtered.slice(0, displayCount).map(w => {
            const skills = workerSkills(w);
            return (
              <Link
                key={w.id}
                href={`/workers/${w.id}`}
                className="flex items-start gap-4 bg-white rounded-[20px] p-4 active:bg-[#f7f7f7] transition-colors"
                style={{ boxShadow: CARD_SHADOW }}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full overflow-hidden bg-[#f7f7f7] flex-shrink-0">
                  {w.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={w.photo_url} alt={w.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-base font-semibold text-[#222222] truncate">{w.name}</p>
                    {w.status === 'available' ? (
                      <span className="flex-shrink-0 text-xs bg-[#e8f5e9] text-[#2e7d32] px-2.5 py-0.5 rounded-full">
                        Available
                      </span>
                    ) : (
                      <span className="flex-shrink-0 text-xs bg-[#fff8e1] text-[#e67e22] px-2.5 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  {w.nationality && (
                    <span className="inline-block text-xs bg-[#f2f2f2] text-[#222222] px-2.5 py-0.5 rounded-full mb-2">
                      {w.nationality}
                    </span>
                  )}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {skills.slice(0, 4).map(s => (
                        <span key={s} className="text-xs bg-[#f2f2f2] text-[#222222] px-2.5 py-0.5 rounded-full">
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
          {filtered.length > displayCount && (
            <button
              onClick={() => setDisplayCount(c => c + 20)}
              className="w-full text-sm font-medium text-[#222222] py-3 rounded-full border border-[#dddddd] hover:bg-[#f7f7f7] transition-colors"
            >
              載入更多
            </button>
          )}
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
