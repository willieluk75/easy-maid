'use client';
import { WorkerFormData, PreviousDuty, emptyDuty } from '../types';

interface Props {
  form: WorkerFormData;
  update: (fields: Partial<WorkerFormData>) => void;
}

const COUNTRIES = [
  'Hong Kong', 'Singapore', 'Taiwan', 'Malaysia',
  'Middle East', 'Macau', 'Home Country', 'Other',
];

const inp = 'w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const lbl = 'block text-sm font-medium text-gray-700 mb-1.5';

const SKILLS: { key: keyof PreviousDuty; label: string; ageKey?: keyof PreviousDuty }[] = [
  { key: 'skill_care_babies',    label: '照顧嬰兒',   ageKey: 'baby_age_range' },
  { key: 'skill_care_toddler',   label: '照顧幼童',   ageKey: 'toddler_age_range' },
  { key: 'skill_care_children',  label: '照顧小童',   ageKey: 'children_age_range' },
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

function DutyCard({ duty, index, onUpdate, onRemove }: {
  duty: PreviousDuty;
  index: number;
  onUpdate: (f: Partial<PreviousDuty>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-800">第 {index + 1} 份工作</span>
        <button onClick={onRemove} className="text-red-400 text-sm font-medium">移除</button>
      </div>

      <div>
        <label className={lbl}>工作國家</label>
        <select value={duty.working_country} onChange={e => onUpdate({ working_country: e.target.value })} className={inp}>
          <option value="">請選擇</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={lbl}>開始日期</label>
          <input type="month" value={duty.duration_from} onChange={e => onUpdate({ duration_from: e.target.value })} className={inp} />
        </div>
        <div>
          <label className={lbl}>結束日期</label>
          <input type="month" value={duty.duration_to} onChange={e => onUpdate({ duration_to: e.target.value })} className={inp} />
        </div>
      </div>

      <div>
        <label className={lbl}>月薪 Salary</label>
        <input type="text" value={duty.salary} onChange={e => onUpdate({ salary: e.target.value })}
          className={inp} placeholder="e.g. HKD 4,730" />
      </div>

      <div>
        <label className={lbl}>僱主家庭情況 Employer Family</label>
        <input type="text" value={duty.employer_family_info} onChange={e => onUpdate({ employer_family_info: e.target.value })}
          className={inp} placeholder="e.g. 2 adults, 1 baby aged 6 months" />
      </div>

      <div>
        <label className={lbl}>離職原因 Reason to Leave</label>
        <input type="text" value={duty.reason_to_leave} onChange={e => onUpdate({ reason_to_leave: e.target.value })}
          className={inp} placeholder="Reason for leaving" />
      </div>

      <div>
        <label className={lbl}>工作職責 Duties</label>
        <div className="grid grid-cols-2 gap-2">
          {SKILLS.map(({ key, label, ageKey }) => {
            const active = duty[key] as boolean;
            return (
              <div key={key} className="space-y-1.5">
                <button type="button"
                  onClick={() => onUpdate({ [key]: !active } as Partial<PreviousDuty>)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-sm font-medium text-left transition-all ${
                    active ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600'
                  }`}>
                  {label}
                </button>
                {active && ageKey && (
                  <input type="text"
                    value={duty[ageKey] as string}
                    onChange={e => onUpdate({ [ageKey]: e.target.value } as Partial<PreviousDuty>)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="年齡範圍 Age range" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Step6Duties({ form, update }: Props) {
  const add = () => update({ duties: [...form.duties, { ...emptyDuty }] });

  const upd = (i: number, fields: Partial<PreviousDuty>) => {
    update({ duties: form.duties.map((d, idx) => idx === i ? { ...d, ...fields } : d) });
  };

  const remove = (i: number) => {
    update({ duties: form.duties.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">請填寫過去工作經歷（最多 3 份）</p>

      {form.duties.length === 0 && (
        <p className="text-center py-8 text-gray-400 text-sm">尚未新增工作記錄</p>
      )}

      {form.duties.map((duty, i) => (
        <DutyCard key={i} duty={duty} index={i}
          onUpdate={f => upd(i, f)} onRemove={() => remove(i)} />
      ))}

      {form.duties.length < 3 && (
        <button type="button" onClick={add}
          className="w-full py-3.5 border-2 border-dashed border-blue-300 rounded-2xl text-blue-600 font-medium text-sm active:bg-blue-50">
          + 新增工作記錄
        </button>
      )}
    </div>
  );
}
