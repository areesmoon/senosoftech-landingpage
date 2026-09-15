// src/components/public/Footer.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Github, 
  Linkedin, 
  Instagram,
  ArrowUp,
  MessageCircle
} from 'lucide-react';

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { CompanySettings } from '@/types/cms';

export default function PublicFooter() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'company');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data() as CompanySettings);
        }
      } catch (error) {
        console.error('Gagal mengambil data settings footer:', error);
      }
    };

    fetchSettings();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/30">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-black text-white tracking-tight">
                  {settings?.companyName || 'SENOSOFT'}
                </span>
                <span className="block text-[10px] text-blue-400 font-mono tracking-widest uppercase">
                  Technology Solutions
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed">
              {settings?.description || 
                'Penyedia solusi pengembang software kustom, otomatisasi enterprise, sistem laboratorium, hingga integrasi jaringan dan perangkat IoT.'}
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              {settings?.githubUrl && (
                <a
                  href={settings.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/50 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {settings?.linkedinUrl && (
                <a
                  href={settings.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/50 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-blue-500/50 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Navigasi Cepat */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigasi Halaman
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#services" className="hover:text-blue-400 transition-colors">
                  Layanan & Kapabilitas
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-blue-400 transition-colors">
                  Katalog Portofolio Produk
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-blue-400 transition-colors">
                  Profil & Pengalaman
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-blue-400 transition-colors">
                  Konsultasi & Kontak Proyek
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Layanan Spesialisasi */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Spesialisasi Solusi
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>Enterprise Systems & Automation</li>
              <li>Healthcare & Laboratory Interfacing</li>
              <li>Network Swap & Hardware Deployment</li>
              <li>IoT, Surveillance & Smart Kiosk</li>
            </ul>
          </div>

          {/* Col 4: Informasi Kontak & Alamat */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Hubungi Kami
            </h3>
            <div className="space-y-3 text-xs">
              {settings?.address && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    {settings.address}, {settings.city} {settings.postalCode}
                  </span>
                </div>
              )}

              {settings?.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:underline text-blue-400 font-mono">
                    {settings.email}
                  </a>
                </div>
              )}

              {settings?.whatsapp && (
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-emerald-400 font-mono"
                  >
                    {settings.whatsapp}
                  </a>
                </div>
              )}

              {settings?.workingHours && (
                <div className="flex items-start gap-2.5 text-slate-400">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{settings.workingHours}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar Footer */}
        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {settings?.companyName || 'Senosoft'}. All rights reserved.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <span>Kembali ke Atas</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}