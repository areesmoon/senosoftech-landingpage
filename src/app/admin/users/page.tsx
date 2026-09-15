// src/app/admin/users/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Shield, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Save, 
  UserCheck,
  Search
} from 'lucide-react';

// Firebase Firestore
import { db } from '@/lib/firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

interface UserItem {
  id: string; // Document ID (UID)
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | string;
  whatsapp: string;
  isContact: boolean;
  createdAt?: any;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State per-row update & status feedback
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch data koleksi 'users'
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const userList: UserItem[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        userList.push({
          id: docSnap.id,
          name: data.name || 'Tanpa Nama',
          email: data.email || '',
          role: data.role || 'admin',
          whatsapp: data.whatsapp || '',
          isContact: data.isContact ?? false,
          createdAt: data.createdAt,
        });
      });

      setUsers(userList);
    } catch (err) {
      console.error('Gagal mengambil data users:', err);
      // Fallback jika belum ada index createdAt
      try {
        const snap = await getDocs(collection(db, 'users'));
        const userList: UserItem[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          userList.push({
            id: docSnap.id,
            name: data.name || 'Tanpa Nama',
            email: data.email || '',
            role: data.role || 'admin',
            whatsapp: data.whatsapp || '',
            isContact: data.isContact ?? false,
            createdAt: data.createdAt,
          });
        });
        setUsers(userList);
      } catch (fallbackErr) {
        console.error('Gagal fallback fetch users:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Update Field lokal di State
  const handleInputChange = (id: string, field: keyof UserItem, value: any) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
    );
  };

  // Simpan Perubahan ke Firestore
  const handleSaveUser = async (user: UserItem) => {
    setUpdatingId(user.id);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        role: user.role,
        whatsapp: user.whatsapp,
        isContact: user.isContact,
      });

      setSuccessMsg(`Data user "${user.name}" berhasil diperbarui.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('Gagal update user:', err);
      setErrorMsg(`Gagal memperbarui data user: ${err.message}`);
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter Search
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.whatsapp.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* HEADER PAGE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">Users Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Kelola hak akses role admin dan flag nomor WhatsApp penerima inquiry.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Cari nama, email, WA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* ALERT NOTIFICATION */}
      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-semibold">
          <XCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TABLE USERS LIST */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-xs font-mono">Memuat Data Pengguna...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-medium">
            Tidak ada pengguna terdaftar yang ditemukan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-mono">
                <tr>
                  <th className="px-6 py-4">User Info</th>
                  <th className="px-6 py-4">Role Hak Akses</th>
                  <th className="px-6 py-4">Nomor WhatsApp</th>
                  <th className="px-6 py-4 text-center">Inquiry Contact</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredUsers.map((user) => {
                  const isSaving = updatingId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-xs font-bold text-white truncate">{user.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Selector */}
                      <td className="px-6 py-4">
                        <div className="relative w-36">
                          <select
                            value={user.role}
                            onChange={(e) => handleInputChange(user.id, 'role', e.target.value)}
                            className="w-full py-1.5 pl-8 pr-3 bg-slate-950 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                          </select>
                          <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                            {user.role === 'superadmin' ? (
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Shield className="w-3.5 h-3.5 text-blue-400" />
                            )}
                          </div>
                        </div>
                      </td>

                      {/* WhatsApp Input */}
                      <td className="px-6 py-4">
                        <div className="relative w-44">
                          <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            placeholder="628xxxxxxxxxx"
                            value={user.whatsapp}
                            onChange={(e) => handleInputChange(user.id, 'whatsapp', e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </td>

                      {/* Contact Flag Toggle */}
                      <td className="px-6 py-4 text-center">
                        <label className="inline-flex items-center cursor-pointer gap-2">
                          <input
                            type="checkbox"
                            checked={user.isContact}
                            onChange={(e) => handleInputChange(user.id, 'isContact', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                          <span className="text-[11px] font-mono text-slate-400">
                            {user.isContact ? (
                              <span className="text-emerald-400 font-semibold">Aktif</span>
                            ) : (
                              <span className="text-slate-500">Nonaktif</span>
                            )}
                          </span>
                        </label>
                      </td>

                      {/* Action Button */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleSaveUser(user)}
                          disabled={isSaving}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 shadow-sm"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Proses...</span>
                            </>
                          ) : (
                            <>
                              <Save className="w-3.5 h-3.5" />
                              <span>Simpan</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}