'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const DISTRICTS = ['香港島', '九龍', '新界', '離島'];

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactName, setContactName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/workers');
    });
  }, [router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      setError(authError?.message ?? '註冊失敗');
      setLoading(false);
      return;
    }

    const userId = authData.user.id;

    // 2. Insert into employers table
    const { error: empError } = await supabase.from('employers').insert({
      user_id: userId,
      contact_name: contactName,
      company_name: companyName || null,
      phone: phone || null,
      district: district || null,
    });

    if (empError) {
      setError('帳號已建立但儲存資料失敗：' + empError.message);
      setLoading(false);
      return;
    }

    // 3. Insert user role
    await supabase.from('user_roles').insert({ user_id: userId, role: 'employer' });

    window.location.href = '/workers';
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/workers` },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f7f7] px-4 py-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-[20px]" style={{ boxShadow: 'rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px' }}>
        <div>
          <h2 className="text-center text-[28px] font-bold text-[#222222]">僱主登記</h2>
          <p className="mt-2 text-center text-sm text-[#6a6a6a]">
            已有帳號？{' '}
            <a href="/signin" className="text-[#222222] font-semibold hover:text-[#ff385c]">
              登入
            </a>
          </p>
        </div>

        {error && (
          <div className="bg-[#fff5f5] border border-[#c13515]/20 text-[#c13515] px-4 py-3 rounded-[8px]">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSignUp}>
          <input
            type="text"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            className="block w-full h-14 px-4 border-[1.5px] border-[#dddddd] rounded-[8px] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222] text-sm"
            placeholder="聯絡人姓名 *"
          />

          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="block w-full h-14 px-4 border-[1.5px] border-[#dddddd] rounded-[8px] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222] text-sm"
            placeholder="公司名稱（選填）"
          />

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="block w-full h-14 px-4 border-[1.5px] border-[#dddddd] rounded-[8px] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222] text-sm"
            placeholder="電話（選填）"
          />

          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="block w-full h-14 px-4 border-[1.5px] border-[#dddddd] rounded-[8px] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222] text-sm"
          >
            <option value="">請選擇地區（選填）</option>
            {DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <div className="border-t border-[#dddddd] pt-4 space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full h-14 px-4 border-[1.5px] border-[#dddddd] rounded-[8px] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222] text-sm"
              placeholder="Email *"
            />

            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full h-14 px-4 border-[1.5px] border-[#dddddd] rounded-[8px] focus:outline-none focus:border-[#222222] focus:ring-2 focus:ring-[#222222] text-sm"
              placeholder="密碼 *"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 flex justify-center px-4 rounded-[8px] text-sm font-semibold text-white bg-[#222222] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#222222] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '登記中...' : '登記'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#dddddd]" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-[#6a6a6a]">或</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="w-12 h-12 flex items-center justify-center rounded-full border border-[#dddddd] bg-white hover:bg-[#f7f7f7] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </button>
          <span className="text-sm text-[#6a6a6a]">使用 Google 登記</span>
        </div>
      </div>
    </main>
  );
}
