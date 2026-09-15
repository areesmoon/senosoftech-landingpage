// src/app/admin/products/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Loader2, 
  ExternalLink 
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { ProductItem } from '@/types/cms';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch daftar produk dari Firestore
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const items: ProductItem[] = [];
      querySnapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as ProductItem);
      });
      setProducts(items);
    } catch (err) {
      console.error('Gagal mengambil data produk:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Toggle visibilitas produk di landing page publik
  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, { isFeatured: !currentStatus });
      setProducts((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isFeatured: !currentStatus } : item
        )
      );
    } catch (err) {
      console.error('Gagal mengubah visibilitas:', err);
    }
  };

  // Hapus Produk
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${title}"?`)) return;

    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Gagal menghapus produk:', err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Manajemen Produk & Portofolio</h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola katalog software enterprise, sistem IoT, dan produk unggulan Senosoft.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </Link>
      </div>

      {/* Content Table / List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <span className="text-sm">Memuat data produk...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto mb-3">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Belum ada produk terdaftar</h3>
          <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
            Mulai tambahkan sistem seperti FlexiLIS, VotePoint, atau modul hardware integration pertama Anda.
          </p>
          <Link
            href="/admin/products/new"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Pertama</span>
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Urutan</th>
                  <th className="py-3.5 px-4">Produk</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Tech Stack</th>
                  <th className="py-3.5 px-4 text-center">Tampil di Home</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-mono text-slate-500 text-xs">
                      #{item.order ?? 0}
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-bold text-white text-base flex items-center gap-2">
                          <span>{item.title}</span>
                          <span className="text-xs text-slate-500 font-mono font-normal">({item.slug})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-w-md">
                          {item.tagline}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.techStack?.slice(0, 3).map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                        {item.techStack?.length > 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            +{item.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleVisibility(item.id!, item.isFeatured)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          item.isFeatured
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {item.isFeatured ? (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/edit/${item.id}`}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                          title="Edit Produk"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id!, item.title)}
                          disabled={deletingId === item.id}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus Produk"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
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
      )}
    </div>
  );
}