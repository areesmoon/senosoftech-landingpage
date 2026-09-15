// src/components/public/Navbar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, Menu, X, ArrowRight, Globe } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

interface PublicNavbarProps {
  lang?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export default function PublicNavbar({ 
  lang = 'id', 
  onLanguageChange 
}: PublicNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const t = translations[lang].nav;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight">SENOSOFT</span>
            <span className="block text-[10px] text-blue-400 font-mono tracking-widest uppercase">Technology Solutions</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#services" className="hover:text-blue-400 transition-colors">{t.services}</a>
          <a href="#portfolio" className="hover:text-blue-400 transition-colors">{t.portfolio}</a>
          <a href="#clients" className="hover:text-blue-400 transition-colors">{t.clients}</a>
          <a href="#contact" className="hover:text-blue-400 transition-colors">{t.contact}</a>
        </div>

        {/* Action Button & Language Switcher */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Language Switcher Button (ID / EN) */}
          {onLanguageChange && (
            <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => onLanguageChange('id')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  lang === 'id' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  lang === 'en' 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          )}

          <a
            href="#contact"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <span>{lang === 'id' ? 'Diskusi Proyek' : 'Discuss Project'}</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile Toggle Button */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Mobile Language Switcher */}
          {onLanguageChange && (
            <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => onLanguageChange('id')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-lg transition-all ${
                  lang === 'id' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                ID
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 text-[11px] font-bold rounded-lg transition-all ${
                  lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-400'
                }`}
              >
                EN
              </button>
            </div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-6 py-6 space-y-4">
          <a
            href="#services"
            onClick={() => setIsOpen(false)}
            className="block text-slate-300 hover:text-white text-sm font-medium"
          >
            {t.services}
          </a>
          <a
            href="#portfolio"
            onClick={() => setIsOpen(false)}
            className="block text-slate-300 hover:text-white text-sm font-medium"
          >
            {t.portfolio}
          </a>
          <a
            href="#clients"
            onClick={() => setIsOpen(false)}
            className="block text-slate-300 hover:text-white text-sm font-medium"
          >
            {t.clients}
          </a>
          <a
            href="#contact"
            onClick={() => setIsOpen(false)}
            className="block text-slate-300 hover:text-white text-sm font-medium"
          >
            {t.contact}
          </a>
          <a
            href="#contact"
            onClick={() => setIsOpen(false)}
            className="w-full py-3 bg-blue-600 text-white font-bold text-xs rounded-xl text-center block shadow-lg shadow-blue-600/20"
          >
            {lang === 'id' ? 'Diskusi Proyek' : 'Discuss Project'}
          </a>
        </div>
      )}
    </nav>
  );
}