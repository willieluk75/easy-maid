'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AdminGuard from '@/components/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/signin');
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-[#f7f7f7]">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-[#dddddd]">
          <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
            <Link href="/admin/workers" className="text-lg font-bold text-[#222222] hover:text-[#ff385c]">
              Easy Maid Admin
            </Link>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-1">
                <Link
                  href="/admin/workers"
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/admin/workers' || pathname.startsWith('/admin/workers/')
                      ? 'bg-[#222222] text-white'
                      : 'text-[#6a6a6a] hover:bg-[#f7f7f7]'
                  }`}
                >
                  工人列表
                </Link>
              </nav>
              <button
                onClick={handleLogout}
                className="text-sm text-[#6a6a6a] hover:text-[#222222] font-medium transition-colors"
              >
                登出
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-5xl mx-auto p-6">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
