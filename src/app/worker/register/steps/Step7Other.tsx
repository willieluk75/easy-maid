'use client';
import { WorkerFormData } from '../types';

interface Props {
  form: WorkerFormData;
  update: (fields: Partial<WorkerFormData>) => void;
}

const inp = 'w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

function YesNo({ zh, en, value, onChange }: {
  zh: string; en: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-sm font-medium text-gray-800">{zh}</p>
      <p className="text-xs text-gray-500 -mt-1.5">{en}</p>
      <div className="flex gap-3">
        {[['yes', '是 Yes'], ['no', '否 No']].map(([v, l]) => (
          <button key={v} type="button" onClick={() => onChange(v)}
            className={`flex-1 py-3 rounded-xl border font-medium text-sm transition-colors ${
              value === v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
            }`}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Step7Other({ form, update }: Props) {
  return (
    <div className="space-y-6">
      <YesNo zh="你吃豬肉嗎？" en="Do you eat pork?"
        value={form.eats_pork} onChange={v => update({ eats_pork: v })} />

      <YesNo zh="你能在星期日上班嗎？" en="Are you available on Sundays?"
        value={form.available_sundays} onChange={v => update({ available_sundays: v })} />

      <YesNo zh="你可以與嬰兒／小童同住一室嗎？" en="Can you share a room with babies/children?"
        value={form.can_share_room} onChange={v => update({ can_share_room: v })} />
      {form.can_share_room === 'yes' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">詳情 Details</label>
          <input type="text" value={form.share_room_notes} onChange={e => update({ share_room_notes: e.target.value })}
            className={inp} placeholder="備注" />
        </div>
      )}

      <YesNo zh="你身上有紋身嗎？" en="Do you have any tattoo?"
        value={form.has_tattoo} onChange={v => update({ has_tattoo: v })} />

      <YesNo zh="你吸煙嗎？" en="Do you smoke?"
        value={form.smokes} onChange={v => update({ smokes: v })} />

      <YesNo zh="你害怕狗或貓嗎？" en="Are you afraid of dogs or cats?"
        value={form.afraid_of_pets} onChange={v => update({ afraid_of_pets: v })} />

      <YesNo zh="你曾接受過手術嗎？" en="Have you undergone any surgery?"
        value={form.had_surgery} onChange={v => update({ had_surgery: v })} />
      {form.had_surgery === 'yes' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">手術詳情 Surgery Details</label>
          <input type="text" value={form.surgery_details} onChange={e => update({ surgery_details: e.target.value })}
            className={inp} placeholder="請說明" />
        </div>
      )}

      <YesNo zh="你有任何過敏或危險疾病嗎？" en="Any allergies or dangerous diseases?"
        value={form.has_allergies} onChange={v => update({ has_allergies: v })} />
      {form.has_allergies === 'yes' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">過敏詳情 Allergy Details</label>
          <input type="text" value={form.allergy_details} onChange={e => update({ allergy_details: e.target.value })}
            className={inp} placeholder="請說明" />
        </div>
      )}
    </div>
  );
}
