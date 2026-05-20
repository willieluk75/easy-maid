'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

function validatePassword(pw: string): string[] {
  const errors: string[] = [];
  if (pw.length < 8) errors.push('至少 8 個字元');
  if (!/[0-9]/.test(pw)) errors.push('包含數字');
  if (!/[A-Z]/.test(pw)) errors.push('包含大寫字母');
  return errors;
}

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const pwErrors = password ? validatePassword(password) : [];
  const pwValid = pwErrors.length === 0;

  const rules = [
    { label: '8 位以上', ok: password.length >= 8 },
    { label: '含數字', ok: /[0-9]/.test(password) },
    { label: '含大寫', ok: /[A-Z]/.test(password) },
  ];

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const errors = validatePassword(password);
    if (errors.length > 0) {
      setError('密碼需要：' + errors.join('、'));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('密碼不一致');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => {
        router.push('/profile');
      }, 2000);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/profile`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleFacebookSignUp = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/profile`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-[400px] w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-bold text-[#222222] leading-[1.43]">
            歡迎加入
          </h1>
          <p className="mt-2 text-[16px] text-[#6a6a6a]">
            建立你的外傭招聘平台帳號
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-[#fff5f5] border border-[#c13515]/20 text-[#c13515] px-4 py-3 rounded-[8px] text-[14px] mb-6">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-[#f0fdf4] border border-[#16a34a]/20 text-[#16a34a] px-4 py-3 rounded-[8px] text-[14px] mb-6">
            註冊成功！請檢查您的信箱確認 Email，正在導向個人檔案頁...
          </div>
        )}

        {/* Form */}
        <form className="flex flex-col gap-3" onSubmit={handleEmailSignUp}>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-airbnb"
            placeholder="電子信箱"
          />

          <div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-airbnb pr-12"
                placeholder="密碼"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#929292] hover:text-[#222222] transition-colors"
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>

            {/* Password strength dots */}
            {password && (
              <div className="mt-2 flex items-center gap-1.5">
                {rules.map(({ label, ok }) => (
                  <span key={label} className="group relative flex items-center" title={label}>
                    <span className={`w-2 h-2 rounded-full transition-colors ${ok ? 'bg-[#222222]' : 'bg-[#dddddd]'}`} />
                  </span>
                ))}
                <span className="ml-1.5 text-[12px] text-[#6a6a6a]">
                  {rules.filter(r => r.ok).length}/{rules.length}
                </span>
              </div>
            )}
          </div>

          <div>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`input-airbnb pr-12 ${
                  confirmPassword && confirmPassword !== password ? 'error' : ''
                }`}
                placeholder="確認密碼"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#929292] hover:text-[#222222] transition-colors"
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="mt-1 text-[12px] text-[#c13515]">密碼不一致</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !pwValid}
            className="btn-primary w-full mt-1"
          >
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#dddddd]"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white text-[14px] text-[#6a6a6a]">或</span>
          </div>
        </div>

        {/* Social OAuth — circular icon buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="btn-social"
            aria-label="Google 註冊"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          </button>

          <button
            onClick={handleFacebookSignUp}
            disabled={loading}
            className="btn-social"
            aria-label="Facebook 註冊"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>
        </div>

        {/* Sign in link */}
        <p className="mt-6 text-center text-[14px] text-[#6a6a6a]">
          已有帳號？{' '}
          <a href="/signin" className="text-[#222222] font-semibold hover:text-[#ff385c] transition-colors">
            登入
          </a>
        </p>
      </div>
    </main>
  );
}
