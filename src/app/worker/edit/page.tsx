'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { WorkerFormData, initialFormData } from '../register/types';
import Step1Basic     from '../register/steps/Step1Basic';
import Step2Contact   from '../register/steps/Step2Contact';
import Step3Skills    from '../register/steps/Step3Skills';
import Step4Languages from '../register/steps/Step4Languages';
import Step5Overseas  from '../register/steps/Step5Overseas';
import Step6Duties    from '../register/steps/Step6Duties';
import Step7Other     from '../register/steps/Step7Other';
import Step8Remarks   from '../register/steps/Step8Remarks';

const STEPS = [
  '基本資料', '聯絡及合約', '技能', '語言能力',
  '海外工作記錄', '過去工作詳情', '其他問題', '備注及儲存',
];

const toBool = (s: string): boolean | null => {
  if (s === 'yes') return true;
  if (s === 'no')  return false;
  return null;
};

const boolToStr = (b: boolean | null | undefined): string => {
  if (b === true)  return 'yes';
  if (b === false) return 'no';
  return '';
};

// Convert Supabase DB record → WorkerFormData
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToForm(w: any, ovs: any[], dts: any[]): WorkerFormData {
  return {
    photo_url:      w.photo_url      || '',
    name:           w.name           || '',
    nationality:    w.nationality    || 'Filipino',
    gender:         w.gender         || 'F',
    date_of_birth:  w.date_of_birth  || '',
    marital_status: w.marital_status || '',
    education:      w.education      || '',
    religion:       w.religion       || '',
    height_cm:      w.height_cm?.toString()    || '',
    weight_kg:      w.weight_kg?.toString()    || '',
    birth_order:    w.birth_order?.toString()  || '',
    num_brothers:   w.num_brothers?.toString() || '0',
    num_sisters:    w.num_sisters?.toString()  || '0',
    num_sons:       w.num_sons?.toString()     || '0',
    son_ages:       w.son_ages       || '',
    num_daughters:  w.num_daughters?.toString() || '0',
    daughter_ages:  w.daughter_ages  || '',
    hkid:           w.hkid           || '',
    hk_mobile:      w.hk_mobile      || '',
    contract_end_date: w.contract_end_date || '',
    skill_care_babies:    w.skill_care_babies    || false,
    skill_care_toddler:   w.skill_care_toddler   || false,
    skill_care_children:  w.skill_care_children  || false,
    skill_care_elderly:   w.skill_care_elderly   || false,
    skill_care_disabled:  w.skill_care_disabled  || false,
    skill_care_bedridden: w.skill_care_bedridden || false,
    skill_care_pet:       w.skill_care_pet       || false,
    skill_household:      w.skill_household      || false,
    skill_car_washing:    w.skill_car_washing    || false,
    skill_gardening:      w.skill_gardening      || false,
    skill_cooking:        w.skill_cooking        || false,
    skill_driving:        w.skill_driving        || false,
    skill_pickup_taobao:  w.skill_pickup_taobao  || false,
    lang_mandarin:  w.lang_mandarin  || '',
    lang_cantonese: w.lang_cantonese || '',
    lang_english:   w.lang_english   || '',
    overseas: ovs.map(e => ({ country: e.country || '', duration: e.duration || '' })),
    duties: dts.map(d => ({
      working_country:     d.working_country     || '',
      duration_from:       d.duration_from       || '',
      duration_to:         d.duration_to         || '',
      salary:              d.salary              || '',
      reason_to_leave:     d.reason_to_leave     || '',
      employer_family_info: d.employer_family_info || '',
      skill_care_babies:    d.skill_care_babies    || false,
      baby_age_range:       d.baby_age_range       || '',
      skill_care_toddler:   d.skill_care_toddler   || false,
      toddler_age_range:    d.toddler_age_range    || '',
      skill_care_children:  d.skill_care_children  || false,
      children_age_range:   d.children_age_range   || '',
      skill_care_elderly:   d.skill_care_elderly   || false,
      skill_care_disabled:  d.skill_care_disabled  || false,
      skill_care_bedridden: d.skill_care_bedridden || false,
      skill_care_pet:       d.skill_care_pet       || false,
      skill_household:      d.skill_household      || false,
      skill_car_washing:    d.skill_car_washing    || false,
      skill_gardening:      d.skill_gardening      || false,
      skill_cooking:        d.skill_cooking        || false,
      skill_driving:        d.skill_driving        || false,
      skill_pickup_taobao:  d.skill_pickup_taobao  || false,
    })),
    eats_pork:        boolToStr(w.eats_pork),
    available_sundays: boolToStr(w.available_sundays),
    can_share_room:   boolToStr(w.can_share_room),
    share_room_notes: w.share_room_notes || '',
    has_tattoo:       boolToStr(w.has_tattoo),
    smokes:           boolToStr(w.smokes),
    afraid_of_pets:   boolToStr(w.afraid_of_pets),
    had_surgery:      boolToStr(w.had_surgery),
    surgery_details:  w.surgery_details  || '',
    has_allergies:    boolToStr(w.has_allergies),
    allergy_details:  w.allergy_details  || '',
    remark:           w.remark           || '',
  };
}

export default function WorkerEditPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WorkerFormData>(initialFormData);
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/signin'); return; }

      const { data: w } = await supabase
        .from('workers').select('*').eq('user_id', user.id).single();
      if (!w) { router.push('/worker/register'); return; }

      const [{ data: ovs }, { data: dts }] = await Promise.all([
        supabase.from('worker_overseas_experience').select('*').eq('worker_id', w.id).order('display_order'),
        supabase.from('worker_previous_duties').select('*').eq('worker_id', w.id).order('job_order'),
      ]);

      setWorkerId(w.id);
      setUserId(user.id);
      setForm(dbToForm(w, ovs || [], dts || []));
      setDataLoading(false);
    };
    load();
  }, [router]);

  const update = (fields: Partial<WorkerFormData>) =>
    setForm(f => ({ ...f, ...fields }));

  const goNext = () => { setStep(s => s + 1); window.scrollTo({ top: 0 }); };
  const goPrev = () => { setStep(s => s - 1); window.scrollTo({ top: 0 }); };

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError('請填寫全名'); setStep(0); return; }
    if (!workerId) return;
    setLoading(true);
    setError('');

    const { error: updateErr } = await supabase
      .from('workers')
      .update({
        photo_url:      form.photo_url || null,
        name:           form.name,
        nationality:    form.nationality    || null,
        gender:         form.gender         || null,
        date_of_birth:  form.date_of_birth  || null,
        marital_status: form.marital_status || null,
        education:      form.education      || null,
        religion:       form.religion       || null,
        height_cm:      parseInt(form.height_cm)    || null,
        weight_kg:      parseInt(form.weight_kg)    || null,
        birth_order:    parseInt(form.birth_order)  || null,
        num_brothers:   parseInt(form.num_brothers) || 0,
        num_sisters:    parseInt(form.num_sisters)  || 0,
        num_sons:       parseInt(form.num_sons)     || 0,
        son_ages:       form.son_ages       || null,
        num_daughters:  parseInt(form.num_daughters) || 0,
        daughter_ages:  form.daughter_ages  || null,
        hkid:           form.hkid           || null,
        hk_mobile:      form.hk_mobile      || null,
        contract_end_date: form.contract_end_date || null,
        skill_care_babies:    form.skill_care_babies,
        skill_care_toddler:   form.skill_care_toddler,
        skill_care_children:  form.skill_care_children,
        skill_care_elderly:   form.skill_care_elderly,
        skill_care_disabled:  form.skill_care_disabled,
        skill_care_bedridden: form.skill_care_bedridden,
        skill_care_pet:       form.skill_care_pet,
        skill_household:      form.skill_household,
        skill_car_washing:    form.skill_car_washing,
        skill_gardening:      form.skill_gardening,
        skill_cooking:        form.skill_cooking,
        skill_driving:        form.skill_driving,
        skill_pickup_taobao:  form.skill_pickup_taobao,
        lang_mandarin:  form.lang_mandarin  || null,
        lang_cantonese: form.lang_cantonese || null,
        lang_english:   form.lang_english   || null,
        eats_pork:         toBool(form.eats_pork),
        available_sundays: toBool(form.available_sundays),
        can_share_room:    toBool(form.can_share_room),
        share_room_notes:  form.share_room_notes  || null,
        has_tattoo:        toBool(form.has_tattoo)    ?? false,
        smokes:            toBool(form.smokes)         ?? false,
        afraid_of_pets:    toBool(form.afraid_of_pets) ?? false,
        had_surgery:       toBool(form.had_surgery)    ?? false,
        surgery_details:   form.surgery_details  || null,
        has_allergies:     toBool(form.has_allergies)  ?? false,
        allergy_details:   form.allergy_details  || null,
        remark:            form.remark           || null,
      })
      .eq('id', workerId);

    if (updateErr) {
      setError('更新失敗：' + updateErr.message);
      setLoading(false);
      return;
    }

    // Re-insert overseas experience
    await supabase.from('worker_overseas_experience').delete().eq('worker_id', workerId);
    const validOverseas = form.overseas.filter(e => e.country);
    if (validOverseas.length > 0) {
      await supabase.from('worker_overseas_experience').insert(
        validOverseas.map((exp, i) => ({
          worker_id: workerId, country: exp.country,
          duration: exp.duration || null, display_order: i,
        }))
      );
    }

    // Re-insert previous duties
    await supabase.from('worker_previous_duties').delete().eq('worker_id', workerId);
    if (form.duties.length > 0) {
      await supabase.from('worker_previous_duties').insert(
        form.duties.map((d, i) => ({
          worker_id: workerId, job_order: i + 1,
          working_country:     d.working_country     || null,
          duration_from:       d.duration_from       || null,
          duration_to:         d.duration_to         || null,
          salary:              d.salary              || null,
          reason_to_leave:     d.reason_to_leave     || null,
          employer_family_info: d.employer_family_info || null,
          skill_care_babies:    d.skill_care_babies,
          baby_age_range:       d.baby_age_range    || null,
          skill_care_toddler:   d.skill_care_toddler,
          toddler_age_range:    d.toddler_age_range || null,
          skill_care_children:  d.skill_care_children,
          children_age_range:   d.children_age_range || null,
          skill_care_elderly:   d.skill_care_elderly,
          skill_care_disabled:  d.skill_care_disabled,
          skill_care_bedridden: d.skill_care_bedridden,
          skill_care_pet:       d.skill_care_pet,
          skill_household:      d.skill_household,
          skill_car_washing:    d.skill_car_washing,
          skill_gardening:      d.skill_gardening,
          skill_cooking:        d.skill_cooking,
          skill_driving:        d.skill_driving,
          skill_pickup_taobao:  d.skill_pickup_taobao,
        }))
      );
    }

    router.push('/profile');
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">載入資料中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-base font-semibold text-gray-900">{STEPS[step]}</h1>
            <span className="text-sm text-gray-400">{step + 1} / {STEPS.length}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-28">
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}
        {step === 0 && <Step1Basic     form={form} update={update} userId={userId} />}
        {step === 1 && <Step2Contact   form={form} update={update} />}
        {step === 2 && <Step3Skills    form={form} update={update} />}
        {step === 3 && <Step4Languages form={form} update={update} />}
        {step === 4 && <Step5Overseas  form={form} update={update} />}
        {step === 5 && <Step6Duties    form={form} update={update} />}
        {step === 6 && <Step7Other     form={form} update={update} />}
        {step === 7 && <Step8Remarks   form={form} update={update} />}
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
        {step > 0 ? (
          <button onClick={goPrev}
            className="flex-1 py-3.5 border border-gray-300 rounded-xl text-gray-700 font-medium">
            上一步
          </button>
        ) : (
          <button onClick={() => router.push('/profile')}
            className="flex-1 py-3.5 border border-gray-300 rounded-xl text-gray-700 font-medium">
            取消
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={goNext}
            className="flex-1 py-3.5 bg-blue-600 rounded-xl text-white font-semibold active:bg-blue-700">
            下一步
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading || !form.name.trim()}
            className="flex-1 py-3.5 bg-green-600 rounded-xl text-white font-semibold disabled:opacity-50">
            {loading ? '儲存中...' : '儲存變更'}
          </button>
        )}
      </div>
    </div>
  );
}
