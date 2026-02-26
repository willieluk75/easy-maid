'use client';
import { WorkerFormData } from '../types';

interface Props {
  form: WorkerFormData;
  update: (fields: Partial<WorkerFormData>) => void;
}

export default function Step8Remarks({ form, update }: Props) {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          備注 / 自我介紹 Remarks
        </label>
        <textarea
          value={form.remark}
          onChange={e => update({ remark: e.target.value })}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
          placeholder="Please briefly describe your work attitude, strengths and experience..."
        />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-sm">
        <p className="font-semibold text-amber-800">提交前請確認：</p>
        <ul className="list-disc list-inside space-y-1 text-amber-700">
          <li>所有資料均屬實</li>
          <li>提交後將由 Easy Maid 職員審核</li>
          <li>審核通過後你的資料將公開顯示</li>
          <li>如需修改，請聯絡 Easy Maid 職員</li>
        </ul>
      </div>
    </div>
  );
}
