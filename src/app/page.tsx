// src/app/page.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion, type Variants } from 'framer-motion';
import {
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
  Radio,
  Building2,
  ExternalLink,
  RefreshCw,
  Search,
  PenTool,
  Rocket,
  Workflow,
  ArrowUpRight,
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

const getGallery = (product: ProductItem) =>
  product.galleryUrls?.length ? product.galleryUrls : [product.imageUrl || ''];

// Motion presets
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// Reveals children when scrolled into view
function Reveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Card with a radial glow that follows the cursor
function SpotlightCard({
  children,
  className = '',
  glow = 'rgba(59,130,246,0.18)',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--y', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      onMouseMove={handleMove}
      onClick={onClick}
      className={`group relative overflow-hidden ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(420px circle at var(--x) var(--y), ${glow}, transparent 45%)` }}
      />
      {children}
    </motion.div>
  );
}

function SectionHeading({
  eyebrow,
  icon,
  title,
  subtitle,
  align = 'center',
}: {
  eyebrow: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  const centered = align === 'center';
  return (
    <Reveal className={`space-y-4 ${centered ? 'text-center' : ''}`}>
      <motion.div
        variants={fadeUp}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-800 bg-slate-900/60 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400`}
      >
        {icon}
        {eyebrow}
      </motion.div>
      <motion.h2
        variants={fadeUp}
        className="text-3xl md:text-5xl font-black text-white tracking-tight leading-[1.1]"
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          variants={fadeUp}
          className={`text-slate-400 text-sm md:text-base leading-relaxed ${centered ? 'max-w-2xl mx-auto' : 'max-w-xl'}`}
        >
          {subtitle}
        </motion.p>
      )}
    </Reveal>
  );
}

// Decorative "live system" console for the hero
const CONSOLE_LINES = [
  { mod: 'lab-interface', proto: 'HL7 / ASTM', status: 'online', tone: 'text-emerald-400' },
  { mod: 'iot-gateway', proto: 'MQTT', status: 'streaming', tone: 'text-cyan-400' },
  { mod: 'retail-network', proto: 'SD-WAN', status: 'zero-downtime', tone: 'text-red-400' },
  { mod: 'enterprise-api', proto: 'REST / gRPC', status: 'healthy', tone: 'text-blue-400' },
];

function HeroConsole() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative [perspective:1200px]"
    >
      {/* Gradient border */}
      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-blue-500/60 via-slate-700/30 to-red-500/60" />
      <div className="relative rounded-3xl bg-slate-950/95 backdrop-blur-xl overflow-hidden shadow-2xl shadow-blue-900/30">
        {/* Title bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-mono text-slate-500">senosoft://control-plane</span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        </div>

        {/* Terminal body */}
        <div className="p-5 font-mono text-[12px] sm:text-[13px] space-y-2.5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-slate-400"
          >
            <span className="text-red-400">$</span> senosoft status <span className="text-blue-400">--all</span>
          </motion.div>
          {CONSOLE_LINES.map((line, i) => (
            <motion.div
              key={line.mod}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 + i * 0.25 }}
              className="grid grid-cols-[auto_1fr_auto] sm:grid-cols-[auto_9rem_1fr_auto] items-center gap-3"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200 truncate">{line.mod}</span>
              <span className="hidden sm:block text-slate-500 truncate">{line.proto}</span>
              <span className={`${line.tone} text-right`}>{line.status}</span>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.3 }}
            className="text-slate-400 flex items-center gap-1"
          >
            <span className="text-red-400">$</span>
            <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse" />
          </motion.div>
        </div>

        {/* Throughput bars */}
        <div className="px-5 pb-5">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">
              <span>Throughput</span>
              <span className="text-blue-400">realtime</span>
            </div>
            <div className="flex items-end gap-1 h-14">
              {Array.from({ length: 28 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-blue-600/40 to-blue-400"
                  initial={{ height: '20%' }}
                  animate={{ height: ['25%', `${35 + ((i * 37) % 60)}%`, '30%'] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.06, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating chips */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden sm:flex absolute -left-6 top-24 items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-xl text-xs font-bold text-white"
      >
        <Radio className="w-4 h-4 text-cyan-400" /> Real-time IoT
      </motion.div>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="hidden sm:flex absolute -right-5 bottom-16 items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-xl text-xs font-bold text-white"
      >
        <ShieldCheck className="w-4 h-4 text-red-400" /> Enterprise-grade
      </motion.div>
    </motion.div>
  );
}

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

  // Unique tech stack across all products, for the marquee strip
  const techStack = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.techStack?.forEach((t) => t && set.add(t)));
    return Array.from(set);
  }, [products]);

  // Modal Gallery Slider Handlers
  const openProductModal = (product: ProductItem) => {
    setActiveModalProduct(product);
    setCurrentSlideIndex(0);
  };

  const closeModal = useCallback(() => {
    setActiveModalProduct(null);
    setCurrentSlideIndex(0);
  }, []);

  const nextSlide = useCallback(() => {
    if (!activeModalProduct) return;
    const gallery = getGallery(activeModalProduct);
    setCurrentSlideIndex((prev) => (prev + 1) % gallery.length);
  }, [activeModalProduct]);

  const prevSlide = useCallback(() => {
    if (!activeModalProduct) return;
    const gallery = getGallery(activeModalProduct);
    setCurrentSlideIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  }, [activeModalProduct]);

  // Keyboard navigation + scroll lock while the modal is open
  useEffect(() => {
    if (!activeModalProduct) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [activeModalProduct, closeModal, nextSlide, prevSlide]);

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

  const stats = [
    {
      icon: <Cpu className="w-5 h-5 text-blue-400" />,
      value: '100%',
      label: lang === 'id' ? 'Arsitektur Kustom' : 'Custom Architecture',
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-red-400" />,
      value: 'Zero-Downtime',
      label: lang === 'id' ? 'Swap Jaringan & Infra' : 'Network Swap & Infra',
    },
    {
      icon: <Radio className="w-5 h-5 text-cyan-400" />,
      value: 'Real-time',
      label: 'IoT & Lab Interfacing',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-rose-400" />,
      value: 'Enterprise',
      label: lang === 'id' ? 'Standar Keamanan' : 'Security Standard',
    },
  ];

  const processSteps = [
    {
      icon: <Search className="w-5 h-5" />,
      title: 'Discovery',
      desc: lang === 'id'
        ? 'Memetakan kebutuhan bisnis, sistem existing, dan batasan teknis di lapangan.'
        : 'Mapping business needs, existing systems, and on-site technical constraints.',
    },
    {
      icon: <PenTool className="w-5 h-5" />,
      title: lang === 'id' ? 'Arsitektur' : 'Architecture',
      desc: lang === 'id'
        ? 'Merancang arsitektur software, integrasi perangkat, dan topologi jaringan.'
        : 'Designing software architecture, device integration, and network topology.',
    },
    {
      icon: <Workflow className="w-5 h-5" />,
      title: 'Build & Integrate',
      desc: lang === 'id'
        ? 'Pengembangan iteratif dengan integrasi hardware & sistem pihak ketiga.'
        : 'Iterative development with hardware and third-party system integration.',
    },
    {
      icon: <Rocket className="w-5 h-5" />,
      title: 'Deploy & Support',
      desc: lang === 'id'
        ? 'Rollout bertahap tanpa downtime, dilanjutkan monitoring & dukungan.'
        : 'Phased zero-downtime rollout, followed by monitoring and support.',
    },
  ];

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all';

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-600 selection:text-white font-sans antialiased overflow-x-hidden">
      <PublicNavbar lang={lang} onLanguageChange={handleLanguageChange} />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-grid mask-radial pointer-events-none" />
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 left-[10%] w-[520px] h-[420px] bg-blue-600/25 blur-[140px] rounded-full pointer-events-none"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-40 right-[5%] w-[460px] h-[380px] bg-red-600/15 blur-[150px] rounded-full pointer-events-none"
        />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-700/60 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-14 lg:gap-12 items-center">
            {/* Copy */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-7 text-center lg:text-left">
              <motion.div
                variants={fadeUp}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/80 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-500/10 backdrop-blur-md"
              >
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-red-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-red-500" />
                </span>
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>{settings?.tagline || 'Builds the Impossible'}</span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05]"
              >
                <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                  {lang === 'id' ? 'Membangun System Software & Infrastructure ' : 'Building '}
                </span>
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-red-400 bg-clip-text text-transparent animate-gradient">
                  {lang === 'id' ? 'Masa Depan' : 'Next-Generation'}
                </span>
                {lang === 'en' && (
                  <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                    {' '}System Software & Infrastructure
                  </span>
                )}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                {settings?.description || (
                  lang === 'id'
                    ? 'Senosoft merancang platform kustom berskala enterprise, interfacing sistem laboratorium medis, hingga deployment & swap perangkat jaringan retail berskala nasional.'
                    : 'Senosoft engineers custom enterprise-grade platforms, medical lab system interfacing, and nationwide retail network deployment & device swapping.'
                )}
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <a
                  href="#portfolio"
                  className="group relative w-full sm:w-auto px-7 py-4 rounded-xl font-bold text-sm text-white overflow-hidden shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700" />
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                  <span className="relative">{lang === 'id' ? 'Lihat Portofolio Produk' : 'View Product Portfolio'}</span>
                  <ArrowRight className="relative w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
                <a
                  href="#contact"
                  className="w-full sm:w-auto px-7 py-4 bg-slate-900/70 border border-slate-700/70 hover:border-red-500/50 hover:bg-slate-900 text-slate-200 font-bold text-sm rounded-xl transition-all text-center backdrop-blur-md"
                >
                  {lang === 'id' ? 'Konsultasi Proyek' : 'Project Consultation'}
                </a>
              </motion.div>
            </motion.div>

            {/* Console visual */}
            <div className="max-w-xl w-full mx-auto lg:mx-0">
              <HeroConsole />
            </div>
          </div>

          {/* Stats strip */}
          <Reveal className="mt-20 grid grid-cols-2 lg:grid-cols-4 rounded-3xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md overflow-hidden divide-x divide-y lg:divide-y-0 divide-slate-800/80">
            {stats.map((stat) => (
              <motion.div
                key={stat.value}
                variants={fadeUp}
                className="group p-5 md:p-7 flex items-start gap-4 hover:bg-slate-900/60 transition-colors"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-lg md:text-2xl font-black text-white tracking-tight break-words">{stat.value}</div>
                  <div className="text-[11px] md:text-xs text-slate-400 font-medium mt-0.5">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* TECH MARQUEE */}
      {techStack.length > 0 && (
        <div className="py-8 border-b border-slate-900 bg-slate-950">
          <div className="mask-fade-x overflow-hidden">
            <div className="flex w-max animate-marquee gap-3">
              {[...techStack, ...techStack].map((tech, i) => (
                <span
                  key={`${tech}-${i}`}
                  className="shrink-0 px-4 py-2 rounded-full border border-slate-800 bg-slate-900/50 text-xs font-mono text-slate-400 hover:text-blue-300 hover:border-blue-500/40 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. SERVICES SECTION */}
      <section id="services" className="scroll-mt-20 py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-grid opacity-40 mask-radial pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 space-y-16 relative z-10">
          <SectionHeading
            eyebrow={lang === 'id' ? 'Kapabilitas Teknis' : 'Technical Capabilities'}
            icon={<Zap className="w-3.5 h-3.5 text-red-500" />}
            title={lang === 'id' ? 'Layanan Spesialisasi Senosoft' : 'Senosoft Specialized Services'}
            subtitle={
              lang === 'id'
                ? 'Penawaran solusi yang teruji untuk akselerasi operasional bisnis dan infrastruktur TI Anda.'
                : 'Proven solution offerings to accelerate your business operations and IT infrastructure.'
            }
          />

          <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, idx) => (
              <SpotlightCard
                key={service.id}
                className="rounded-3xl border border-slate-800/90 bg-slate-900/40 hover:border-slate-700 p-8 transition-colors flex flex-col"
              >
                <div className="relative flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/60 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg">
                    {renderIcon(service.iconName)}
                  </div>
                  <span className="text-5xl font-black text-slate-800/80 group-hover:text-slate-700/80 transition-colors font-mono leading-none">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                <h3 className="relative mt-6 text-xl font-bold text-white tracking-tight">
                  {service.title}
                </h3>
                <p className="relative mt-3 text-sm text-slate-400 leading-relaxed">
                  {service.shortDescription}
                </p>

                {service.features && service.features.length > 0 && (
                  <ul className="relative pt-6 mt-auto space-y-2.5">
                    <li className="h-px mb-5 bg-gradient-to-r from-slate-800 via-slate-700/50 to-transparent" />
                    {service.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-px" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </SpotlightCard>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 3. PORTFOLIO SECTION */}
      <section id="portfolio" className="scroll-mt-20 py-24 md:py-32 relative bg-slate-900/30 border-y border-slate-800/60">
        <div className="absolute top-1/3 right-0 w-[420px] h-[420px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-red-600/10 blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 space-y-14 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <SectionHeading
              align="left"
              eyebrow={lang === 'id' ? 'Portofolio & Showcases' : 'Portfolio & Showcases'}
              icon={<LayoutGrid className="w-3.5 h-3.5 text-red-500" />}
              title={lang === 'id' ? 'Katalog Produk Pilihan' : 'Featured Product Catalog'}
            />
            <p className="text-slate-400 text-sm max-w-sm md:text-right">
              {lang === 'id'
                ? 'Klik kartu produk untuk membuka galeri interaktif dan melihat detail fitur.'
                : 'Click any product card to open the interactive gallery and view feature details.'}
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-3xl border border-slate-800 bg-slate-900/50 overflow-hidden animate-pulse">
                  <div className="aspect-video bg-slate-800/50" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 w-2/3 rounded bg-slate-800" />
                    <div className="h-3 w-full rounded bg-slate-800/70" />
                    <div className="h-3 w-4/5 rounded bg-slate-800/70" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center text-slate-500 space-y-2 border border-dashed border-slate-800 rounded-3xl">
              <p className="text-sm font-semibold">{lang === 'id' ? 'Belum ada produk yang dipublikasikan.' : 'No published products found.'}</p>
            </div>
          ) : (
            <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, idx) => {
                const galleryCount = product.galleryUrls?.length || (product.imageUrl ? 1 : 0);
                // First product gets a wide "hero" card on large screens
                const featured = idx === 0 && products.length > 2;

                return (
                  <SpotlightCard
                    key={product.id}
                    onClick={() => openProductModal(product)}
                    glow="rgba(239,68,68,0.14)"
                    className={`cursor-pointer rounded-3xl border border-slate-800/90 bg-slate-950/70 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 flex flex-col shadow-xl ${
                      featured ? 'md:col-span-2 lg:row-span-1' : ''
                    }`}
                  >
                    <div className={`relative overflow-hidden bg-slate-950 ${featured ? 'aspect-video md:aspect-[21/9]' : 'aspect-video'}`}>
                      <img
                        src={product.imageUrl || '/placeholder.png'}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      <span className="absolute top-4 left-4 bg-slate-950/70 text-blue-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-md border border-blue-400/30">
                        {product.category}
                      </span>
                      {galleryCount > 0 && (
                        <span className="absolute top-4 right-4 flex items-center gap-1 bg-slate-950/70 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border border-slate-700/60">
                          <Maximize2 className="w-3 h-3" /> {galleryCount}
                        </span>
                      )}

                      {featured && (
                        <div className="absolute bottom-0 inset-x-0 p-6 md:p-8">
                          <h3 className="text-2xl md:text-3xl font-black text-white">{product.title}</h3>
                          <p className="mt-2 text-sm text-slate-300 line-clamp-2 max-w-2xl">{product.tagline}</p>
                        </div>
                      )}
                    </div>

                    {!featured && (
                      <div className="relative p-6 space-y-2 flex-1">
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                          {product.tagline}
                        </p>
                      </div>
                    )}

                    <div className={`relative px-6 pb-6 flex items-center justify-between gap-3 ${featured ? 'pt-5' : ''}`}>
                      <div className="flex flex-wrap gap-1.5">
                        {product.techStack?.slice(0, featured ? 5 : 3).map((tech, i) => (
                          <span key={i} className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                            {tech}
                          </span>
                        ))}
                      </div>
                      <span className="shrink-0 w-9 h-9 rounded-full border border-slate-700 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:text-white transition-all">
                        <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                      </span>
                    </div>
                  </SpotlightCard>
                );
              })}
            </Reveal>
          )}
        </div>
      </section>

      {/* 4. PROCESS SECTION */}
      <section className="py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <SectionHeading
            eyebrow={lang === 'id' ? 'Cara Kami Bekerja' : 'How We Work'}
            icon={<Workflow className="w-3.5 h-3.5 text-red-500" />}
            title={lang === 'id' ? 'Dari Ide Hingga Produksi' : 'From Idea to Production'}
            subtitle={
              lang === 'id'
                ? 'Proses engineering yang terukur, transparan, dan siap untuk skala enterprise.'
                : 'A measurable, transparent engineering process built for enterprise scale.'
            }
          />

          <Reveal className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="hidden lg:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-blue-500/50 via-slate-700 to-red-500/50" />
            {processSteps.map((step, i) => (
              <motion.div key={step.title} variants={fadeUp} className="relative text-center lg:px-2">
                <div className="relative mx-auto w-14 h-14 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-900/20">
                  {step.icon}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-red-600 text-[10px] font-black text-white flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* 5. CLIENTS SECTION */}
      {clients.length > 0 && (
        <section id="clients" className="scroll-mt-20 py-20 md:py-24 border-y border-slate-800/60 bg-slate-900/30 relative">
          <div className="max-w-7xl mx-auto px-6 space-y-12 relative z-10">
            <SectionHeading
              eyebrow={lang === 'id' ? 'Kepercayaan Klien' : 'Client Trust'}
              icon={<Building2 className="w-3.5 h-3.5 text-emerald-400" />}
              title={lang === 'id' ? 'Mitra & Klien Perusahaan' : 'Corporate Partners & Clients'}
              subtitle={
                lang === 'id'
                  ? 'Organisasi dan perusahaan yang mengandalkan solusi perangkat lunak serta infrastruktur dari Senosoft.'
                  : 'Organizations and enterprise clients relying on Senosoft software and infrastructure solutions.'
              }
            />
          </div>

          {(() => {
            const renderClient = (client: ClientItem, key: string) => {
              const CardWrapper = client.websiteUrl ? 'a' : 'div';
              const wrapperProps = client.websiteUrl
                ? { href: client.websiteUrl, target: '_blank', rel: 'noopener noreferrer' }
                : {};

              return (
                <CardWrapper
                  key={key}
                  {...wrapperProps}
                  className="group shrink-0 w-48 bg-slate-950/70 border border-slate-800/80 hover:border-blue-500/40 rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-full h-20 rounded-xl bg-slate-900/80 p-3 flex items-center justify-center overflow-hidden mb-3">
                    <img
                      src={client.logoUrl}
                      alt={client.name}
                      className="max-h-full max-w-full object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                    />
                  </div>
                  <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors flex items-center justify-center gap-1">
                    <span className="truncate max-w-[140px]">{client.name}</span>
                    {client.websiteUrl && <ExternalLink className="w-3 h-3 shrink-0 text-slate-500 group-hover:text-blue-400" />}
                  </h4>
                  {client.industry && (
                    <p className="text-[10px] text-slate-500 font-medium truncate max-w-[150px] mt-0.5">
                      {client.industry}
                    </p>
                  )}
                </CardWrapper>
              );
            };

            // Scroll the logos only when there are enough to fill the row
            return clients.length >= 5 ? (
              <div className="mt-12 mask-fade-x overflow-hidden">
                <div className="flex w-max gap-5 animate-marquee py-2">
                  {[...clients, ...clients].map((c, i) => renderClient(c, `${c.id}-${i}`))}
                </div>
              </div>
            ) : (
              <div className="mt-12 max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-5">
                {clients.map((c) => renderClient(c, c.id || c.name))}
              </div>
            );
          })()}
        </section>
      )}

      {/* 6. CONTACT INQUIRY SECTION */}
      <section id="contact" className="scroll-mt-20 py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 mask-radial pointer-events-none" />
        <div className="absolute top-1/4 left-0 w-[420px] h-[420px] bg-blue-600/15 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[380px] h-[380px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start relative z-10">
          <div className="space-y-8 lg:sticky lg:top-28">
            <SectionHeading
              align="left"
              eyebrow={lang === 'id' ? 'Konsultasi & Penawaran' : 'Consultation & Inquiry'}
              icon={<Send className="w-3.5 h-3.5 text-red-500" />}
              title={
                lang === 'id'
                  ? 'Diskusikan Kebutuhan Proyek Anda Bersama Senosoft'
                  : 'Discuss Your Project Requirements with Senosoft'
              }
              subtitle={
                lang === 'id'
                  ? 'Tim engineering kami berpengalaman dalam menangani penataan hardware fisik, pengembangan aplikasi web/mobile, hingga sistem terintegrasi.'
                  : 'Our engineering team is experienced in handling physical hardware configuration, web/mobile app development, to fully integrated enterprise systems.'
              }
            />

            <Reveal className="grid sm:grid-cols-2 gap-4">
              <motion.a
                variants={fadeUp}
                href={`mailto:${settings?.email || 'info@senosoft.id'}`}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/40 transition-colors"
              >
                <div className="p-3 rounded-xl bg-blue-600/10 text-blue-400 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-400 font-semibold">{lang === 'id' ? 'Email Kontak' : 'Contact Email'}</div>
                  <div className="text-sm font-bold text-white font-mono truncate">{settings?.email || 'info@senosoft.id'}</div>
                </div>
              </motion.a>

              <motion.div
                variants={fadeUp}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-colors"
              >
                <div className="p-3 rounded-xl bg-emerald-600/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-400 font-semibold">WhatsApp Business</div>
                  <div className="text-sm font-bold text-white font-mono truncate">{settings?.whatsapp || '+62 812-3456-7890'}</div>
                </div>
              </motion.div>
            </Reveal>
          </div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-blue-500/50 via-slate-800 to-red-500/40" />
            <div className="relative bg-slate-950/95 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {lang === 'id' ? 'Kirim Pesan Inquiry' : 'Send Inquiry Message'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {lang === 'id' ? 'Kolom bertanda * wajib diisi.' : 'Fields marked * are required.'}
                </p>
              </div>

              <AnimatePresence>
                {inquirySuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold rounded-2xl flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>
                      {lang === 'id'
                        ? 'Pesan berhasil dikirim! Notifikasi WA telah diteruskan ke tim Senosoft.'
                        : 'Message sent successfully! WhatsApp notification forwarded to Senosoft team.'}
                    </span>
                  </motion.div>
                )}

                {inquiryError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold rounded-2xl"
                  >
                    {inquiryError}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      {lang === 'id' ? 'Nama Lengkap' : 'Full Name'} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      placeholder={lang === 'id' ? 'Contoh: Gilang Ramadhan' : 'e.g., John Doe'}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      {lang === 'id' ? 'Email Kontak' : 'Contact Email'} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="nama@perusahaan.com"
                      className={`${inputClass} font-mono`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      {lang === 'id' ? 'Nomor Telepon / WhatsApp' : 'Phone / WhatsApp Number'}
                    </label>
                    <input
                      type="text"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="6281234567890"
                      className={`${inputClass} font-mono`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      {lang === 'id' ? 'Nama Perusahaan / Institusi' : 'Company / Organization Name'}
                    </label>
                    <input
                      type="text"
                      value={inquiryCompany}
                      onChange={(e) => setInquiryCompany(e.target.value)}
                      placeholder={lang === 'id' ? 'PT Senopati Teknologi Solusi' : 'Acme Tech Corp'}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    {lang === 'id' ? 'Detail Kebutuhan & Pesan' : 'Project Details & Message'} <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder={
                      lang === 'id'
                        ? 'Ceritakan rencana proyek software, instalasi CCTV, atau swap jaringan...'
                        : 'Describe your software project, CCTV setup, or network swap plan...'
                    }
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingInquiry}
                  className="group relative w-full py-4 rounded-xl font-bold text-sm text-white overflow-hidden flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-red-600 animate-gradient" />
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  {isSubmittingInquiry ? (
                    <>
                      <Loader2 className="relative w-4 h-4 animate-spin" />
                      <span className="relative">{lang === 'id' ? 'Mengirim Pesan...' : 'Sending Message...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="relative w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                      <span className="relative">{lang === 'id' ? 'Kirim Pesan Diskusi' : 'Send Inquiry Message'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Gallery Slider Modal */}
      <AnimatePresence>
        {activeModalProduct && (() => {
          const gallery = getGallery(activeModalProduct);

          return (
            <motion.div
              key="product-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={activeModalProduct.title}
                className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      {activeModalProduct.category}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white truncate">{activeModalProduct.title}</h3>
                  </div>
                  <button
                    onClick={closeModal}
                    aria-label="Close"
                    className="shrink-0 p-2 text-slate-400 hover:text-white hover:rotate-90 transition-all rounded-xl bg-slate-950 border border-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={currentSlideIndex}
                          src={gallery[currentSlideIndex]}
                          alt={`${activeModalProduct.title} Slide ${currentSlideIndex + 1}`}
                          initial={{ opacity: 0, scale: 1.02 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="w-full h-full object-contain"
                        />
                      </AnimatePresence>

                      {gallery.length > 1 && (
                        <>
                          <button
                            onClick={prevSlide}
                            aria-label="Previous"
                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/80 border border-slate-700/60 text-white hover:bg-blue-600 transition-colors shadow-lg"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextSlide}
                            aria-label="Next"
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-950/80 border border-slate-700/60 text-white hover:bg-blue-600 transition-colors shadow-lg"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>

                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/80 px-3 py-1 rounded-full text-xs font-mono text-slate-300 border border-slate-800">
                            {currentSlideIndex + 1} / {gallery.length}
                          </div>
                        </>
                      )}
                    </div>

                    {gallery.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {gallery.map((url, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentSlideIndex(i)}
                            aria-label={`Slide ${i + 1}`}
                            className={`shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                              i === currentSlideIndex
                                ? 'border-blue-500 opacity-100'
                                : 'border-transparent opacity-50 hover:opacity-80'
                            }`}
                          >
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400">
                        {lang === 'id' ? 'Deskripsi Sistem' : 'System Description'}
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {activeModalProduct.description}
                      </p>

                      {activeModalProduct.features && activeModalProduct.features.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            {lang === 'id' ? 'Fitur Utama:' : 'Key Features:'}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeModalProduct.features.map((feat, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-px" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 h-fit">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">
                          {lang === 'id' ? 'Target Klien' : 'Target Client'}
                        </span>
                        <p className="text-sm font-semibold text-slate-200">{activeModalProduct.clientType || 'Enterprise'}</p>
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

                      <a
                        href="#contact"
                        onClick={closeModal}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
                      >
                        {lang === 'id' ? 'Tanya Produk Ini' : 'Ask About This'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <PublicFooter />
    </div>
    </MotionConfig>
  );
}
