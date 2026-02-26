import Link from 'next/link';

export default function WorkerSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-4 max-w-sm">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">申請已提交！</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          感謝你提交申請。<br />
          Easy Maid 職員將盡快審核你的資料，<br />
          審核通過後你的資料將會公開顯示。
        </p>
        <Link href="/"
          className="inline-block mt-4 px-8 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-base">
          返回主頁
        </Link>
      </div>
    </div>
  );
}
