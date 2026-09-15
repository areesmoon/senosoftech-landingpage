// src/app/admin/dashboard/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Wrench, MessageSquare, Building2, Plus, ArrowUpRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    productsCount: 0,
    servicesCount: 0,
    inquiriesCount: 0,
    clientsCount: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [prodSnap, servSnap, inqSnap, cliSnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'services')),
          getDocs(collection(db, 'inquiries')),
          getDocs(collection(db, 'clients')),
        ]);
        setStats({
          productsCount: prodSnap.size,
          servicesCount: servSnap.size,
          inquiriesCount: inqSnap.size,
          clientsCount: cliSnap.size,
        });
      } catch (err) {
        console.error('Gagal mengambil statistik dashboard:', err);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">System Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Selamat datang di CMS Control Panel internal Senosoft.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/clients"
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Kelola Klien</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Package className="w-6 h-6" />
            </div>
            <Link href="/admin/products" className="text-slate-500 hover:text-slate-300">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Products / Proyek</span>
          <h2 className="text-3xl font-black text-white mt-1">{stats.productsCount} Item</h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Wrench className="w-6 h-6" />
            </div>
            <Link href="/admin/services" className="text-slate-500 hover:text-slate-300">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Layanan Solusi IT</span>
          <h2 className="text-3xl font-black text-white mt-1">{stats.servicesCount} Layanan</h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <MessageSquare className="w-6 h-6" />
            </div>
            <Link href="/admin/inquiries" className="text-slate-500 hover:text-slate-300">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Lead Form / Inquiries</span>
          <h2 className="text-3xl font-black text-white mt-1">{stats.inquiriesCount} Pesan</h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Building2 className="w-6 h-6" />
            </div>
            <Link href="/admin/clients" className="text-slate-500 hover:text-slate-300">
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Klien & Mitra</span>
          <h2 className="text-3xl font-black text-white mt-1">{stats.clientsCount} Mitra</h2>
        </div>
      </div>
    </div>
  );
}