'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

/* ---------- types ---------- */

interface Worker {
  id: string;
  name: string | null;
  nationality: string | null;
  photo_url: string | null;
  status: string;
  code: string | null;
  gender: string | null;
  date_of_birth: string | null;
  marital_status: string | null;
  education: string | null;
  religion: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  birth_order: number | null;
  num_brothers: number | null;
  num_sisters: number | null;
  num_sons: number | null;
  num_daughters: number | null;
  created_at: string;
  [skill: string]: unknown;
}

interface OverseasExp { id: string; country: string | null; years: number | null; description: string | null }
interface PreviousDuty { id: string; description: string | null }
interface Media { id: string; url: string; type: string; caption: string | null }

/* ---------- constants ---------- */

const SKILL_LABELS = [
  { key: 'skill_care_babies', zh: '照顧嬰兒' },
  { key: 'skill_care_toddler', zh: '照顧幼童' },
  { key: 'skill_care_children', zh: '照顧小童' },
  { key: 'skill_care_elderly', zh: '照顧長者' },
  { key: 'skill_care_disabled', zh: '照顧傷殘' },
  { key: 'skill_care_bedridden', zh: '照顧臥床' },
  { key: 'skill_care_pet', zh: '照顧寵物' },
  { key: 'skill_household', zh: '家務' },
  { key: 'skill_car_washing', zh: '洗車' },
  { key: 'skill_gardening', zh: '打理花園' },
  { key: 'skill_cooking', zh: '烹飪' },
  { key: 'skill_driving', zh: '駕駛' },
  { key: 'skill_pickup_taobao', zh: '淘寶取件' },
];

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  available: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  hired: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
};

const STATUS_OPTIONS = ['pending', 'available', 'processing', 'hired', 'rejected'];

/* ---------- helpers ---------- */

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value == null || value === '') return null;
  return (
    <div className="flex justify-between py-2 border-b border-[#f2f2f2] last:border-b-0">
      <span className="text-sm text-[#6a6a6a]">{label}</span>
      <span className="text-sm font-medium text-[#222222]">{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#dddddd] p-4">
      <h2 className="text-base font-semibold text-[#222222] mb-3">{title}</h2>
      {children}
    </div>
  );
}

/* ---------- page ---------- */

export default function AdminWorkerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [experiences, setExperiences] = useState<OverseasExp[]>([]);
  const [duties, setDuties] = useState<PreviousDuty[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [wRes, expRes, dutyRes, mediaRes] = await Promise.all([
      supabase.from('workers').select('*').eq('id', id).single(),
      supabase.from('worker_overseas_experience').select('*').eq('worker_id', id),
      supabase.from('worker_previous_duties').select('*').eq('worker_id', id),
      supabase.from('worker_media').select('*').eq('worker_id', id),
    ]);
    if (wRes.data) setWorker(wRes.data as Worker);
    if (expRes.data) setExperiences(expRes.data as OverseasExp[]);
    if (dutyRes.data) setDuties(dutyRes.data as PreviousDuty[]);
    if (mediaRes.data) setMedia(mediaRes.data as Media[]);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  /* actions */

  const updateStatus = async (newStatus: string) => {
    if (!worker) return;
    setSaving(true);
    await supabase.from('workers').update({ status: newStatus }).eq('id', worker.id);
    await load();
    setSaving(false);
  };

  const handleApprove = async () => {
    const code = prompt('請輸入分配的 Code：');
    if (!code || !worker) return;
    setSaving(true);
    await supabase.from('workers').update({ status: 'available', code }).eq('id', worker.id);
    await load();
    setSaving(false);
  };

  const handleReject = async () => {
    if (!worker) return;
    if (!confirm('確定要拒絕這位工人嗎？')) return;
    setSaving(true);
    await supabase.from('workers').update({ status: 'rejected' }).eq('id', worker.id);
    await load();
    setSaving(false);
  };

  /* render helpers */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[#222222] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!worker) {
    return <p className="text-center text-[#6a6a6a] py-20">找不到工人資料</p>;
  }

  const activeSkills = SKILL_LABELS.filter(s => worker[s.key] === true);

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/workers"
          className="w-9 h-9 rounded-full border border-[#dddddd] flex items-center justify-center hover:border-[#222222] transition-colors"
        >
          <svg className="w-4 h-4 text-[#222222]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-[#222222] flex-1 truncate">
          {worker.name || '未填寫姓名'}
        </h1>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[worker.status] ?? 'bg-gray-100 text-gray-800'}`}>
          {worker.status}
        </span>
      </div>

      <div className="space-y-4">
        {/* Basic info */}
        <Section title="基本資料">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-[#f7f7f7] flex-shrink-0">
              {worker.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={worker.photo_url} alt={worker.name ?? ''} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#c1c1c1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-[#222222]">{worker.name || '—'}</p>
              {worker.code && <p className="text-xs font-mono text-[#6a6a6a]">Code: {worker.code}</p>}
            </div>
          </div>
          <InfoRow label="國籍" value={worker.nationality} />
          <InfoRow label="性別" value={worker.gender} />
          <InfoRow label="生日" value={worker.date_of_birth} />
          <InfoRow label="婚姻狀況" value={worker.marital_status} />
          <InfoRow label="教育程度" value={worker.education} />
          <InfoRow label="宗教" value={worker.religion} />
          <InfoRow label="身高 (cm)" value={worker.height_cm} />
          <InfoRow label="體重 (kg)" value={worker.weight_kg} />
          <InfoRow label="出生順序" value={worker.birth_order} />
          <InfoRow label="兄弟數量" value={worker.num_brothers} />
          <InfoRow label="姐妹數量" value={worker.num_sisters} />
          <InfoRow label="兒子數量" value={worker.num_sons} />
          <InfoRow label="女兒數量" value={worker.num_daughters} />
          <InfoRow label="登記日期" value={new Date(worker.created_at).toLocaleDateString('zh-TW')} />
        </Section>

        {/* Skills */}
        {activeSkills.length > 0 && (
          <Section title="技能">
            <div className="flex flex-wrap gap-2">
              {activeSkills.map(s => (
                <span key={s.key} className="px-3 py-1 bg-[#f7f7f7] rounded-full text-sm text-[#222222]">
                  {s.zh}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Overseas experience */}
        {experiences.length > 0 && (
          <Section title="海外經驗">
            <div className="space-y-3">
              {experiences.map(exp => (
                <div key={exp.id} className="border-l-2 border-[#222222] pl-3">
                  <p className="text-sm font-semibold text-[#222222]">
                    {exp.country ?? '—'}{exp.years != null ? ` · ${exp.years} 年` : ''}
                  </p>
                  {exp.description && <p className="text-sm text-[#6a6a6a] mt-0.5">{exp.description}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Previous duties */}
        {duties.length > 0 && (
          <Section title="過去工作">
            <ul className="space-y-2">
              {duties.map(d => (
                <li key={d.id} className="text-sm text-[#222222] before:content-['•'] before:text-[#c1c1c1] before:mr-2">
                  {d.description || '—'}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Media */}
        {media.length > 0 && (
          <Section title="媒體">
            <div className="grid grid-cols-2 gap-3">
              {media.map(m => (
                <div key={m.id} className="rounded-lg overflow-hidden bg-[#f7f7f7]">
                  {m.type === 'video' ? (
                    <video src={m.url} controls playsInline className="w-full h-auto" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.caption ?? ''} className="w-full h-auto object-cover" />
                  )}
                  {m.caption && <p className="text-xs text-[#6a6a6a] p-2 truncate">{m.caption}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#dddddd] p-4 z-20">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <select
            value={worker.status}
            onChange={e => updateStatus(e.target.value)}
            disabled={saving}
            className="h-10 rounded-lg border border-[#dddddd] px-3 text-sm text-[#222222] bg-white focus:border-[#222222] focus:ring-1 focus:ring-[#222222] outline-none"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <div className="flex-1" />

          {worker.status === 'pending' && (
            <>
              <button
                onClick={handleReject}
                disabled={saving}
                className="h-10 px-5 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                拒絕
              </button>
              <button
                onClick={handleApprove}
                disabled={saving}
                className="h-10 px-5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                批准
              </button>
            </>
          )}

          {saving && (
            <div className="w-5 h-5 border-2 border-[#222222] border-t-transparent rounded-full animate-spin" />
          )}
        </div>
      </div>
    </div>
  );
}
