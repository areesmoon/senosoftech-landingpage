// src/types/cms.ts

export type ProductCategory = 
  | "IoT & Hardware" 
  | "Healthcare & Lab" 
  | "Enterprise Automation" 
  | "Event & Community";

export interface ProductItem {
  id?: string;
  title: string;
  slug: string;
  tagline: string;
  category: ProductCategory;
  description: string;
  clientType?: string;
  order: number;
  isFeatured: boolean;
  features: string[];
  techStack: string[];
  imageUrl?: string;
  galleryUrls?: string[]; // 👈 Tambahkan baris ini!
  createdAt?: any;
  updatedAt?: any;
}

export interface ServiceItem {
  id?: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string; // Nama icon Lucide, cth: 'Cpu', 'Activity', 'Code', 'Server'
  features: string[];
  order: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface HeroSettings {
  uptimeSla: string;       // e.g. "99.9%"
  connectedHardware: string; // e.g. "50+"
  totalProjects: string;    // e.g. "15+"
  latency: string;          // e.g. "< 1s"
}

export type InquiryStatus = 'unread' | 'read' | 'replied' | 'archived';

export interface InquiryItem {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  serviceRequested?: string; // Layanan yang diminati calon klien
  message: string;
  status: InquiryStatus;
  createdAt?: any;
}

// src/types/cms.ts

export interface CompanySettings {
  companyName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  postalCode?: string;
  googleMapsUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  workingHours: string;
  updatedAt?: any;
}

export interface ClientItem {
  id?: string;
  name: string;
  industry?: string;       // Contoh: Healthcare, Logistics, Retail, Education
  logoUrl: string;
  websiteUrl?: string;
  order: number;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}