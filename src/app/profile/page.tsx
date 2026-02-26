'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Worker {
  id: string;
  code: string | null;
  name: string;
  photo_url: string | null;
  nationality: string | null;
  gender: string | null;
  date_of_birth: string | null;
  marital_status: string | null;
  education: string | null;
  religion: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  birth_order: number | null;
  num_brothers: number;
  num_sisters: number;
  num_sons: number;
  son_ages: string | null;
  num_daughters: number;
  daughter_ages: string | null;
  hkid: string | null;
  hk_mobile: string | null;
  contract_end_date: string | null;
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
  lang_mandarin: string | null;
  lang_cantonese: string | null;
  lang_english: string | null;
  eats_pork: boolean | null;
  available_sundays: boolean | null;
  can_share_room: boolean | null;
  share_room_notes: string | null;
  has_tattoo: boolean;
  smokes: boolean;
  afraid_of_pets: boolean;
  had_surgery: boolean;
  surgery_details: string | null;
  has_allergies: boolean;
  allergy_details: string | null;
  remark: string | null;
  status: string;
}

interface OverseasExp {
  id: string;
  country: string;
  duration: string | null;
  display_order: number;
}

interface Duty {
  id: string;
  job_order: number;
  working_country: string | null;
  duration_from: string | null;
  duration_to: string | null;
  salary: string | null;
  reason_to_leave: string | null;
  employer_family_info: string | null;
  skill_care_babies: boolean;
  baby_age_range: string | null;
  skill_care_toddler: boolean;
  toddler_age_range: string | null;
  skill_care_children: boolean;
  children_age_range: string | null;
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

interface WorkerMedia {
  id: string;
  url: string;
  storage_path: string;
  type: 'image' | 'video';
  caption: string | null;
  created_at: string;
}

interface PendingFile {
  file: File;
  previewUrl: string;
  caption: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending:    { label: '審核中',   color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  available:  { label: '可僱用',   color: 'bg-green-100  text-green-800  border-green-200' },
  processing: { label: '面試中',   color: 'bg-orange-100 text-orange-800 border-orange-200' },
  hired:      { label: '已受僱',   color: 'bg-blue-100   text-blue-800   border-blue-200' },
};

const SKILLS_LIST = [
  { key: 'skill_care_babies',    label: '照顧嬰兒' },
  { key: 'skill_care_toddler',   label: '照顧幼童' },
  { key: 'skill_care_children',  label: '照顧小童' },
  { key: 'skill_care_elderly',   label: '照顧長者' },
  { key: 'skill_care_disabled',  label: '照顧傷殘' },
  { key: 'skill_care_bedridden', label: '照顧臥床' },
  { key: 'skill_care_pet',       label: '照顧寵物' },
  { key: 'skill_household',      label: '家務' },
  { key: 'skill_car_washing',    label: '洗車' },
  { key: 'skill_gardening',      label: '打理花園' },
  { key: 'skill_cooking',        label: '烹飪' },
  { key: 'skill_driving',        label: '駕駛' },
  { key: 'skill_pickup_taobao',  label: '代購淘寶' },
];

const LANG_LABEL: Record<string, string> = { poor: '弱', fair: '一般', good: '良好' };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
      </div>
      <div className="px-4 py-3 divide-y divide-gray-50">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[58%]">{value}</span>
    </div>
  );
}

function BoolRow({ label, value }: { label: string; value: boolean | null | undefined }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${value ? 'text-gray-900' : 'text-gray-400'}`}>
        {value ? '是' : '否'}
      </span>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [overseas, setOverseas] = useState<OverseasExp[]>([]);
  const [duties, setDuties] = useState<Duty[]>([]);
  const [userId, setUserId] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [media, setMedia] = useState<WorkerMedia[]>([]);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [showCaptionModal, setShowCaptionModal] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/signin'); return; }
    setUserId(user.id);

    const { data: w } = await supabase
      .from('workers').select('*').eq('user_id', user.id).single();

    if (w) {
      setWorker(w);
      const [{ data: ovs }, { data: dts }, { data: med }] = await Promise.all([
        supabase.from('worker_overseas_experience').select('*').eq('worker_id', w.id).order('display_order'),
        supabase.from('worker_previous_duties').select('*').eq('worker_id', w.id).order('job_order'),
        supabase.from('worker_media').select('*').eq('worker_id', w.id).order('created_at'),
      ]);
      setOverseas(ovs || []);
      setDuties(dts || []);
      setMedia(med || []);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !worker || !userId) return;
    setPhotoUploading(true);

    const { error } = await supabase.storage
      .from('worker-assets')
      .upload(`${userId}/profile.jpg`, file, { upsert: true, contentType: file.type });

    if (!error) {
      const { data } = supabase.storage
        .from('worker-assets')
        .getPublicUrl(`${userId}/profile.jpg`);
      await supabase.from('workers').update({ photo_url: data.publicUrl }).eq('id', worker.id);
      setWorker(prev => prev ? { ...prev, photo_url: data.publicUrl } : prev);
    }
    setPhotoUploading(false);
  };

  const handleMediaFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const pending: PendingFile[] = Array.from(files).map(file => ({
      file,
      previewUrl: URL.createObjectURL(file),
      caption: '',
    }));
    setPendingFiles(pending);
    setShowCaptionModal(true);
    // Reset input so same file can be re-selected later
    e.target.value = '';
  };

  const handleCaptionChange = (index: number, value: string) => {
    if (value.length > 100) return;
    setPendingFiles(prev => prev.map((pf, i) => i === index ? { ...pf, caption: value } : pf));
  };

  const handleCaptionCancel = () => {
    pendingFiles.forEach(pf => URL.revokeObjectURL(pf.previewUrl));
    setPendingFiles([]);
    setShowCaptionModal(false);
  };

  const handleCaptionConfirm = async () => {
    if (!worker || !userId) return;
    setShowCaptionModal(false);
    setMediaUploading(true);

    const filesToUpload = [...pendingFiles];
    pendingFiles.forEach(pf => URL.revokeObjectURL(pf.previewUrl));
    setPendingFiles([]);

    for (const pf of filesToUpload) {
      const { file, caption } = pf;
      const isVideo = file.type.startsWith('video/');
      const ext = file.name.split('.').pop() ?? (isVideo ? 'mp4' : 'jpg');
      const storagePath = `${userId}/media/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('worker-assets')
        .upload(storagePath, file, { contentType: file.type });

      if (!upErr) {
        const { data: urlData } = supabase.storage.from('worker-assets').getPublicUrl(storagePath);
        const { data: inserted } = await supabase.from('worker_media').insert({
          worker_id: worker.id,
          url: urlData.publicUrl,
          storage_path: storagePath,
          type: isVideo ? 'video' : 'image',
          caption: caption || null,
        }).select().single();
        if (inserted) setMedia(prev => [...prev, inserted as WorkerMedia]);
      }
    }

    setMediaUploading(false);
  };

  const handleMediaDelete = async (item: WorkerMedia) => {
    await supabase.storage.from('worker-assets').remove([item.storage_path]);
    await supabase.from('worker_media').delete().eq('id', item.id);
    setMedia(prev => prev.filter(m => m.id !== item.id));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">載入中...</p>
      </div>
    );
  }

  // No profile yet
  if (!worker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm w-full">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">尚未登記資料</h1>
          <p className="text-gray-500 text-sm">請填寫你的外傭資料以開始登記</p>
          <Link href="/worker/register"
            className="inline-block w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-base text-center">
            立即登記
          </Link>
          <button onClick={handleSignOut} className="text-sm text-gray-400 underline mt-2">登出</button>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[worker.status] ?? { label: worker.status, color: 'bg-gray-100 text-gray-600 border-gray-200' };
  const activeSkills = SKILLS_LIST.filter(s => worker[s.key as keyof Worker]);

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Caption Modal */}
      {showCaptionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col">
          <div className="bg-white flex-1 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <button onClick={handleCaptionCancel} className="text-gray-500 font-medium text-sm">取消</button>
              <h2 className="text-sm font-semibold text-gray-900">新增貼文</h2>
              <button
                onClick={handleCaptionConfirm}
                className="text-blue-600 font-semibold text-sm"
              >
                上傳
              </button>
            </div>

            <div className="p-4 space-y-6">
              {pendingFiles.map((pf, i) => (
                <div key={i} className="space-y-3">
                  {pendingFiles.length > 1 && (
                    <p className="text-xs text-gray-400 font-medium">第 {i + 1} 張</p>
                  )}
                  <div className="rounded-xl overflow-hidden bg-gray-100 aspect-square">
                    {pf.file.type.startsWith('video/') ? (
                      <video src={pf.previewUrl} className="w-full h-full object-cover" controls />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pf.previewUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <textarea
                      value={pf.caption}
                      onChange={e => handleCaptionChange(i, e.target.value)}
                      placeholder="加入說明（最多100字）..."
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:border-blue-400"
                    />
                    <p className="text-right text-xs text-gray-400 mt-1">{pf.caption.length}/100</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-6 shadow-sm">
        <div className="flex items-start justify-between mb-5">
          <div className="space-y-1">
            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
            {worker.code && <p className="text-xs text-gray-400 pl-1">No. {worker.code}</p>}
          </div>
          <button onClick={handleSignOut} className="text-sm text-gray-400 font-medium">登出</button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0" onClick={() => photoInputRef.current?.click()}>
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 cursor-pointer">
              {worker.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={worker.photo_url} alt={worker.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-9 h-9 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              {photoUploading && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
          <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{worker.name}</h1>
            <p className="text-sm text-gray-500">{worker.nationality}</p>
            <p className="text-xs text-gray-400 mt-0.5">點擊頭像更換照片</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 mt-4 flex gap-3">
        <Link href="/worker/edit"
          className="flex-1 flex items-center justify-center py-3 border-2 border-blue-600 rounded-xl text-blue-600 font-semibold gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          修改資料
        </Link>
        <Link href="/feed"
          className="flex-1 flex items-center justify-center py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          瀏覽 Feed
        </Link>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* 基本資料 */}
        <Section title="基本資料">
          <Row label="性別"    value={worker.gender === 'F' ? '女 Female' : worker.gender === 'M' ? '男 Male' : null} />
          <Row label="出生日期" value={worker.date_of_birth} />
          <Row label="婚姻狀況" value={worker.marital_status} />
          <Row label="學歷"    value={worker.education} />
          <Row label="宗教"    value={worker.religion} />
          <Row label="身高"    value={worker.height_cm ? `${worker.height_cm} cm` : null} />
          <Row label="體重"    value={worker.weight_kg ? `${worker.weight_kg} kg` : null} />
          <Row label="家中排行" value={worker.birth_order} />
          <Row label="兄弟姊妹" value={`兄弟 ${worker.num_brothers} / 姊妹 ${worker.num_sisters}`} />
          {(worker.num_sons > 0 || worker.num_daughters > 0) && (
            <Row label="子女"
              value={`兒子 ${worker.num_sons}${worker.son_ages ? ` (${worker.son_ages})` : ''} / 女兒 ${worker.num_daughters}${worker.daughter_ages ? ` (${worker.daughter_ages})` : ''}`} />
          )}
        </Section>

        {/* 聯絡及合約 */}
        <Section title="聯絡及合約資料">
          <Row label="香港身份證"  value={worker.hkid ? worker.hkid.slice(0, 4) + '***' : null} />
          <Row label="香港手機"   value={worker.hk_mobile} />
          <Row label="合約到期日" value={worker.contract_end_date} />
        </Section>

        {/* 技能 */}
        {activeSkills.length > 0 && (
          <Section title="技能">
            <div className="flex flex-wrap gap-2 py-2">
              {activeSkills.map(s => (
                <span key={s.key} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                  {s.label}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* 語言能力 */}
        {(worker.lang_mandarin || worker.lang_cantonese || worker.lang_english) && (
          <Section title="語言能力">
            {worker.lang_mandarin  && <Row label="普通話 Mandarin"  value={LANG_LABEL[worker.lang_mandarin]}  />}
            {worker.lang_cantonese && <Row label="廣東話 Cantonese" value={LANG_LABEL[worker.lang_cantonese]} />}
            {worker.lang_english   && <Row label="英語 English"     value={LANG_LABEL[worker.lang_english]}   />}
          </Section>
        )}

        {/* 海外工作記錄 */}
        {overseas.length > 0 && (
          <Section title="海外工作記錄">
            {overseas.map(exp => (
              <div key={exp.id} className="flex justify-between py-2">
                <span className="text-sm font-medium text-gray-800">{exp.country}</span>
                <span className="text-sm text-gray-500">{exp.duration}</span>
              </div>
            ))}
          </Section>
        )}

        {/* 過去工作詳情 */}
        {duties.length > 0 && (
          <Section title="過去工作詳情">
            <div className="space-y-3 py-1">
              {duties.map(d => {
                const dutySkills = SKILLS_LIST.filter(s => d[s.key as keyof Duty]);
                return (
                  <div key={d.id} className="border border-gray-100 rounded-xl p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-gray-800">第 {d.job_order} 份工作</span>
                      <span className="text-xs text-gray-400">{d.working_country}</span>
                    </div>
                    {(d.duration_from || d.duration_to) && (
                      <p className="text-xs text-gray-500">{d.duration_from} — {d.duration_to}</p>
                    )}
                    {d.salary              && <p className="text-xs text-gray-600">薪金: {d.salary}</p>}
                    {d.employer_family_info && <p className="text-xs text-gray-600">僱主: {d.employer_family_info}</p>}
                    {d.reason_to_leave     && <p className="text-xs text-gray-600">離職: {d.reason_to_leave}</p>}
                    {dutySkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dutySkills.map(s => (
                          <span key={s.key} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{s.label}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* 其他問題 */}
        <Section title="其他問題">
          <BoolRow label="吃豬肉"      value={worker.eats_pork} />
          <BoolRow label="星期日可上班" value={worker.available_sundays} />
          <BoolRow label="可與嬰兒同住" value={worker.can_share_room} />
          {worker.share_room_notes && <Row label="同住備注" value={worker.share_room_notes} />}
          <BoolRow label="有紋身"      value={worker.has_tattoo} />
          <BoolRow label="吸煙"        value={worker.smokes} />
          <BoolRow label="害怕狗貓"    value={worker.afraid_of_pets} />
          <BoolRow label="曾接受手術"  value={worker.had_surgery} />
          {worker.surgery_details && <Row label="手術詳情" value={worker.surgery_details} />}
          <BoolRow label="有過敏或疾病" value={worker.has_allergies} />
          {worker.allergy_details && <Row label="過敏詳情" value={worker.allergy_details} />}
        </Section>

        {/* 備注 */}
        {worker.remark && (
          <Section title="備注">
            <p className="text-sm text-gray-700 leading-relaxed py-2">{worker.remark}</p>
          </Section>
        )}

        {/* 相片及影片 */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">相片及影片</h2>
            <button
              onClick={() => mediaInputRef.current?.click()}
              disabled={mediaUploading}
              className="flex items-center gap-1 text-xs text-blue-600 font-semibold disabled:opacity-50"
            >
              {mediaUploading ? (
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              )}
              上傳
            </button>
          </div>
          <input
            ref={mediaInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleMediaFileSelect}
          />
          <div className="p-3">
            {media.length === 0 && !mediaUploading ? (
              <button
                onClick={() => mediaInputRef.current?.click()}
                className="w-full py-8 flex flex-col items-center gap-2 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl"
              >
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">點擊上傳相片或影片</span>
              </button>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {media.map(item => (
                  <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                    {item.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <video src={item.url} className="w-full h-full object-cover" preload="metadata" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                    {item.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                        <p className="text-white text-xs line-clamp-1">{item.caption}</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleMediaDelete(item)}
                      className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity"
                    >
                      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
