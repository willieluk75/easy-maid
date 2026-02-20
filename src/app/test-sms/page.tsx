'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSMS() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    success: boolean;
    data?: unknown;
    error?: { message: string; status?: number; stack?: string };
    timestamp: string;
  } | null>(null);

  const testSendSMS = async () => {
    setLoading(true);
    setResponse(null);

    console.log('===== 開始測試 SMS 發送 =====');
    console.log('手機號碼:', phone);
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('時間:', new Date().toISOString());

    try {
      const result = await supabase.auth.signInWithOtp({
        phone: phone,
      });

      console.log('===== API 完整回應 =====');
      console.log('Data:', result.data);
      console.log('Error:', result.error);

      setResponse({
        success: !result.error,
        data: result.data,
        error: result.error ? {
          message: result.error.message,
          status: result.error.status,
        } : undefined,
        timestamp: new Date().toISOString(),
      });

      setLoading(false);
    } catch (err) {
      console.error('===== 發生例外錯誤 =====');
      console.error(err);
      
      const errorMessage = err instanceof Error ? err.message : String(err);
      const errorStack = err instanceof Error ? err.stack : undefined;
      
      setResponse({
        success: false,
        error: {
          message: errorMessage,
          stack: errorStack,
        },
        timestamp: new Date().toISOString(),
      });

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">SMS 發送測試</h1>
        <p className="text-gray-600 mb-6">極簡測試頁面 - 用於排查 Supabase Phone Auth 問題</p>

        <div className="space-y-6">
          {/* 環境檢查 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">環境檢查</h2>
            <div className="text-sm space-y-1">
              <div className="flex">
                <span className="font-medium w-32">Supabase URL:</span>
                <span className="text-gray-700 break-all">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ 未設定'}
                </span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Anon Key:</span>
                <span className="text-gray-700">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
                    ? `✅ ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` 
                    : '❌ 未設定'}
                </span>
              </div>
            </div>
          </div>

          {/* 手機號碼輸入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              手機號碼（國際格式）
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+852XXXXXXXX 或 +886XXXXXXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
            <p className="mt-2 text-sm text-gray-500">
              範例：香港 +85298765432 | 台灣 +886912345678
            </p>
          </div>

          {/* 發送按鈕 */}
          <button
            onClick={testSendSMS}
            disabled={loading || !phone}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {loading ? '發送中...' : '發送測試 SMS'}
          </button>

          {/* 回應顯示 */}
          {response && (
            <div className={`rounded-lg p-6 ${response.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center mb-4">
                <div className={`text-2xl mr-3 ${response.success ? 'text-green-600' : 'text-red-600'}`}>
                  {response.success ? '✅' : '❌'}
                </div>
                <h2 className={`text-xl font-bold ${response.success ? 'text-green-900' : 'text-red-900'}`}>
                  {response.success ? 'API 呼叫成功' : 'API 呼叫失敗'}
                </h2>
              </div>

              {response.success && (
                <div className="mb-4 p-4 bg-white rounded border border-green-300">
                  <p className="text-green-800 font-semibold mb-2">
                    ✅ Supabase 已接受請求並嘗試發送 SMS
                  </p>
                  <p className="text-sm text-gray-700">
                    請檢查手機是否收到驗證碼。如果沒收到，問題可能在於：
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                    <li>Twilio Phone Number 未填寫</li>
                    <li>Twilio 憑證填寫錯誤</li>
                    <li>試用帳號：號碼未在 Twilio 驗證</li>
                    <li>Twilio 地區限制未開啟</li>
                    <li>手機號碼格式錯誤</li>
                  </ul>
                </div>
              )}

              {response.error && (
                <div className="mb-4 p-4 bg-white rounded border border-red-300">
                  <p className="text-red-800 font-semibold mb-2">錯誤訊息：</p>
                  <p className="text-sm text-red-700 font-mono">
                    {response.error.message || JSON.stringify(response.error)}
                  </p>
                  {response.error.status && (
                    <p className="text-sm text-red-600 mt-2">
                      狀態碼：{response.error.status}
                    </p>
                  )}
                </div>
              )}

              {/* 完整回應 JSON */}
              <details className="mt-4">
                <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                  查看完整 API 回應（JSON）
                </summary>
                <pre className="mt-3 p-4 bg-gray-800 text-green-400 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </details>

              <p className="text-xs text-gray-500 mt-4">
                時間戳記：{response.timestamp}
              </p>
            </div>
          )}

          {/* 說明區 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">📋 測試說明</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>確認上方「環境檢查」顯示 Supabase URL 和 Key</li>
              <li>輸入手機號碼（必須含國碼，例如 +852 或 +886）</li>
              <li>點擊「發送測試 SMS」</li>
              <li>打開瀏覽器 Console（按 F12）查看詳細日誌</li>
              <li>查看下方回應結果</li>
            </ol>
          </div>

          {/* 快速診斷 */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-900 mb-2">🔍 如果 API 成功但收不到 SMS</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p className="font-semibold">需要檢查 Supabase Dashboard 設定：</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Authentication → Providers → Phone（已啟用）</li>
                <li>Twilio Account SID（已填寫且正確）</li>
                <li>Twilio Auth Token（已填寫且正確）</li>
                <li><strong className="text-red-600">Twilio Phone Number（必填！）</strong></li>
              </ol>
              <p className="mt-3 p-2 bg-white rounded border border-purple-300">
                <strong>Twilio Phone Number 範例：</strong>
                <code className="ml-2 text-purple-700">+15017122661</code>
              </p>
            </div>
          </div>
        </div>

        {/* 返回連結 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <a
            href="/profile"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← 返回個人檔案頁
          </a>
        </div>
      </div>
    </div>
  );
}
