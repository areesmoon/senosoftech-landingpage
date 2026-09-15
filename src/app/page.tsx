// src/app/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Send, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Cpu,
  Server,
  Code,
  Activity,
  ShieldCheck,
  Sparkles,
  Zap,
  LayoutGrid,
  Maximize2,
  Terminal,
  Radio,
  Building2,
  ExternalLink
} from 'lucide-react';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, query, orderBy } from 'firebase/firestore';
import { ProductItem, ServiceItem, CompanySettings, ClientItem } from '@/types/cms';
import PublicNavbar from '@/components/public/Navbar';
import PublicFooter from '@/components/public/Footer';

// Dynamic Icon Helper
const renderIcon = (iconName: string) => {
  switch (iconName?.toLowerCase()) {
    case 'server':
      return <Server className="w-6 h-6 text-blue-400" />;
    case 'code':
      return <Code className="w-6 h-6 text-red-400" />;
    case 'activity':
      return <Activity className="w-6 h-6 text-emerald-400" />;
    case 'shield':
      return <ShieldCheck className="w-6 h-6 text-indigo-400" />;
    default:
      return <Cpu className="w-6 h-6 text-blue-400" />;
  }
};

export default function PublicLandingPage() {
  // Multilingual State (Supported: 'id' | 'en')
  const [lang, setLang] = useState<'id' | 'en'>('id');

  useEffect(() => {
    const savedLang = localStorage.getItem('senosoft_lang') as 'id' | 'en';
    if (savedLang === 'id' || savedLang === 'en') {
      setLang(savedLang);
    }
  }, []);

  const handleLanguageChange = (newLang: 'id' | 'en') => {
    setLang(newLang);
    localStorage.setItem('senosoft_lang', newLang);
  };

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Modal Interactive Product Gallery State
  const [activeModalProduct, setActiveModalProduct] = useState<ProductItem | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Form Inquiry State
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryCompany, setInquiryCompany] = useState('');
  const [inquiryService, setInquiryService] = useState('Consultation');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  // Fetch Public Data
  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setIsLoading(true);

        // 1. Fetch Company Settings
        const settingsSnap = await getDoc(doc(db, 'settings', 'company'));
        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as CompanySettings);
        }

        // 2. Fetch Services
        const servicesQuery = query(collection(db, 'services'), orderBy('order', 'asc'));
        const servicesSnap = await getDocs(servicesQuery);
        const fetchedServices: ServiceItem[] = [];
        servicesSnap.forEach((docSnap) => {
          const data = docSnap.data() as ServiceItem;
          if (data.isActive ?? true) {
            fetchedServices.push({ id: docSnap.id, ...data });
          }
        });
        setServices(fetchedServices);

        // 3. Fetch Products
        const productsQuery = query(collection(db, 'products'), orderBy('order', 'asc'));
        const productsSnap = await getDocs(productsQuery);
        const fetchedProducts: ProductItem[] = [];
        productsSnap.forEach((docSnap) => {
          const data = docSnap.data() as ProductItem;
          if (data.isFeatured !== false) {
            fetchedProducts.push({ id: docSnap.id, ...data });
          }
        });
        setProducts(fetchedProducts);

        // 4. Fetch Clients
        const clientsQuery = query(collection(db, 'clients'), orderBy('order', 'asc'));
        const clientsSnap = await getDocs(clientsQuery);
        const fetchedClients: ClientItem[] = [];
        clientsSnap.forEach((docSnap) => {
          const data = docSnap.data() as ClientItem;
          if (data.isActive ?? true) {
            fetchedClients.push({ id: docSnap.id, ...data });
          }
        });
        setClients(fetchedClients);

      } catch (err) {
        console.error('Gagal memuat data landing page:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  // Modal Gallery Slider Handlers
  const openProductModal = (product: ProductItem) => {
    setActiveModalProduct(product);
    setCurrentSlideIndex(0);
  };

  const closeModal = () => {
    setActiveModalProduct(null);
    setCurrentSlideIndex(0);
  };

  const nextSlide = () => {
    if (!activeModalProduct) return;
    const gallery = activeModalProduct.galleryUrls?.length 
      ? activeModalProduct.galleryUrls 
      : [activeModalProduct.imageUrl || ''];
    setCurrentSlideIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevSlide = () => {
    if (!activeModalProduct) return;
    const gallery = activeModalProduct.galleryUrls?.length 
      ? activeModalProduct.galleryUrls 
      : [activeModalProduct.imageUrl || ''];
    setCurrentSlideIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  // Submit Inquiry Handler via API Route (/api/inquiry)
  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInquiryError('');
    setInquirySuccess(false);

    if (!inquiryName || !inquiryEmail || !inquiryMessage) {
      setInquiryError(
        lang === 'id' 
          ? 'Mohon lengkapi Nama, Email, dan Isi Pesan Anda.' 
          : 'Please complete your Name, Email, and Message.'
      );
      return;
    }

    setIsSubmittingInquiry(true);

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: inquiryName,
          email: inquiryEmail,
          phone: inquiryPhone || '',
          company: inquiryCompany || '',
          serviceRequested: inquiryService,
          message: inquiryMessage,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Gagal mengirimkan pesan.');
      }

      setInquirySuccess(true);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryPhone('');
      setInquiryCompany('');
      setInquiryMessage('');
    } catch (err: any) {
      console.error('Gagal mengirim pesan:', err);
      setInquiryError(
        err.message || (
          lang === 'id' 
            ? 'Terjadi kesalahan saat mengirim pesan.' 
            : 'An error occurred while sending your message.'
        )
      );
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-600 selection:text-white font-sans antialiased overflow-x-hidden">
      <PublicNavbar lang={lang} onLanguageChange={handleLanguageChange} />

      {/* 1. HERO SECTION (Deep Space Dark & Dual Glow Accent) */}
      <section className="relative pt-36 pb-24 md:pt-48 md:pb-36 bg-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[radial-[#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-30 pointer-events-none" />
        <div className="absolute top-24 left-1/3 -translate-x-1/2 w-[500px] h-[350px] bg-blue-600/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-36 right-1/3 translate-x-1/2 w-[450px] h-[320px] bg-red-600/15 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest shadow-xl shadow-blue-500/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>
              {settings?.tagline || (
                lang === 'id' 
                  ? 'Solusi Software Enterprise & Infrastruktur IoT' 
                  : 'Enterprise Software & IoT Infrastructure Solutions'
              )}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            {lang === 'id' 
              ? 'Membangun System Software & Infrastructure Masa Depan' 
              : 'Building Next-Generation System Software & Infrastructure'}
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            {settings?.description || (
              lang === 'id' 
                ? 'Senosoft merancang platform kustom berskala enterprise, interfacing sistem laboratorium medis, hingga deployment & swap perangkat jaringan retail berskala nasional.'
                : 'Senosoft engineers custom enterprise-grade platforms, medical lab system interfacing, and nationwide retail network deployment & device swapping.'
            )}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#portfolio"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-sm rounded-xl shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2 group border border-blue-400/20"
            >
              <span>{lang === 'id' ? 'Lihat Portofolio Produk' : 'View Product Portfolio'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#contact"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 border border-slate-800 hover:border-red-500/40 hover:bg-slate-900 text-slate-300 font-bold text-sm rounded-xl transition-all text-center backdrop-blur-md"
            >
              {lang === 'id' ? 'Konsultasi Proyek' : 'Project Consultation'}
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto border-t border-slate-900">
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <div className="text-2xl font-black text-blue-400 font-mono">100%</div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                {lang === 'id' ? 'Arsitektur Kustom' : 'Custom Architecture'}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-red-500/20 hover:border-red-500/40 transition-colors">
              <div className="text-2xl font-black text-red-400 font-mono">Zero-Downtime</div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                {lang === 'id' ? 'Swap Jaringan & Infra' : 'Network Swap & Infra'}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-blue-500/20 hover:border-blue-500/40 transition-colors">
              <div className="text-2xl font-black text-cyan-400 font-mono">Real-time</div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                {lang === 'id' ? 'IoT & Lab Interfacing' : 'IoT & Lab Interfacing'}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/40 border border-red-500/20 hover:border-red-500/40 transition-colors">
              <div className="text-2xl font-black text-rose-400 font-mono">Enterprise</div>
              <div className="text-[11px] text-slate-400 font-medium mt-1">
                {lang === 'id' ? 'Standar Keamanan' : 'Security Standard'}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SERVICES SECTION (Elevated Slate Dark Layer - Slate 900/70) */}
      <section id="services" className="py-24 bg-slate-900/70 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-6 space-y-16 relative z-10">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center justify-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-red-500" /> 
              {lang === 'id' ? 'Kapabilitas Teknis' : 'Technical Capabilities'}
            </h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight">
              {lang === 'id' ? 'Layanan Spesialisasi Senosoft' : 'Senosoft Specialized Services'}
            </h3>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              {lang === 'id' 
                ? 'Penawaran solusi yang teruji untuk akselerasi operasional bisnis dan infrastruktur TI Anda.'
                : 'Proven solution offerings to accelerate your business operations and IT infrastructure.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="group relative bg-slate-950/70 border border-slate-800/90 hover:border-blue-500/50 rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-red-500/40 group-hover:scale-105 transition-all shadow-lg">
                    {renderIcon(service.iconName)}
                  </div>

                  <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors">
                    {service.title}
                  </h4>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {service.shortDescription}
                  </p>
                </div>

                {service.features && service.features.length > 0 && (
                  <div className="pt-6 mt-6 border-t border-slate-800/60 space-y-2.5">
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PORTFOLIO SECTION (Pure Black Contrast Slate-950 + Ambient Blue Tint) */}
      <section id="portfolio" className="py-24 bg-slate-950 relative">
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/80 pb-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-red-500" /> 
                {lang === 'id' ? 'Portofolio & Showcases' : 'Portfolio & Showcases'}
              </h2>
              <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight mt-1">
                {lang === 'id' ? 'Katalog Produk Pilihan' : 'Featured Product Catalog'}
              </h3>
            </div>
            <p className="text-slate-400 text-xs max-w-md">
              {lang === 'id' 
                ? 'Klik pada kartu produk di bawah untuk membuka Galeri Interaktif Multi-Image dan melihat detail tangkapan layar fitur.'
                : 'Click on any product card below to open the Interactive Multi-Image Gallery and view feature screenshot details.'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <span className="text-xs">{lang === 'id' ? 'Memuat katalog produk...' : 'Loading product catalog...'}</span>
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-slate-500 space-y-2 border border-dashed border-slate-800 rounded-3xl">
              <p className="text-sm font-semibold">{lang === 'id' ? 'Belum ada produk yang dipublikasikan.' : 'No published products found.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => {
                const galleryCount = product.galleryUrls?.length || (product.imageUrl ? 1 : 0);
                
                return (
                  <div
                    key={product.id}
                    onClick={() => openProductModal(product)}
                    className="group cursor-pointer bg-slate-900/60 border border-slate-800/90 hover:border-red-500/50 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between shadow-xl"
                  >
                    <div>
                      <div className="relative aspect-video bg-slate-950 overflow-hidden">
                        <img
                          src={product.imageUrl || '/placeholder.png'}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                        
                        <span className="absolute top-4 left-4 bg-blue-600/90 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-lg border border-blue-400/30">
                          {product.category}
                        </span>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-[2px]">
                          <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-red-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xl">
                            <Maximize2 className="w-3.5 h-3.5" /> 
                            {lang === 'id' ? 'Buka Galeri' : 'Open Gallery'} ({galleryCount})
                          </span>
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                          {product.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {product.tagline}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        {product.techStack?.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="text-[10px] font-mono bg-slate-950 border border-slate-800 text-blue-400 px-2 py-0.5 rounded-md">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs text-blue-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        {lang === 'id' ? 'Detail' : 'Details'} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* 4. CLIENTS SECTION (Warm Slate-900/50 Sub-layer) */}
      {clients.length > 0 && (
        <section id="clients" className="py-20 bg-slate-900/50 border-y border-slate-800/80 relative">
          <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
            
            <div className="text-center space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center justify-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" /> 
                {lang === 'id' ? 'Kepercayaan Klien' : 'Client Trust'}
              </h2>
              <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                {lang === 'id' ? 'Mitra & Klien Perusahaan' : 'Corporate Partners & Clients'}
              </h3>
              <p className="text-slate-400 text-xs max-w-xl mx-auto">
                {lang === 'id'
                  ? 'Organisasi dan perusahaan yang mengandalkan solusi perangkat lunak serta infrastruktur dari Senosoft.'
                  : 'Organizations and enterprise clients relying on Senosoft software and infrastructure solutions.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {clients.map((client) => {
                const CardWrapper = client.websiteUrl ? 'a' : 'div';
                const wrapperProps = client.websiteUrl 
                  ? { href: client.websiteUrl, target: '_blank', rel: 'noopener noreferrer' } 
                  : {};

                return (
                  <CardWrapper
                    key={client.id}
                    {...wrapperProps}
                    className="group bg-slate-950/80 border border-slate-800/80 hover:border-blue-500/40 rounded-2xl p-4 flex flex-col items-center justify-between text-center transition-all duration-300 hover:-translate-y-1 shadow-lg"
                  >
                    <div className="w-full aspect-video rounded-xl bg-slate-900/90 border border-slate-800 p-3 flex items-center justify-center overflow-hidden mb-3 group-hover:border-slate-700 transition-colors">
                      <img
                        src={client.logoUrl}
                        alt={client.name}
                        className="max-h-full max-w-full object-contain filter brightness-90 group-hover:brightness-100 transition-all duration-300"
                      />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors flex items-center justify-center gap-1">
                        <span>{client.name}</span>
                        {client.websiteUrl && <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-blue-400" />}
                      </h4>
                      {client.industry && (
                        <p className="text-[10px] text-slate-400 font-medium truncate max-w-[130px]">
                          {client.industry}
                        </p>
                      )}
                    </div>
                  </CardWrapper>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* 5. CONTACT INQUIRY SECTION (Gradient Slate 900 -> 950 Dark Conclusion) */}
      <section id="contact" className="py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start relative z-10">
          
          <div className="space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">
              {lang === 'id' ? 'Konsultasi & Penawaran' : 'Consultation & Inquiry'}
            </h2>
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {lang === 'id' 
                ? 'Diskusikan Kebutuhan Proyek Anda Bersama Senosoft' 
                : 'Discuss Your Project Requirements with Senosoft'}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {lang === 'id'
                ? 'Tim engineering kami berpengalaman dalam menangani penataan hardware fisik, pengembangan aplikasi web/mobile, hingga sistem terintegrasi.'
                : 'Our engineering team is experienced in handling physical hardware configuration, web/mobile app development, to fully integrated enterprise systems.'}
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <div className="p-3 rounded-xl bg-blue-600/10 text-blue-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">{lang === 'id' ? 'Email Kontak' : 'Contact Email'}</div>
                  <div className="text-sm font-bold text-white font-mono">{settings?.email || 'info@senosoft.id'}</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                <div className="p-3 rounded-xl bg-emerald-600/10 text-emerald-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold">WhatsApp Business</div>
                  <div className="text-sm font-bold text-white font-mono">{settings?.whatsapp || '+62 812-3456-7890'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl backdrop-blur-md">
            <h4 className="text-xl font-bold text-white">
              {lang === 'id' ? 'Kirim Pesan Inquiry' : 'Send Inquiry Message'}
            </h4>

            {inquirySuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-2xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  {lang === 'id' 
                    ? 'Pesan berhasil dikirim! Notifikasi WA telah diteruskan ke tim Senosoft.' 
                    : 'Message sent successfully! WhatsApp notification forwarded to Senosoft team.'}
                </span>
              </div>
            )}

            {inquiryError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-2xl">
                {inquiryError}
              </div>
            )}

            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {lang === 'id' ? 'Nama Lengkap' : 'Full Name'} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder={lang === 'id' ? 'Contoh: Gilang Ramadhan' : 'e.g., John Doe'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {lang === 'id' ? 'Email Kontak' : 'Contact Email'} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {lang === 'id' ? 'Nomor Telepon / WhatsApp' : 'Phone / WhatsApp Number'}
                  </label>
                  <input
                    type="text"
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="6281234567890"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {lang === 'id' ? 'Nama Perusahaan / Institusi' : 'Company / Organization Name'}
                  </label>
                  <input
                    type="text"
                    value={inquiryCompany}
                    onChange={(e) => setInquiryCompany(e.target.value)}
                    placeholder={lang === 'id' ? 'PT Senopati Teknologi Solusi' : 'Acme Tech Corp'}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {lang === 'id' ? 'Detail Kebutuhan & Pesan' : 'Project Details & Message'} <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder={
                    lang === 'id' 
                      ? 'Ceritakan rencana proyek software, instalasi CCTV, atau swap jaringan...' 
                      : 'Describe your software project, CCTV setup, or network swap plan...'
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm resize-none focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingInquiry}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-500 hover:to-red-500 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {isSubmittingInquiry ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === 'id' ? 'Mengirim Pesan...' : 'Sending Message...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{lang === 'id' ? 'Kirim Pesan Diskusi' : 'Send Inquiry Message'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Interactive Gallery Slider Modal */}
      {activeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                  {activeModalProduct.category}
                </span>
                <h3 className="text-2xl font-black text-white">{activeModalProduct.title}</h3>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-950 border border-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              {(() => {
                const gallery = activeModalProduct.galleryUrls?.length 
                  ? activeModalProduct.galleryUrls 
                  : [activeModalProduct.imageUrl || ''];

                return (
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group">
                    <img
                      src={gallery[currentSlideIndex]}
                      alt={`${activeModalProduct.title} Slide ${currentSlideIndex + 1}`}
                      className="w-full h-full object-contain"
                    />

                    {gallery.length > 1 && (
                      <>
                        <button
                          onClick={prevSlide}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/80 text-white hover:bg-blue-600 transition-colors shadow-lg"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={nextSlide}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/80 text-white hover:bg-blue-600 transition-colors shadow-lg"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                        
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/80 px-3 py-1 rounded-full text-xs font-mono text-slate-300 border border-slate-800">
                          {currentSlideIndex + 1} / {gallery.length}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                    {lang === 'id' ? 'Deskripsi Sistem' : 'System Description'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {activeModalProduct.description}
                  </p>

                  {activeModalProduct.features && activeModalProduct.features.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {lang === 'id' ? 'Fitur Utama:' : 'Key Features:'}
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeModalProduct.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">
                      {lang === 'id' ? 'Target Klien' : 'Target Client'}
                    </span>
                    <p className="text-xs font-semibold text-slate-200">{activeModalProduct.clientType || 'Enterprise'}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Tech Stack</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {activeModalProduct.techStack?.map((tech, i) => (
                        <span key={i} className="text-[11px] font-mono bg-slate-900 border border-slate-800 text-blue-400 px-2 py-0.5 rounded-md">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PublicFooter />
    </div>
  );
}