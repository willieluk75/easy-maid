'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Employer {
  id: string;
  contact_name: string;
  company_name: string | null;
  phone: string | null;
  district: string | null;
}

const DISTRICTS = ['香港島', '九龍', '新界', '離島'];

export default function ProfilePage() {
  const router = useRouter();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Edit form state
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/signin');
        return;
      }
      setUserId(data.user.id);

      const { data: emp } = await supabase
        .from('employers')
        .select('id, contact_name, company_name, phone, district')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (emp) {
        setEmployer(emp as Employer);
        setContactName(emp.contact_name);
        setCompanyName(emp.company_name ?? '');
        setPhone(emp.phone ?? '');
        setDistrict(emp.district ?? '');
      }
      setLoading(false);
    });
  }, [router]);

  const handleSave = async () => {
    if (!employer || !userId) return;
    setSaving(true);
    setError('');

    const { error: err } = await supabase
      .from('employers')
      .update({
        contact_name: contactName,
        company_name: companyName || null,
        phone: phone || null,
        district: district || null,
      })
      .eq('id', employer.id);

    if (err) {
      setError(err.message);
    } else {
      setEmployer(prev => prev ? {
        ...prev,
        contact_name: contactName,
        company_name: companyName || null,
        phone: phone || null,
        district: district || null,
      } : prev);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <p className="text-[#929292] text-sm">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#dddddd] px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold text-[#222222]">我的帳號</h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-[#c13515]"
        >
          登出
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {!employer ? (
          <div className="bg-white rounded-[14px] p-6 shadow-sm text-center space-y-4">
            <p className="text-[#6a6a6a] text-sm">您還未完成僱主登記</p>
            <a
              href="/signup"
              className="inline-block px-6 py-2 bg-[#ff385c] text-white text-sm font-semibold rounded-[8px]"
            >
              前往登記
            </a>
          </div>
        ) : editing ? (
          <div className="bg-white rounded-[14px] p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-[#222222]">修改資料</h2>

            {error && (
              <div className="bg-[#fff5f5] border border-[#ffcdd2] text-[#c13515] px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#222222]">
                聯絡人姓名 <span className="text-[#c13515]">*</span>
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[#dddddd] rounded-[14px] text-sm focus:outline-none focus:ring-[#222222] focus:border-[#222222]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222]">公司名稱（選填）</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[#dddddd] rounded-[14px] text-sm focus:outline-none focus:ring-[#222222] focus:border-[#222222]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222]">電話（選填）</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[#dddddd] rounded-[14px] text-sm focus:outline-none focus:ring-[#222222] focus:border-[#222222]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222]">地區（選填）</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[#dddddd] rounded-[14px] text-sm focus:outline-none focus:ring-[#222222] focus:border-[#222222]"
              >
                <option value="">請選擇</option>
                {DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2 border border-[#dddddd] text-[#222222] text-sm font-medium rounded-[8px]"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !contactName.trim()}
                className="flex-1 py-2 bg-[#ff385c] text-white text-sm font-semibold rounded-[8px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-[#222222]">僱主資料</h2>
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-[#ff385c] font-medium"
              >
                修改
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex py-1 border-b border-gray-50">
                <span className="w-28 text-xs text-[#929292]">聯絡人</span>
                <span className="text-sm text-[#3f3f3f]">{employer.contact_name}</span>
              </div>
              {employer.company_name && (
                <div className="flex py-1 border-b border-gray-50">
                  <span className="w-28 text-xs text-[#929292]">公司</span>
                  <span className="text-sm text-[#3f3f3f]">{employer.company_name}</span>
                </div>
              )}
              {employer.phone && (
                <div className="flex py-1 border-b border-gray-50">
                  <span className="w-28 text-xs text-[#929292]">電話</span>
                  <span className="text-sm text-[#3f3f3f]">{employer.phone}</span>
                </div>
              )}
              {employer.district && (
                <div className="flex py-1">
                  <span className="w-28 text-xs text-[#929292]">地區</span>
                  <span className="text-sm text-[#3f3f3f]">{employer.district}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Browse workers link */}
        <Link
          href="/workers"
          className="flex items-center justify-between bg-white rounded-[14px] p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#fff0f3] rounded-[8px] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#ff385c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#3f3f3f]">瀏覽外傭</span>
          </div>
          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
