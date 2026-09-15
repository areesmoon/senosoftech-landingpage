// src/app/admin/inquiries/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { 
  Mail, 
  Search, 
  Loader2, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Archive,
  MessageSquare,
  Building2,
  Phone,
  User,
  X,
  Send,
  MessageCircle
} from 'lucide-react';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { InquiryItem, InquiryStatus } from '@/types/cms';

export default function InquiriesAdminPage() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch data Inquiries dari Firestore
  const fetchInquiries = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const docs: InquiryItem[] = [];
      querySnapshot.forEach((docSnap) => {
        docs.push({ id: docSnap.id, ...docSnap.data() } as InquiryItem);
      });
      setInquiries(docs);
    } catch (error) {
      console.error('Gagal mengambil data inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  // Update Status Inquiry
  const updateStatus = async (id: string, newStatus: InquiryStatus) => {
    try {
      const docRef = doc(db, 'inquiries', id);
      await updateDoc(docRef, { status: newStatus });
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
    } catch (error) {
      console.error('Gagal memperbarui status inquiry:', error);
    }
  };

  // Open & Mark as Read
  const handleOpenDetail = (inquiry: InquiryItem) => {
    setSelectedInquiry(inquiry);
    if (inquiry.status === 'unread') {
      updateStatus(inquiry.id!, 'read');
    }
  };

  // Hapus Inquiry
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pesan dari "${name}"?`)) return;

    try {
      setDeletingId(id);
      await deleteDoc(doc(db, 'inquiries', id));
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      if (selectedInquiry?.id === id) {
        setSelectedInquiry(null);
      }
    } catch (error) {
      console.error('Gagal menghapus inquiry:', error);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter Data
  const filteredInquiries = inquiries.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.company && item.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: InquiryStatus) => {
    switch (status) {
      case 'unread':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Baru / Unread
          </span>
        );
      case 'read':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Dibaca
          </span>
        );
      case 'replied':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Direspon
          </span>
        );
      case 'archived':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-500 border border-slate-700 inline-flex items-center gap-1">
            <Archive className="w-3 h-3" /> Arsip
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-500" />
            Inquiries / Pesan Masuk
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola pesan, pertanyaan, dan konsultasi proyek dari pengunjung web Senosoft.
          </p>
        </div>

        {/* Counter Stats */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
            {inquiries.filter((i) => i.status === 'unread').length} Belum Dibaca
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 text-slate-400 border border-slate-800">
            Total {inquiries.length} Pesan
          </span>
        </div>
      </div>

      {/* Control Bar: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, email, perusahaan, atau isi pesan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="all">Semua Status</option>
          <option value="unread">Belum Dibaca (Unread)</option>
          <option value="read">Sudah Dibaca (Read)</option>
          <option value="replied">Sudah Direspon (Replied)</option>
          <option value="archived">Diarsipkan (Archived)</option>
        </select>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LIST PESAN (Card di Mobile & Table di Desktop) */}
        <div className={`${selectedInquiry ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {isLoading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <span className="text-xs">Memuat pesan masuk...</span>
            </div>
          ) : filteredInquiries.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl py-16 text-center text-slate-500 space-y-2">
              <Mail className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm font-semibold text-slate-400">Tidak ada pesan ditemukan.</p>
            </div>
          ) : (
            <>
              {/* 1. LAYOUT CARD DI MOBILE (< md) */}
              <div className="grid grid-cols-1 gap-3 md:hidden">
                {filteredInquiries.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleOpenDetail(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      selectedInquiry?.id === item.id
                        ? 'bg-blue-600/10 border-blue-500'
                        : item.status === 'unread'
                        ? 'bg-slate-900 border-blue-500/40 shadow-md shadow-blue-500/5'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="space-y-0.5">
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          {item.status === 'unread' && (
                            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block shrink-0 animate-pulse" />
                          )}
                          <span>{item.name}</span>
                        </div>
                        <div className="text-xs font-mono text-slate-400">{item.email}</div>
                      </div>
                      <div className="shrink-0">{getStatusBadge(item.status)}</div>
                    </div>

                    <div className="space-y-1">
                      {item.company && (
                        <div className="text-xs text-slate-300 font-medium flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{item.company}</span>
                        </div>
                      )}
                      <div className="text-xs font-semibold text-blue-400">
                        {item.serviceRequested || item.subject || 'Konsultasi General'}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed pt-1">
                        {item.message}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Klik untuk membuka detail</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id!, item.name);
                        }}
                        disabled={deletingId === item.id}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                        title="Hapus Pesan"
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. LAYOUT TABLE DI DESKTOP (>= md) */}
              <div className="hidden md:block bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-4">Pengirim</th>
                        <th className="py-3.5 px-4">Perusahaan / Subjek</th>
                        <th className="py-3.5 px-4">Ringkasan Pesan</th>
                        <th className="py-3.5 px-4 text-center">Status</th>
                        <th className="py-3.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {filteredInquiries.map((item) => (
                        <tr 
                          key={item.id} 
                          onClick={() => handleOpenDetail(item)}
                          className={`cursor-pointer transition-colors ${
                            selectedInquiry?.id === item.id 
                              ? 'bg-blue-600/10 border-l-2 border-l-blue-500' 
                              : item.status === 'unread'
                              ? 'bg-slate-800/40 font-semibold'
                              : 'hover:bg-slate-800/30'
                          }`}
                        >
                          <td className="py-4 px-4">
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {item.status === 'unread' && (
                                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                              )}
                              {item.name}
                            </div>
                            <div className="text-xs font-mono text-slate-400">{item.email}</div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="text-xs font-medium text-slate-200">{item.company || '-'}</div>
                            <div className="text-[11px] text-blue-400">{item.serviceRequested || item.subject || 'Konsultasi General'}</div>
                          </td>

                          <td className="py-4 px-4 text-xs text-slate-300 max-w-xs line-clamp-2">
                            {item.message}
                          </td>

                          <td className="py-4 px-4 text-center">
                            {getStatusBadge(item.status)}
                          </td>

                          <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleDelete(item.id!, item.name)}
                              disabled={deletingId === item.id}
                              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                              title="Hapus Pesan"
                            >
                              {deletingId === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
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

        {/* DETAIL PANEL PANEL (Sticky di Desktop & Modal Overlay di Mobile) */}
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 lg:relative lg:inset-auto flex items-center justify-center lg:block p-4 lg:p-0 bg-slate-950/80 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none lg:col-span-1">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl lg:rounded-2xl p-6 space-y-5 w-full max-w-lg lg:max-w-none max-h-[90vh] lg:max-h-none overflow-y-auto lg:overflow-visible shadow-2xl lg:shadow-none lg:sticky lg:top-6">
              
              {/* Header Panel Detail */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Detail Pesan Masuk
                </h2>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-950 border border-slate-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sender Info */}
              <div className="space-y-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2.5 text-slate-300">
                  <User className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="font-bold text-white text-sm">{selectedInquiry.name}</span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-400 font-mono">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <a href={`mailto:${selectedInquiry.email}`} className="hover:underline text-blue-400 truncate">
                    {selectedInquiry.email}
                  </a>
                </div>
                {selectedInquiry.phone && (
                  <div className="flex items-center gap-2.5 text-slate-400 font-mono">
                    <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{selectedInquiry.phone}</span>
                  </div>
                )}
                {selectedInquiry.company && (
                  <div className="flex items-center gap-2.5 text-slate-400">
                    <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{selectedInquiry.company}</span>
                  </div>
                )}
              </div>

              {/* Status Selector */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Ubah Status Penanganan:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateStatus(selectedInquiry.id!, 'read')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedInquiry.status === 'read'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Dibaca
                  </button>
                  <button
                    onClick={() => updateStatus(selectedInquiry.id!, 'replied')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedInquiry.status === 'replied'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Direspon
                  </button>
                  <button
                    onClick={() => updateStatus(selectedInquiry.id!, 'archived')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all col-span-2 ${
                      selectedInquiry.status === 'archived'
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Arsipkan
                  </button>
                </div>
              </div>

              {/* Content Box */}
              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Isi Pesan:
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedInquiry.message}
                </div>
              </div>

              {/* Quick Action Email & WhatsApp */}
              <div className="space-y-2 pt-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject || 'Konsultasi Solusi Senosoft')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Balas Email Klien</span>
                </a>

                {selectedInquiry.phone && (
                  <a
                    href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Balas Via WhatsApp</span>
                  </a>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}