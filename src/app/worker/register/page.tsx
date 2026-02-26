'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { WorkerFormData, initialFormData } from './types';
import Step1Basic     from './steps/Step1Basic';
import Step2Contact   from './steps/Step2Contact';
import Step3Skills    from './steps/Step3Skills';
import Step4Languages from './steps/Step4Languages';
import Step5Overseas  from './steps/Step5Overseas';
import Step6Duties    from './steps/Step6Duties';
import Step7Other     from './steps/Step7Other';
import Step8Remarks   from './steps/Step8Remarks';

const STEPS = [
  '基本資料',
  '聯絡及合約',
  '技能',
  '語言能力',
  '海外工作記錄',
  '過去工作詳情',
  '其他問題',
  '備注及提交',
];

const toBool = (s: string): boolean | null => {
  if (s === 'yes') return true;
  if (s === 'no')  return false;
  return null;
};

export default function WorkerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<WorkerFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/signin');
      else { setUserId(data.user.id); setAuthChecked(true); }
    });
  }, [router]);

  const update = (fields: Partial<WorkerFormData>) =>
    setForm(f => ({ ...f, ...fields }));

  const goNext = () => {
    setStep(s => s + 1);
    window.scrollTo({ top: 0 });
  };

  const goPrev = () => {
    setStep(s => s - 1);
    window.scrollTo({ top: 0 });
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('請填寫全名');
      setStep(0);
      return;
    }
    setLoading(true);
    setError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/signin'); return; }

    const { data: worker, error: wErr } = await supabase
      .from('workers')
      .insert({
        user_id:        user.id,
        photo_url:      form.photo_url || null,
        name:           form.name,
        nationality:    form.nationality || null,
        gender:         form.gender || null,
        date_of_birth:  form.date_of_birth || null,
        marital_status: form.marital_status || null,
        education:      form.education || null,
        religion:       form.religion || null,
        height_cm:      parseInt(form.height_cm) || null,
        weight_kg:      parseInt(form.weight_kg) || null,
        birth_order:    parseInt(form.birth_order) || null,
        num_brothers:   parseInt(form.num_brothers) || 0,
        num_sisters:    parseInt(form.num_sisters) || 0,
        num_sons:       parseInt(form.num_sons) || 0,
        son_ages:       form.son_ages || null,
        num_daughters:  parseInt(form.num_daughters) || 0,
        daughter_ages:  form.daughter_ages || null,
        hkid:           form.hkid || null,
        hk_mobile:      form.hk_mobile || null,
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
        eats_pork:          toBool(form.eats_pork),
        available_sundays:  toBool(form.available_sundays),
        can_share_room:     toBool(form.can_share_room),
        share_room_notes:   form.share_room_notes || null,
        has_tattoo:         toBool(form.has_tattoo) ?? false,
        smokes:             toBool(form.smokes) ?? false,
        afraid_of_pets:     toBool(form.afraid_of_pets) ?? false,
        had_surgery:        toBool(form.had_surgery) ?? false,
        surgery_details:    form.surgery_details || null,
        has_allergies:      toBool(form.has_allergies) ?? false,
        allergy_details:    form.allergy_details || null,
        remark: form.remark || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (wErr || !worker) {
      setError('提交失敗，請重試。' + (wErr?.message ?? ''));
      setLoading(false);
      return;
    }

    // Insert overseas experience
    const validOverseas = form.overseas.filter(e => e.country);
    if (validOverseas.length > 0) {
      await supabase.from('worker_overseas_experience').insert(
        validOverseas.map((exp, i) => ({
          worker_id:     worker.id,
          country:       exp.country,
          duration:      exp.duration || null,
          display_order: i,
        }))
      );
    }

    // Insert previous duties
    if (form.duties.length > 0) {
      await supabase.from('worker_previous_duties').insert(
        form.duties.map((d, i) => ({
          worker_id:           worker.id,
          job_order:           i + 1,
          working_country:     d.working_country || null,
          duration_from:       d.duration_from || null,
          duration_to:         d.duration_to || null,
          salary:              d.salary || null,
          reason_to_leave:     d.reason_to_leave || null,
          employer_family_info: d.employer_family_info || null,
          skill_care_babies:    d.skill_care_babies,
          baby_age_range:       d.baby_age_range || null,
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

    router.push('/worker/success');
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header with progress bar */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-base font-semibold text-gray-900">{STEPS[step]}</h1>
            <span className="text-sm text-gray-400">{step + 1} / {STEPS.length}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form content */}
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

      {/* Fixed bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3">
        {step > 0 && (
          <button onClick={goPrev}
            className="flex-1 py-3.5 border border-gray-300 rounded-xl text-gray-700 font-medium text-base">
            上一步
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={goNext}
            className="flex-1 py-3.5 bg-blue-600 rounded-xl text-white font-semibold text-base active:bg-blue-700">
            下一步
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading || !form.name.trim()}
            className="flex-1 py-3.5 bg-green-600 rounded-xl text-white font-semibold text-base disabled:opacity-50 active:bg-green-700">
            {loading ? '提交中...' : '提交申請'}
          </button>
        )}
      </div>
    </div>
  );
}
