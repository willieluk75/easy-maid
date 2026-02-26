'use client';
import { WorkerFormData } from '../types';

interface Props {
  form: WorkerFormData;
  update: (fields: Partial<WorkerFormData>) => void;
}

const SKILLS: { key: keyof WorkerFormData; zh: string; en: string }[] = [
  { key: 'skill_care_babies',    zh: '照顧嬰兒',   en: 'Care of Babies' },
  { key: 'skill_care_toddler',   zh: '照顧幼童',   en: 'Care of Toddler' },
  { key: 'skill_care_children',  zh: '照顧小童',   en: 'Care of Children' },
  { key: 'skill_care_elderly',   zh: '照顧長者',   en: 'Care of Elderly' },
  { key: 'skill_care_disabled',  zh: '照顧傷殘',   en: 'Care of Disabled' },
  { key: 'skill_care_bedridden', zh: '照顧臥床者', en: 'Care of Bedridden' },
  { key: 'skill_care_pet',       zh: '照顧寵物',   en: 'Care of Pet' },
  { key: 'skill_household',      zh: '家務',       en: 'Household Works' },
  { key: 'skill_car_washing',    zh: '洗車',       en: 'Car Washing' },
  { key: 'skill_gardening',      zh: '打理花園',   en: 'Gardening' },
  { key: 'skill_cooking',        zh: '烹飪',       en: 'Cooking' },
  { key: 'skill_driving',        zh: '駕駛',       en: 'Driving' },
  { key: 'skill_pickup_taobao',  zh: '代購淘寶',   en: 'Pickup Taobao' },
];

export default function Step3Skills({ form, update }: Props) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">請選擇你擁有的技能（可多選）</p>
      <div className="grid grid-cols-2 gap-3">
        {SKILLS.map(({ key, zh, en }) => {
          const active = form[key] as boolean;
          return (
            <button key={key} type="button"
              onClick={() => update({ [key]: !active } as Partial<WorkerFormData>)}
              className={`py-3 px-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                active
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-600'
              }`}>
              <span className="block font-semibold">{zh}</span>
              <span className="block text-xs opacity-70">{en}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
