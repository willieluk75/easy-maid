'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Worker {
  id: string;
  name: string;
  nationality: string | null;
  photo_url: string | null;
  status: string;
  date_of_birth: string | null;
  education: string | null;
  religion: string | null;
  contract_type: string | null;
  contract_end_date: string | null;
  experience_hk_years: number | null;
  lang_cantonese: string | null;
  lang_english: string | null;
  lang_mandarin: string | null;
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
  remarks: string | null;
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

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start py-2 border-b border-gray-50">
      <span className="w-28 flex-shrink-0 text-xs text-gray-400">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

export default function WorkerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = params.id as string;

  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [employerId, setEmployerId] = useState<string | null>(null);

  // Inquiry modal
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    // Check auth + get employer record
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) {
        const { data: emp } = await supabase
          .from('employers')
          .select('id')
          .eq('user_id', uid)
          .maybeSingle();
        setEmployerId(emp?.id ?? null);
      }
    });

    // Fetch worker
    supabase
      .from('workers')
      .select('*')
      .eq('id', workerId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) setWorker(data as Worker);
        setLoading(false);
      });
  }, [workerId]);

  const handleContact = () => {
    if (!userId) {
      router.push('/signin');
      return;
    }
    setShowModal(true);
  };

  const handleSendInquiry = async () => {
    if (!employerId) {
      setSendError('找不到您的僱主資料，請先完成登記。');
      return;
    }
    setSending(true);
    setSendError('');

    const { error } = await supabase.from('inquiries').insert({
      employer_id: employerId,
      worker_id: workerId,
      message: message.trim() || null,
    });

    if (error) {
      setSendError(error.message);
    } else {
      setSent(true);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">載入中...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">找不到此外傭</p>
      </div>
    );
  }

  const skills = SKILL_LABELS.filter(s => worker[s.key] === true).map(s => s.zh);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-gray-900 flex-1 truncate">{worker.name}</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Profile header */}
        <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
            {worker.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={worker.photo_url} alt={worker.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{worker.name}</h2>
            {worker.nationality && <p className="text-sm text-gray-500">{worker.nationality}</p>}
            <span className={`mt-1 inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
              worker.status === 'available'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {worker.status === 'available' ? 'Available' : 'Processing'}
            </span>
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl px-5 py-3 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">基本資料</h3>
          <InfoRow label="出生日期" value={worker.date_of_birth} />
          <InfoRow label="學歷" value={worker.education} />
          <InfoRow label="宗教" value={worker.religion} />
          <InfoRow label="合約類型" value={worker.contract_type} />
          <InfoRow label="合約到期" value={worker.contract_end_date} />
          <InfoRow label="香港工作年資" value={worker.experience_hk_years != null ? `${worker.experience_hk_years} 年` : null} />
        </div>

        {/* Languages */}
        <div className="bg-white rounded-2xl px-5 py-3 shadow-sm">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">語言能力</h3>
          <InfoRow label="粵語" value={worker.lang_cantonese} />
          <InfoRow label="英語" value={worker.lang_english} />
          <InfoRow label="普通話" value={worker.lang_mandarin} />
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="bg-white rounded-2xl px-5 py-3 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">技能</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Remarks */}
        {worker.remarks && (
          <div className="bg-white rounded-2xl px-5 py-3 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">備注</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{worker.remarks}</p>
          </div>
        )}

        {/* Contact button */}
        <div className="pb-8">
          <button
            onClick={handleContact}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-2xl text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            聯絡外傭
          </button>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => !sending && setShowModal(false)}>
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {sent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-900">詢問已發送</p>
                <p className="text-sm text-gray-500">我們會盡快回覆您。</p>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl text-sm"
                >
                  關閉
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">聯絡外傭</h3>
                  <button onClick={() => setShowModal(false)} className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {!employerId && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
                    請先完成僱主登記才可發送詢問。
                    <a href="/signup" className="underline ml-1">前往登記</a>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    附加訊息（選填）
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="請輸入您想詢問的內容..."
                    disabled={!employerId}
                  />
                </div>

                {sendError && (
                  <p className="text-red-600 text-sm">{sendError}</p>
                )}

                <button
                  onClick={handleSendInquiry}
                  disabled={sending || !employerId}
                  className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? '發送中...' : '發送詢問'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
