'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/signin');
      return;
    }

    setUser(user);
    
    if (user.phone) {
      setPhone(user.phone);
      setPhoneVerified(!!user.phone_confirmed_at);
    }
    
    setLoading(false);
  };

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('請輸入有效的手機號碼');
      return;
    }

    setSendingOtp(true);
    setError('');
    setSuccess('');

    console.log('發送 OTP 至:', phone);

    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });

    console.log('OTP 發送回應:', { data, error });

    if (error) {
      console.error('OTP 發送錯誤詳情:', error);
      setError(`發送驗證碼失敗: ${error.message} (${error.status || 'unknown'})`);
      setSendingOtp(false);
    } else {
      console.log('OTP 發送成功');
      setSuccess('驗證碼已發送至您的手機，請檢查 SMS');
      setOtpSent(true);
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError('請輸入 6 位數驗證碼');
      return;
    }

    setVerifyingOtp(true);
    setError('');
    setSuccess('');

    console.log('驗證 OTP:', { phone, otp });

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });

    console.log('OTP 驗證回應:', { data, error });

    if (error) {
      console.error('OTP 驗證錯誤詳情:', error);
      setError(`驗證失敗: ${error.message} (${error.status || 'unknown'})`);
      setVerifyingOtp(false);
    } else {
      console.log('OTP 驗證成功');
      setSuccess('手機號碼驗證成功！');
      setPhoneVerified(true);
      setOtpSent(false);
      setOtp('');
      setVerifyingOtp(false);
      await checkUser();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">個人檔案</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              登出
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">基本資訊</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">用戶 ID</label>
                  <p className="mt-1 text-gray-600 text-sm font-mono">{user?.id}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">手機號碼驗證</h2>
              
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    手機號碼
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={phoneVerified}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="+886912345678"
                    />
                    {phoneVerified && (
                      <span className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium bg-green-100 text-green-800">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        已驗證
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    請輸入完整的國際格式手機號碼，例如：+886912345678
                  </p>
                </div>

                {!phoneVerified && !otpSent && (
                  <button
                    onClick={handleSendOtp}
                    disabled={sendingOtp || !phone}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingOtp ? '發送中...' : '發送驗證碼'}
                  </button>
                )}

                {otpSent && !phoneVerified && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-md">
                    <div>
                      <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                        驗證碼
                      </label>
                      <input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="請輸入 6 位數驗證碼"
                        maxLength={6}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || otp.length !== 6}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {verifyingOtp ? '驗證中...' : '驗證'}
                      </button>
                      <button
                        onClick={() => {
                          setOtpSent(false);
                          setOtp('');
                          setError('');
                          setSuccess('');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        取消
                      </button>
                    </div>
                    <button
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className="w-full px-4 py-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      重新發送驗證碼
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
