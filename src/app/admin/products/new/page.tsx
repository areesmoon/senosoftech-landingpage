// src/app/admin/products/new/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Plus, 
  X, 
  Upload, 
  Star
} from 'lucide-react';

import { db, storage } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ProductCategory } from '@/types/cms';

const CATEGORIES: ProductCategory[] = [
  'IoT & Hardware',
  'Healthcare & Lab',
  'Enterprise Automation',
  'Event & Community',
];

export default function NewProductPage() {
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
  const [techStack, setTechStack] = useState<string[]>(['Next.js', 'Firebase']);

  // Multiple Image Upload States
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Status State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto Generate Slug saat Judul Diisi
  const handleTitleChange = (val: string) => {
    setTitle(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generatedSlug);
  };

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

  // Handle Select Multiple Images
  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  // Hapus Gambar dari List Preview Sebelum Submit
  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Pindahkan gambar yang dipilih ke indeks 0 (Thumbnail Utama)
  const setAsMainImage = (index: number) => {
    const selectedFile = imageFiles[index];
    const selectedPreview = imagePreviews[index];

    const filteredFiles = imageFiles.filter((_, i) => i !== index);
    const filteredPreviews = imagePreviews.filter((_, i) => i !== index);

    setImageFiles([selectedFile, ...filteredFiles]);
    setImagePreviews([selectedPreview, ...filteredPreviews]);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !slug || !tagline || !description) {
      setError('Mohon lengkapi seluruh field yang wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedUrls: string[] = [];

      // Upload Semua Gambar ke Firebase Storage secara berurutan sesuai urutan preview
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
          const uploadResult = await uploadBytes(storageRef, file);
          const downloadUrl = await getDownloadURL(uploadResult.ref);
          uploadedUrls.push(downloadUrl);
        }
      }

      // Filter item kosong dari Array
      const cleanedFeatures = features.filter((f) => f.trim() !== '');
      const cleanedTechStack = techStack.filter((t) => t.trim() !== '');

      // Simpan Dokumen ke Firestore
      await addDoc(collection(db, 'products'), {
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
        imageUrl: uploadedUrls[0] || '', // Gambar urutan #1 otomatis jadi Thumbnail Utama
        galleryUrls: uploadedUrls,        // Seluruh daftar gambar masuk galeri
        createdAt: serverTimestamp(),
      });

      router.push('/admin/products');
    } catch (err: any) {
      console.error('Gagal menyimpan produk:', err);
      setError('Terjadi kesalahan saat menyimpan data ke Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-2xl font-black text-white tracking-tight">Tambah Produk Baru</h1>
            <p className="text-xs text-slate-400">
              Daftarkan sistem atau proyek portofolio baru ke dalam katalog Senosoft.
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
                onChange={(e) => handleTitleChange(e.target.value)}
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

        {/* Section 3: Multiple Image Upload & Gallery */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-400">
              4. Galeri Screenshot Fitur Produk
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {imagePreviews.length} Gambar Dipilih
            </span>
          </div>

          {/* Upload Dropzone */}
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-2xl cursor-pointer bg-slate-950/50 transition-colors">
            <Upload className="w-8 h-8 text-blue-400 mb-2" />
            <span className="text-sm font-semibold text-slate-200">
              Klik atau Drag & Drop Beberapa Screenshot Sekaligus
            </span>
            <span className="text-xs text-slate-500 mt-1">
              Bisa pilih lebih dari 1 file (PNG, JPG, WebP). Gambar urutan #1 otomatis menjadi Thumbnail Utama.
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesSelect}
              className="hidden"
            />
          </label>

          {/* Image Previews Grid */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  className={`relative group rounded-xl overflow-hidden border ${
                    index === 0 ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-800'
                  } bg-slate-950 aspect-video`}
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Badge Thumbnail Utama atau Tombol Jadikan Utama */}
                  {index === 0 ? (
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3 fill-current" />
                      Thumbnail Utama
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAsMainImage(index)}
                      className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600/90 hover:bg-blue-600 text-white text-[10px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      Jadikan Utama
                    </button>
                  )}

                  {/* Tombol Hapus Gambar */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-slate-950/80 text-slate-400 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus gambar ini"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
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
                <span>Mengunggah {imageFiles.length} Gambar & Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Produk</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}