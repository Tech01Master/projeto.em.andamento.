'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/finmind-utils';
import { Wallet } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      router.push('/dashboard');
    } else {
      router.push('/signup');
    }
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 animate-pulse">
        <Wallet className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
        FinMind
      </h1>
      <p className="text-gray-600 mt-2">Carregando...</p>
    </div>
  );
}
