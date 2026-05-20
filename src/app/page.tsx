'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.replace('/feed');
      else router.replace('/signin');
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
      <p className="text-[#929292]">載入中...</p>
    </div>
  );
}
