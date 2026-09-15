// src/app/admin/clients/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  Loader2, 
  Upload, 
  X, 
  Building2, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

import { db, storage } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ClientItem } from '@/types/cms';

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');

  // Upload States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch Data dari Firestore
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, 'clients'), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      const fetched: ClientItem[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as ClientItem);
      });
      setClients(fetched);
    } catch (err) {
      console.error('Gagal mengambil data klien:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const resetForm = () => {
    setName('');
    setIndustry('');
    setWebsiteUrl('');
    setOrder(clients.length + 1);
    setIsActive(true);
    setLogoUrl('');
    setUploadFile(null);
    setUploadProgress(0);
    setEditingId(null);
    setErrorMsg('');
  };

  const openNewModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (item: ClientItem) => {
    setEditingId(item.id || null);
    setName(item.name);
    setIndustry(item.industry || '');
    setWebsiteUrl(item.websiteUrl || '');
    setOrder(item.order || 1);
    setIsActive(item.isActive ?? true);
    setLogoUrl(item.logoUrl || '');
    setUploadFile(null);
    setUploadProgress(0);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  // Upload Logo ke Firebase Storage
  const handleUploadLogo = async (file: File): Promise<string> => {
    setIsUploading(true);
    return new Promise((resolve, reject) => {
      const fileName = `clients/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => {
          console.error('Upload Error:', error);
          setIsUploading(false);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setIsUploading(false);
          resolve(downloadUrl);
        }
      );
    });
  };

  // Submit Form (Add / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      let finalLogoUrl = logoUrl;

      // Jalankan upload file logo jika ada file baru yang dipilih
      if (uploadFile) {
        finalLogoUrl = await handleUploadLogo(uploadFile);
      }

      if (!finalLogoUrl) {
        setErrorMsg('Mohon unggah logo klien.');
        setIsSubmitting(false);
        return;
      }

      const clientData = {
        name,
        industry,
        websiteUrl,
        order: Number(order),
        isActive,
        logoUrl: finalLogoUrl,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        // Update Document
        const docRef = doc(db, 'clients', editingId);
        await updateDoc(docRef, clientData);
      } else {
        // Add Document Baru
        await addDoc(collection(db, 'clients'), {
          ...clientData,
          createdAt: serverTimestamp(),
        });
      }

      setIsModalOpen(false);
      resetForm();
      fetchClients();
    } catch (err) {
      console.error('Gagal menyimpan data klien:', err);
      setErrorMsg('Terjadi kesalahan saat menyimpan data klien.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (item: ClientItem) => {
    if (!item.id) return;
    try {
      const docRef = doc(db, 'clients', item.id);
      await updateDoc(docRef, { isActive: !item.isActive, updatedAt: serverTimestamp() });
      setClients((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err) {
      console.error('Gagal mengubah status aktif:', err);
    }
  };

  // Delete Document
  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus logo klien ini?')) return;
    try {
      await deleteDoc(doc(db, 'clients', id));
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Gagal menghapus klien:', err);
    }
  };

  // Filter Search
  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.industry && c.industry.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Manajemen Klien & Mitra (Our Clients)
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Kelola logo perusahaan klien & mitra yang ditampilkan di section Landing Page Utama.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Klien Baru</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama klien atau bidang industri..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
          <span className="text-sm">Memuat data klien...</span>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-3">
          <Building2 className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-semibold">Belum ada logo klien yang ditambahkan.</p>
          <button
            onClick={openNewModal}
            className="text-xs text-blue-400 hover:underline font-semibold"
          >
            + Tambah Klien Pertama Anda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className={`group bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all ${
                client.isActive 
                  ? 'border-slate-800 hover:border-blue-500/50' 
                  : 'border-slate-800/40 opacity-50 bg-slate-950'
              }`}
            >
              {/* Logo Preview Frame */}
              <div className="w-full aspect-video rounded-xl bg-slate-950 border border-slate-800/80 p-3 flex items-center justify-center overflow-hidden">
                <img
                  src={client.logoUrl}
                  alt={client.name}
                  className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </div>

              {/* Info */}
              <div className="space-y-1 text-center">
                <h3 className="text-xs font-bold text-white truncate">{client.name}</h3>
                <p className="text-[10px] text-slate-400 truncate">
                  {client.industry || 'Enterprise Client'}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500">Urutan: #{client.order}</span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(client)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title={client.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {client.isActive ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                  </button>

                  <button
                    onClick={() => openEditModal(client)}
                    className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Edit Data"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => client.id && handleDelete(client.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL FORM ADD / EDIT CLIENT (RESPONSIVE SAFE & SCROLLABLE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-500" />
                {editingId ? 'Edit Data Klien' : 'Tambah Logo Klien Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-950 border border-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto p-6 space-y-4 flex-1">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold rounded-xl">
                  {errorMsg}
                </div>
              )}

              <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Nama Perusahaan Klien <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: PT Medika Nusantara"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Industri / Bidang Usaha
                    </label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="Contoh: Healthcare & Lab"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Urutan Tampilan (Order)
                    </label>
                    <input
                      type="number"
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Website URL Klien (Opsional)
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://client-domain.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Upload Logo Area */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Logo Perusahaan <span className="text-red-400">*</span>
                  </label>

                  <div className="space-y-3">
                    {logoUrl && !uploadFile && (
                      <div className="relative w-32 h-16 rounded-xl bg-slate-950 border border-slate-800 p-2 flex items-center justify-center">
                        <img src={logoUrl} alt="Logo Prev" className="max-h-full max-w-full object-contain" />
                      </div>
                    )}

                    <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-800 hover:border-blue-500/50 bg-slate-950 cursor-pointer transition-colors">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-xs font-semibold text-slate-300 text-center">
                        {uploadFile ? uploadFile.name : 'Pilih File Logo (PNG / SVG Transparan)'}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-0.5 text-center">Format disarankan PNG/SVG latar transparan</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setUploadFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    {isUploading && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Mengunggah logo...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="pt-2 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActiveClient"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="isActiveClient" className="text-xs font-semibold text-slate-300 cursor-pointer">
                    Tampilkan di Landing Page Utama
                  </label>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 flex items-center justify-end gap-3 border-t border-slate-800 shrink-0 bg-slate-900">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-400 font-semibold text-xs rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="client-form"
                disabled={isSubmitting || isUploading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingId ? 'Simpan Perubahan' : 'Tambah Klien'}</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}