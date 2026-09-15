// src/app/admin/services/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Loader2, 
  Wrench,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { ServiceItem } from '@/types/cms';

export default function ServicesAdminPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch data services dari Firestore
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, 'services'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const docs: ServiceItem[] = [];
      querySnapshot.forEach((docSnap) => {
        docs.push({ id: docSnap.id, ...docSnap.data() } as ServiceItem);
      });
      setServices(docs);
    } catch (error) {
      console.error('Gagal mengambil data services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Toggle status aktif service
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const docRef = doc(db, 'services', id);
      await updateDoc(docRef, { isActive: !currentStatus });
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s))
      );
    } catch (error) {
      console.error('Gagal mengubah status service:', error);
    }
  };

  // Hapus service
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus layanan "${title}"?`)) return;

    try {
      setDeletingId(id);
      await deleteDoc(doc(db, 'services', id));
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Gagal menghapus service:', error);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter berdasarkan pencarian
  const filteredServices = services.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-500" />
            Manajemen Layanan (Services)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola bidang keahlian dan penawaran solusi software/hardware Senosoft.
          </p>
        </div>

        <Link
          href="/admin/services/new"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all inline-flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Layanan Baru</span>
        </Link>
      </div>

      {/* Control Bar: Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama layanan atau deskripsi..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <span className="text-xs">Memuat daftar layanan...</span>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl py-16 text-center text-slate-500 space-y-2">
          <Wrench className="w-10 h-10 mx-auto opacity-30" />
          <p className="text-sm font-semibold text-slate-400">Belum ada layanan terdaftar.</p>
          <p className="text-xs">Klik tombol "Tambah Layanan Baru" untuk menambahkan.</p>
        </div>
      ) : (
        <>
          {/* 1. LAYOUT CARD UNTUK LAYAR KECIL (MOBILE / HP) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md"
              >
                {/* Header Card: Order & Status */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Urutan #{service.order}
                  </span>
                  <button
                    onClick={() => toggleStatus(service.id!, service.isActive)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                      service.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {service.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    <span>{service.isActive ? 'Aktif' : 'Nonaktif'}</span>
                  </button>
                </div>

                {/* Body Card: Title & Slug & Description */}
                <div className="space-y-1">
                  <div className="font-bold text-white text-base">{service.title}</div>
                  <div className="text-xs font-mono text-slate-500">/{service.slug}</div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed pt-1">
                    {service.shortDescription}
                  </p>
                </div>

                {/* Features Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {service.features?.slice(0, 3).map((feat, i) => (
                    <span key={i} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                      {feat}
                    </span>
                  ))}
                  {service.features?.length > 3 && (
                    <span className="text-[10px] text-blue-400 font-bold px-1 py-0.5">
                      +{service.features.length - 3} lagi
                    </span>
                  )}
                </div>

                {/* Card Footer: Action Buttons */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/services/edit/${service.id}`}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                    title="Edit Service"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(service.id!, service.title)}
                    disabled={deletingId === service.id}
                    className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    title="Hapus Service"
                  >
                    {deletingId === service.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 2. LAYOUT TABLE UNTUK LAYAR LEBAR (DESKTOP) */}
          <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">Urutan</th>
                    <th className="py-3.5 px-4">Layanan</th>
                    <th className="py-3.5 px-4">Deskripsi Singkat</th>
                    <th className="py-3.5 px-4">Cakupan Fitur</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredServices.map((service) => (
                    <tr key={service.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-4 text-center font-mono text-slate-400 font-bold">
                        #{service.order}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{service.title}</div>
                        <div className="text-xs font-mono text-slate-500">/{service.slug}</div>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-300 max-w-xs line-clamp-2">
                        {service.shortDescription}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {service.features?.slice(0, 3).map((feat, i) => (
                            <span key={i} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md">
                              {feat}
                            </span>
                          ))}
                          {service.features?.length > 3 && (
                            <span className="text-[10px] text-blue-400 font-bold px-1 py-0.5">
                              +{service.features.length - 3} lagi
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => toggleStatus(service.id!, service.isActive)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            service.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {service.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          <span>{service.isActive ? 'Aktif' : 'Nonaktif'}</span>
                        </button>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/services/edit/${service.id}`}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                            title="Edit Service"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(service.id!, service.title)}
                            disabled={deletingId === service.id}
                            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                            title="Hapus Service"
                          >
                            {deletingId === service.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}