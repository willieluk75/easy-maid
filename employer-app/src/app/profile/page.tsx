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

      // Ensure user has a role (for OAuth users who bypass signup page)
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user.id)
        .maybeSingle();

      if (!existingRole) {
        await supabase.from('user_roles').insert({ user_id: data.user.id, role: 'employer' });
      }

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
        <p className="text-[#6a6a6a] text-sm">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-[#f2f2f2] px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-semibold text-[#222222]">我的帳號</h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-[#c13515]"
        >
          登出
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Avatar + Name section */}
        <div className="bg-white rounded-[14px] border border-[#f2f2f2] p-4 flex flex-col items-center space-y-3">
          <div className="w-20 h-20 rounded-full border-2 border-[#f2f2f2] bg-[#f7f7f7] flex items-center justify-center text-[#6a6a6a] text-2xl">
            {employer?.contact_name?.charAt(0) ?? '?'}
          </div>
          <p className="text-[22px] font-semibold text-[#222222] tracking-[-0.44px]">
            {employer?.contact_name ?? '未登記'}
          </p>
          {employer?.company_name && (
            <p className="text-sm text-[#6a6a6a]">{employer.company_name}</p>
          )}
        </div>

        {!employer ? (
          <div className="bg-white rounded-[14px] border border-[#f2f2f2] p-4 text-center space-y-4">
            <p className="text-sm text-[#6a6a6a]">您還未完成僱主登記</p>
            <a
              href="/signup"
              className="inline-flex items-center justify-center h-12 px-6 bg-[#222222] text-white text-sm font-semibold rounded-[8px] hover:bg-black transition-colors"
            >
              前往登記
            </a>
          </div>
        ) : editing ? (
          <div className="bg-white rounded-[14px] border border-[#f2f2f2] p-4 space-y-4">
            <h2 className="text-base font-semibold text-[#222222]">修改資料</h2>

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
                className="mt-1 block w-full px-3 py-2 border border-[#f2f2f2] rounded-[8px] text-sm focus:outline-none focus:ring-1 focus:ring-[#222222] focus:border-[#222222]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222]">公司名稱（選填）</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[#f2f2f2] rounded-[8px] text-sm focus:outline-none focus:ring-1 focus:ring-[#222222] focus:border-[#222222]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222]">電話（選填）</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[#f2f2f2] rounded-[8px] text-sm focus:outline-none focus:ring-1 focus:ring-[#222222] focus:border-[#222222]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222]">地區（選填）</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-[#f2f2f2] rounded-[8px] text-sm focus:outline-none focus:ring-1 focus:ring-[#222222] focus:border-[#222222]"
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
                className="flex-1 h-12 border border-[#dddddd] text-[#222222] text-sm font-medium rounded-[8px] hover:bg-[#f7f7f7] transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !contactName.trim()}
                className="flex-1 h-12 bg-[#222222] text-white text-sm font-semibold rounded-[8px] hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[14px] border border-[#f2f2f2] p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-[#222222]">僱主資料</h2>
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-[#222222] font-medium underline"
              >
                修改
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex py-1.5 border-b border-[#f2f2f2]">
                <span className="w-24 text-sm text-[#6a6a6a]">聯絡人</span>
                <span className="text-sm text-[#222222]">{employer.contact_name}</span>
              </div>
              {employer.company_name && (
                <div className="flex py-1.5 border-b border-[#f2f2f2]">
                  <span className="w-24 text-sm text-[#6a6a6a]">公司</span>
                  <span className="text-sm text-[#222222]">{employer.company_name}</span>
                </div>
              )}
              {employer.phone && (
                <div className="flex py-1.5 border-b border-[#f2f2f2]">
                  <span className="w-24 text-sm text-[#6a6a6a]">電話</span>
                  <span className="text-sm text-[#222222]">{employer.phone}</span>
                </div>
              )}
              {employer.district && (
                <div className="flex py-1.5">
                  <span className="w-24 text-sm text-[#6a6a6a]">地區</span>
                  <span className="text-sm text-[#222222]">{employer.district}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Browse workers link */}
        <Link
          href="/workers"
          className="flex items-center justify-between bg-white rounded-[14px] border border-[#f2f2f2] p-4 hover:border-[#dddddd] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#f7f7f7] rounded-[8px] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#6a6a6a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-[#222222]">瀏覽外傭</span>
          </div>
          <svg className="w-4 h-4 text-[#6a6a6a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
