'use client';

import { useEffect, useState } from 'react';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">載入中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-900">我的帳號</h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-red-500"
        >
          登出
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {!employer ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-4">
            <p className="text-gray-500 text-sm">您還未完成僱主登記</p>
            <a
              href="/signup"
              className="inline-block px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl"
            >
              前往登記
            </a>
          </div>
        ) : editing ? (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-gray-900">修改資料</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                聯絡人姓名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">公司名稱（選填）</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">電話（選填）</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">地區（選填）</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                className="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !contactName.trim()}
                className="flex-1 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '儲存中...' : '儲存'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-gray-900">僱主資料</h2>
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-blue-600 font-medium"
              >
                修改
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex py-1 border-b border-gray-50">
                <span className="w-28 text-xs text-gray-400">聯絡人</span>
                <span className="text-sm text-gray-800">{employer.contact_name}</span>
              </div>
              {employer.company_name && (
                <div className="flex py-1 border-b border-gray-50">
                  <span className="w-28 text-xs text-gray-400">公司</span>
                  <span className="text-sm text-gray-800">{employer.company_name}</span>
                </div>
              )}
              {employer.phone && (
                <div className="flex py-1 border-b border-gray-50">
                  <span className="w-28 text-xs text-gray-400">電話</span>
                  <span className="text-sm text-gray-800">{employer.phone}</span>
                </div>
              )}
              {employer.district && (
                <div className="flex py-1">
                  <span className="w-28 text-xs text-gray-400">地區</span>
                  <span className="text-sm text-gray-800">{employer.district}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Browse workers link */}
        <a
          href="/workers"
          className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-800">瀏覽外傭</span>
          </div>
          <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}
