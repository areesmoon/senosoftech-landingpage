// src/app/admin/layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  MessageSquare, 
  Building2,
  Settings, 
  Users,
  LogOut, 
  Code2,
  Menu,
  ChevronLeft,
  ShieldCheck,
  Loader2,
  Globe,
  ExternalLink
} from 'lucide-react';
import { auth, db } from '@/lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | string;
  isContact?: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Skip listener jika di halaman login
    if (pathname === '/admin/login') {
      setLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUserData(null);
        setLoadingAuth(false);
        router.replace('/admin/login');
        return;
      }

      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.name || currentUser.displayName || 'Admin',
            email: data.email || currentUser.email || '',
            role: data.role || 'admin',
            isContact: data.isContact ?? false,
          });
        } else {
          setUserData({
            name: currentUser.displayName || 'Admin',
            email: currentUser.email || '',
            role: 'admin',
            isContact: false,
          });
        }
      } catch (err) {
        console.error('Gagal fetch user data:', err);
      } finally {
        setLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (err) {
      console.error('Gagal logout:', err);
    }
  };

  // Skip layout sidebar jika sedang di halaman login
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Tampilkan loading spinner singkat saat inisialisasi session
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs font-mono">Memuat Panel Admin...</span>
      </div>
    );
  }

  const isSuperAdmin = userData?.role === 'superadmin';
  const canAccessInquiries = isSuperAdmin || userData?.isContact === true;

  // Filter Nav Items
  const NAV_ITEMS = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, allow: true },
    { label: 'Products', href: '/admin/products', icon: Package, allow: true },
    { label: 'Services', href: '/admin/services', icon: Wrench, allow: true },
    { label: 'Clients', href: '/admin/clients', icon: Building2, allow: true },
    { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare, allow: canAccessInquiries },
    { label: 'Users', href: '/admin/users', icon: Users, allow: isSuperAdmin },
    { label: 'Settings', href: '/admin/settings', icon: Settings, allow: true },
  ];

  const filteredNavItems = NAV_ITEMS.filter((item) => item.allow);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-x-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'
        }`}
      >
        <div>
          {/* Logo Branding & Toggle Hide Button */}
          <div className="flex items-center justify-between px-2 py-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-md shadow-blue-500/20">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-white text-base tracking-tight leading-none">Senosoft</h2>
                <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">CMS Control</span>
              </div>
            </div>

            {/* Tombol Tutup Sidebar */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Sembunyikan Menu"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Button */}
        <div className="border-t border-slate-800/80 pt-4 px-2 space-y-3">
          
          {/* User Profile Card */}
          {userData && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                {userData.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {userData.name}
                </div>
                <div className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 uppercase">
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{userData.role}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* OVERLAY BAGIAN BELAKANG saat sidebar terbuka di layar kecil */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-20 md:hidden"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'md:pl-64' : 'pl-0'
        }`}
      >
        {/* HEADER ATAS */}
        <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 text-xs font-semibold shadow-sm"
              >
                <Menu className="w-4 h-4 text-blue-400" />
                <span>Buka Menu</span>
              </button>
            )}
          </div>

          {/* TOMBOL PINTASAN KE LANDING PAGE */}
          <div>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center gap-2 shadow-sm"
              title="Lihat Website Publik"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Lihat Website Publik</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}