export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Easy Maid</h1>
        <p className="text-gray-600 mb-8">歡迎使用 Easy Maid</p>
        <div className="space-x-4 mb-6">
          <a
            href="/signin"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            登入
          </a>
          <a
            href="/signup"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            註冊
          </a>
        </div>
        <div className="mt-4">
          <a
            href="/test-sms"
            className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
          >
            🧪 SMS 測試頁面
          </a>
        </div>
      </div>
    </main>
  );
}
