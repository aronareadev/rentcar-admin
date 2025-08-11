'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 루트 페이지 접근 시 자동으로 어드민 대시보드로 리다이렉션
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">관리자 페이지로 이동중...</p>
      </div>
    </div>
  );
}