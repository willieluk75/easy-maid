'use client';
import { WorkerFormData } from '../types';

interface Props {
  form: WorkerFormData;
  update: (fields: Partial<WorkerFormData>) => void;
}

const inp = 'w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const lbl = 'block text-sm font-medium text-gray-700 mb-1.5';

export default function Step2Contact({ form, update }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className={lbl}>香港身份證號碼 HKID</label>
        <input type="text" value={form.hkid} onChange={e => update({ hkid: e.target.value })}
          className={inp} placeholder="e.g. A123456(7)" />
      </div>

      <div>
        <label className={lbl}>香港手機號碼 HK Mobile</label>
        <input type="tel" value={form.hk_mobile} onChange={e => update({ hk_mobile: e.target.value })}
          className={inp} placeholder="e.g. 9123 4567" />
      </div>

      <div>
        <label className={lbl}>本合約最後日期 Contract End Date</label>
        <input type="date" value={form.contract_end_date} onChange={e => update({ contract_end_date: e.target.value })}
          className={inp} />
        <p className="mt-1.5 text-xs text-gray-400">如現時未受僱，可留空</p>
      </div>
    </div>
  );
}
