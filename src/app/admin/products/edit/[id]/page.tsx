// src/app/admin/products/edit/[id]/page.tsx
'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Loader2,
  Plus,
  X,
  Upload,
  ImageIcon,
  Star,
  Trash2
} from 'lucide-react';

import { db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ProductCategory, ProductItem } from '@/types/cms';

const CATEGORIES: ProductCategory[] = [
  'IoT & Hardware',
  'Healthcare & Lab',
  'Enterprise Automation',
  'Event & Community',
];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // State Form Standard
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Enterprise Automation');
  const [description, setDescription] = useState('');
  const [clientType, setClientType] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [isFeatured, setIsFeatured] = useState(true);

  // Dynamic Array States
  const [features, setFeatures] = useState<string[]>(['']);
  const [techStack, setTechStack] = useState<string[]>(['']);

  // Multiple Image States (Existing & New Uploads)
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  // Status State
  const [isLoadingDoc, setIsLoadingDoc] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch Data Produk Berdasarkan ID
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as ProductItem;
          setTitle(data.title || '');
          setSlug(data.slug || '');
          setTagline(data.tagline || '');
          setCategory(data.category || 'Enterprise Automation');
          setDescription(data.description || '');
          setClientType(data.clientType || '');
          setOrder(data.order ?? 1);
          setIsFeatured(data.isFeatured ?? true);
          setFeatures(data.features?.length ? data.features : ['']);
          setTechStack(data.techStack?.length ? data.techStack : ['Next.js']);

          // Load galeri lama atau fallback ke single imageUrl jika galeri kosong
          const gallery = data.galleryUrls && data.galleryUrls.length > 0
            ? data.galleryUrls
            : (data.imageUrl ? [data.imageUrl] : []);
          setExistingGallery(gallery);
        } else {
          setError('Produk tidak ditemukan di database Firestore.');
        }
      } catch (err) {
        console.error('Gagal mengambil detail produk:', err);
        setError('Terjadi kesalahan saat mengambil data produk.');
      } finally {
        setIsLoadingDoc(false);
      }
    };

    fetchProductData();
  }, [id]);

  // Handle Features Dynamic Array
  const addFeatureInput = () => setFeatures([...features, '']);
  const updateFeatureInput = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };
  const removeFeatureInput = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // Handle TechStack Dynamic Array
  const addTechInput = () => setTechStack([...techStack, '']);
  const updateTechInput = (index: number, val: string) => {
    const updated = [...techStack];
    updated[index] = val;
    setTechStack(updated);
  };
  const removeTechInput = (index: number) => {
    setTechStack(techStack.filter((_, i) => i !== index));
  };

  // Select Gambar Baru Tambahan
  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setNewImageFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setNewImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Hapus Gambar dari Galeri Lama
  const removeExistingImage = (index: number) => {
    setExistingGallery((prev) => prev.filter((_, i) => i !== index));
  };

  // Hapus Gambar Baru dari Antrean Upload
  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Fungsi untuk menjadikan gambar pilihan sebagai Thumbnail Utama (pindah ke indeks 0)
  const setAsMainImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      const selected = existingGallery[index];
      const filtered = existingGallery.filter((_, i) => i !== index);
      setExistingGallery([selected, ...filtered]);
    } else {
      const selectedFile = newImageFiles[index];
      const selectedPreview = newImagePreviews[index];

      const filteredFiles = newImageFiles.filter((_, i) => i !== index);
      const filteredPreviews = newImagePreviews.filter((_, i) => i !== index);

      setNewImageFiles([selectedFile, ...filteredFiles]);
      setNewImagePreviews([selectedPreview, ...filteredPreviews]);
    }
  };

  // Submit Update Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !slug || !tagline || !description) {
      setError('Mohon lengkapi seluruh field yang wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newlyUploadedUrls: string[] = [];

      // Upload semua file gambar baru ke Firebase Storage
      if (newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
          const uploadResult = await uploadBytes(storageRef, file);
          const downloadUrl = await getDownloadURL(uploadResult.ref);
          newlyUploadedUrls.push(downloadUrl);
        }
      }

      // Gabungkan galeri lama (yang tidak dihapus) + hasil upload gambar baru
      const finalGallery = [...existingGallery, ...newlyUploadedUrls];

      const cleanedFeatures = features.filter((f) => f.trim() !== '');
      const cleanedTechStack = techStack.filter((t) => t.trim() !== '');

      // Update Dokumen di Firestore
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        title,
        slug,
        tagline,
        category,
        description,
        clientType: clientType || 'Enterprise / Custom',
        order: Number(order) || 1,
        isFeatured,
        features: cleanedFeatures,
        techStack: cleanedTechStack,
        imageUrl: finalGallery[0] || '', // Gambar pertama otomatis jadi Thumbnail Utama
        galleryUrls: finalGallery,
        updatedAt: serverTimestamp(),
      });

      router.push('/admin/products');
    } catch (err: any) {
      console.error('Gagal memperbarui produk:', err);
      setError('Terjadi kesalahan saat memperbarui data di Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDoc) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
        <span className="text-sm font-medium">Memuat data detail produk...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Edit Produk</h1>
            <p className="text-xs text-slate-400">
              Perbarui detail, spesifikasi fitur, atau gambar produk <span className="text-blue-400 font-mono">({title})</span>.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-xl">
          {error}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Informasi Dasar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">
            1. Informasi Dasar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Nama Produk / Sistem <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: FlexiLIS / VotePoint"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                URL Slug <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="flexilis-laboratory-system"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Tagline Singkat <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="High-Performance Laboratory Information Management System"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Kategori Produk
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Target / Tipe Klien
              </label>
              <input
                type="text"
                value={clientType}
                onChange={(e) => setClientType(e.target.value)}
                placeholder="Rumah Sakit & Klinik Utama"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Urutan Tampil (Order)
              </label>
              <input
                type="number"
                min={1}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Deskripsi Lengkap <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan mengenai kemampuan sistem, penyelesaian masalah bisnis, atau integrasi hardware-nya..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 text-sm resize-none"
            />
          </div>
        </div>

        {/* Section 2: Features & Tech Stack */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          {/* Dynamic Features List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                2. Fitur-Fitur Utama (Key Features)
              </h2>
              <button
                type="button"
                onClick={addFeatureInput}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Fitur</span>
              </button>
            </div>

            <div className="space-y-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => updateFeatureInput(idx, e.target.value)}
                    placeholder={`Fitur #${idx + 1}`}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeatureInput(idx)}
                      className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Tech Stack */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                3. Tech Stack / Teknologi Digunakan
              </h2>
              <button
                type="button"
                onClick={addTechInput}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tech</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, idx) => (
                <div key={idx} className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                  <input
                    type="text"
                    value={tech}
                    onChange={(e) => updateTechInput(idx, e.target.value)}
                    placeholder="Next.js"
                    className="w-24 bg-transparent text-xs text-blue-400 font-mono focus:outline-none"
                  />
                  {techStack.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTechInput(idx)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Multiple Image Upload & Gallery Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">
              4. Kelola Galeri Screenshot Produk
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              Total {existingGallery.length + newImagePreviews.length} Gambar
            </span>
          </div>

          {/* Upload Dropzone */}
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl cursor-pointer bg-slate-950/50 transition-colors">
            <Upload className="w-8 h-8 text-blue-400 mb-2" />
            <span className="text-sm font-semibold text-slate-200">
              Tambah Screenshot Baru ke Galeri
            </span>
            <span className="text-xs text-slate-500 mt-1">
              Bisa upload multiple gambar (PNG, JPG, WebP). Gambar urutan #1 otomatis menjadi Thumbnail Utama.
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesSelect}
              className="hidden"
            />
          </label>

          {/* Grid Preview Galeri Tergabung */}
          {(existingGallery.length > 0 || newImagePreviews.length > 0) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
              {/* Gambar yang Sudah Ada di Firestore */}
              {existingGallery.map((url, index) => (
                <div
                  key={`exist-${index}`}
                  className={`relative group rounded-xl overflow-hidden border ${
                    index === 0 ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-800'
                  } bg-slate-950 aspect-video`}
                >
                  <img
                    src={url}
                    alt={`Existing Screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Badge Thumbnail Utama */}
                  {index === 0 ? (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-current" />
                      Thumbnail Utama
                    </span>
                  ) : (
                    /* Tombol Set Utama (Muncul saat Hover di Gambar Selain Urutan 1) */
                    <button
                      type="button"
                      onClick={() => setAsMainImage(index, true)}
                      className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600/90 hover:bg-blue-600 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      Jadikan Utama
                    </button>
                  )}

                  {/* Tombol Hapus Gambar */}
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-slate-950/80 text-slate-400 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus gambar ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Gambar Baru yang Siap Di-upload */}
              {newImagePreviews.map((preview, index) => {
                const globalIndex = existingGallery.length + index;
                return (
                  <div
                    key={`new-${index}`}
                    className={`relative group rounded-xl overflow-hidden border ${
                      globalIndex === 0 ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-emerald-500/50'
                    } bg-slate-950 aspect-video`}
                  >
                    <img
                      src={preview}
                      alt={`New Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {globalIndex === 0 ? (
                      <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                        ★ Thumbnail Utama (Baru)
                      </span>
                    ) : (
                      <>
                        <span className="absolute top-2 left-2 bg-emerald-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Baru
                        </span>
                        {/* Tombol Set Utama untuk Gambar Baru */}
                        <button
                          type="button"
                          onClick={() => setAsMainImage(index, false)}
                          className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600/90 hover:bg-blue-600 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          Jadikan Utama
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-slate-950/80 text-slate-400 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Batalkan gambar ini"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/80">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
              />
              <span className="text-sm font-medium text-slate-300">
                Tampilkan langsung di Landing Page Publik (Featured Product)
              </span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-sm font-semibold transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Perubahan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}