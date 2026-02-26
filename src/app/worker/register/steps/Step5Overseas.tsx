'use client';
import { WorkerFormData, OverseasExp } from '../types';

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

export default function Step5Overseas({ form, update }: Props) {
  const add = () => update({ overseas: [...form.overseas, { country: '', duration: '' }] });

  const upd = (i: number, fields: Partial<OverseasExp>) => {
    update({ overseas: form.overseas.map((e, idx) => idx === i ? { ...e, ...fields } : e) });
  };

  const remove = (i: number) => {
    update({ overseas: form.overseas.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">請填寫曾在香港或海外工作的地點及年期</p>

      {form.overseas.length === 0 && (
        <p className="text-center py-8 text-gray-400 text-sm">尚未新增工作地點</p>
      )}

      {form.overseas.map((exp, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">地點 {i + 1}</span>
            <button onClick={() => remove(i)} className="text-red-400 text-sm font-medium">移除</button>
          </div>
          <div>
            <label className={lbl}>工作地點</label>
            <select value={exp.country} onChange={e => upd(i, { country: e.target.value })} className={inp}>
              <option value="">請選擇</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>工作年期 Duration</label>
            <input type="text" value={exp.duration} onChange={e => upd(i, { duration: e.target.value })}
              className={inp} placeholder="e.g. 3 years 2 months" />
          </div>
        </div>
      ))}

      <button type="button" onClick={add}
        className="w-full py-3.5 border-2 border-dashed border-blue-300 rounded-2xl text-blue-600 font-medium text-sm active:bg-blue-50">
        + 新增工作地點
      </button>
    </div>
  );
}
