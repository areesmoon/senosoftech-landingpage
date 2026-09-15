// src/app/admin/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';

export default function AdminRootRouter() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Sudah login -> Direct ke Dashboard
        router.replace('/admin/dashboard');
      } else {
        // Belum login -> Direct ke Login Page
        router.replace('/admin/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Loading indicator singkat selagi Firebase mengecek session
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
      <p className="text-xs font-mono tracking-widest uppercase">Mengarahkan...</p>
    </div>
  );
}