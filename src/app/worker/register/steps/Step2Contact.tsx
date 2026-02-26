'use client';
import { WorkerFormData } from '../types';

interface Props {
  form: WorkerFormData;
  update: (fields: Partial<WorkerFormData>) => void;
}

const lbl = 'block text-sm font-medium text-gray-700 mb-1.5';

// 格式：1-2 英文字母 + 6 數字 + (數字或A)，例如 A123456(7) 或 AB123456(A)
const HKID_REGEX = /^[A-Za-z]{1,2}\d{6}\([0-9A]\)$/;

export function isValidHKID(val: string) {
  return HKID_REGEX.test(val.trim());
}

export default function Step2Contact({ form, update }: Props) {
  const hkidVal = form.hkid.trim();
  const hkidTouched = hkidVal.length > 0;
  const hkidOk = isValidHKID(hkidVal);

  const hkidBorder = !hkidTouched
    ? 'border-gray-300'
    : hkidOk
    ? 'border-green-400 focus:ring-green-500'
    : 'border-red-400 focus:ring-red-500';

  const inp = `w-full px-4 py-3 border ${hkidBorder} rounded-xl text-base focus:outline-none focus:ring-2 bg-white`;
  const inpNormal = 'w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

  return (
    <div className="space-y-5">
      <div>
        <label className={lbl}>香港身份證號碼 HKID</label>
        <input
          type="text"
          value={form.hkid}
          onChange={e => update({ hkid: e.target.value.toUpperCase() })}
          className={inp}
          placeholder="e.g. A123456(7)"
          autoCapitalize="characters"
        />
        {hkidTouched && !hkidOk && (
          <p className="mt-1.5 text-xs text-red-500">
            格式錯誤，正確格式：A123456(7) 或 AB123456(A)
          </p>
        )}
        {hkidTouched && hkidOk && (
          <p className="mt-1.5 text-xs text-green-600">✓ 格式正確</p>
        )}
        <p className="mt-1 text-xs text-gray-400">1-2個英文字母 + 6位數字 + (核對碼)</p>
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
