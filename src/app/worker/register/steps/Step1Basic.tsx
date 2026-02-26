'use client';
import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { WorkerFormData } from '../types';

interface Props {
  form: WorkerFormData;
  update: (fields: Partial<WorkerFormData>) => void;
  userId: string;
}

const inp = 'w-full px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';
const lbl = 'block text-sm font-medium text-gray-700 mb-1.5';

export default function Step1Basic({ form, update, userId }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState('');

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadErr('');

    const { error } = await supabase.storage
      .from('worker-assets')
      .upload(`${userId}/profile.jpg`, file, { upsert: true, contentType: file.type });

    if (error) {
      setUploadErr('上傳失敗，請重試');
    } else {
      const { data } = supabase.storage
        .from('worker-assets')
        .getPublicUrl(`${userId}/profile.jpg`);
      update({ photo_url: data.publicUrl });
    }
    setUploading(false);
  };

  return (
    <div className="space-y-5">
      {/* Photo upload */}
      <div className="flex flex-col items-center pb-2">
        <div
          className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 cursor-pointer relative border-2 border-dashed border-gray-300 flex items-center justify-center"
          onClick={() => fileInputRef.current?.click()}
        >
          {form.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.photo_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
              <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <button type="button" onClick={() => fileInputRef.current?.click()}
          className="mt-2 text-sm text-blue-600 font-medium">
          {form.photo_url ? '更換照片' : '上傳個人照片'}
        </button>
        {uploadErr && <p className="text-xs text-red-500 mt-1">{uploadErr}</p>}
      </div>

      <div>
        <label className={lbl}>全名 Full Name <span className="text-red-500">*</span></label>
        <input type="text" value={form.name} onChange={e => update({ name: e.target.value })}
          className={inp} placeholder="e.g. Maria Santos" />
      </div>

      <div>
        <label className={lbl}>國籍 Nationality</label>
        <input type="text" value={form.nationality} onChange={e => update({ nationality: e.target.value })}
          className={inp} />
      </div>

      <div>
        <label className={lbl}>性別 Gender</label>
        <div className="flex gap-3">
          {[['F', '女 Female'], ['M', '男 Male']].map(([val, label]) => (
            <button key={val} type="button" onClick={() => update({ gender: val })}
              className={`flex-1 py-3 rounded-xl border font-medium text-base transition-colors ${
                form.gender === val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={lbl}>出生日期 Date of Birth</label>
        <input type="date" value={form.date_of_birth} onChange={e => update({ date_of_birth: e.target.value })}
          className={inp} />
      </div>

      <div>
        <label className={lbl}>婚姻狀況 Marital Status</label>
        <select value={form.marital_status} onChange={e => update({ marital_status: e.target.value })} className={inp}>
          <option value="">請選擇</option>
          <option value="Single">未婚 Single</option>
          <option value="Married">已婚 Married</option>
          <option value="Divorced">離婚 Divorced</option>
          <option value="Widowed">喪偶 Widowed</option>
        </select>
      </div>

      <div>
        <label className={lbl}>學歷 Education</label>
        <select value={form.education} onChange={e => update({ education: e.target.value })} className={inp}>
          <option value="">請選擇</option>
          <option value="Elementary">小學 Elementary</option>
          <option value="High School">中學 High School</option>
          <option value="College">大學 College</option>
          <option value="Vocational">職業訓練 Vocational</option>
          <option value="Other">其他 Other</option>
        </select>
      </div>

      <div>
        <label className={lbl}>宗教 Religion</label>
        <select value={form.religion} onChange={e => update({ religion: e.target.value })} className={inp}>
          <option value="">請選擇</option>
          <option value="Catholic">天主教 Catholic</option>
          <option value="Christian">基督教 Christian</option>
          <option value="Muslim">伊斯蘭教 Muslim</option>
          <option value="Buddhist">佛教 Buddhist</option>
          <option value="None">無 None</option>
          <option value="Other">其他 Other</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>身高 Height (cm)</label>
          <input type="number" value={form.height_cm} onChange={e => update({ height_cm: e.target.value })}
            className={inp} placeholder="e.g. 158" />
        </div>
        <div>
          <label className={lbl}>體重 Weight (kg)</label>
          <input type="number" value={form.weight_kg} onChange={e => update({ weight_kg: e.target.value })}
            className={inp} placeholder="e.g. 52" />
        </div>
      </div>

      <div>
        <label className={lbl}>家中排行 Birth Order</label>
        <input type="number" min="1" value={form.birth_order} onChange={e => update({ birth_order: e.target.value })}
          className={inp} placeholder="e.g. 2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>兄弟數目 Brothers</label>
          <input type="number" min="0" value={form.num_brothers} onChange={e => update({ num_brothers: e.target.value })}
            className={inp} />
        </div>
        <div>
          <label className={lbl}>姊妹數目 Sisters</label>
          <input type="number" min="0" value={form.num_sisters} onChange={e => update({ num_sisters: e.target.value })}
            className={inp} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>兒子數目 Sons</label>
          <input type="number" min="0" value={form.num_sons} onChange={e => update({ num_sons: e.target.value })}
            className={inp} />
        </div>
        <div>
          <label className={lbl}>年齡 Ages</label>
          <input type="text" value={form.son_ages} onChange={e => update({ son_ages: e.target.value })}
            className={inp} placeholder="e.g. 22 / 25" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={lbl}>女兒數目 Daughters</label>
          <input type="number" min="0" value={form.num_daughters} onChange={e => update({ num_daughters: e.target.value })}
            className={inp} />
        </div>
        <div>
          <label className={lbl}>年齡 Ages</label>
          <input type="text" value={form.daughter_ages} onChange={e => update({ daughter_ages: e.target.value })}
            className={inp} placeholder="e.g. 18" />
        </div>
      </div>
    </div>
  );
}
