'use client';
import { WorkerFormData } from '../types';

interface Props {
  form: WorkerFormData;
  update: (fields: Partial<WorkerFormData>) => void;
}

const LEVELS = [
  { value: 'poor', zh: '弱',   en: 'Poor' },
  { value: 'fair', zh: '一般', en: 'Fair' },
  { value: 'good', zh: '良好', en: 'Good' },
];

const LANGS: { key: 'lang_mandarin' | 'lang_cantonese' | 'lang_english'; zh: string; en: string }[] = [
  { key: 'lang_mandarin',  zh: '普通話', en: 'Mandarin' },
  { key: 'lang_cantonese', zh: '廣東話', en: 'Cantonese' },
  { key: 'lang_english',   zh: '英語',   en: 'English' },
];

export default function Step4Languages({ form, update }: Props) {
  return (
    <div className="space-y-6">
      {LANGS.map(({ key, zh, en }) => (
        <div key={key}>
          <p className="text-sm font-semibold text-gray-800 mb-2.5">
            {zh} <span className="font-normal text-gray-500">{en}</span>
          </p>
          <div className="flex gap-2">
            {LEVELS.map(({ value, zh: lZh, en: lEn }) => (
              <button key={value} type="button"
                onClick={() => update({ [key]: value } as Partial<WorkerFormData>)}
                className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-colors ${
                  form[key] === value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}>
                <span className="block">{lZh}</span>
                <span className="block text-xs opacity-75">{lEn}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
