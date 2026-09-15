# 🚀 Senosoft Corporate Web & CMS

Official web company profile and internal Content Management System (CMS) for **Senosoft** — Technical Solution Specialist & Systems Integrator (IoT/Hardware Integration, Healthcare Systems, and Custom Enterprise Software).

Built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **shadcn/ui**, and **Firebase (Firestore & Storage)** under a clean **Single-Tenant Architecture**.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 16 (App Router, Server Components, SSR/ISR)
* **Language:** TypeScript
* **Styling & UI:** Tailwind CSS v4, shadcn/ui, Lucide React Icons
* **Animation Engine:** Framer Motion
* **Database & Cloud:** Firebase Firestore (Database) & Firebase Storage (Assets)
* **Authentication:** Firebase Auth (Privat Admin Access)
* **Form Validation:** React Hook Form + Zod
* **Data Visualization:** Recharts

---

## 🎯 Main Features

### 🌐 Public Showcase Page
* **Hero Section:** Techy, modern landing page featuring high-reliability stats & interactive value propositions.
* **Products Catalog:** Dynamic display of 12+ Senosoft flagship products (FlexiLIS, Solar Monitoring, VotePoint, SwimReg, etc.).
* **Services & Solutions:** Core technical competencies (Hardware/Lab Instrument Stream Integration, Custom Web/Mobile, Legacy Maintenance).
* **Case Studies & Clients:** Problem-Solution-Impact breakdown grid.
* **Interactive Lead Form:** Direct inquiry generation routing to admin inbox.

### 🔐 Internal Admin CMS (`/admin`)
* **Single-Tenant Architecture:** Streamlined data management tailored exclusively for Senosoft operations.
* **Product Management (CRUD):** Add, edit, toggle visibility, and upload screenshots for ready-to-deploy software.
* **Service Management (CRUD):** Manage custom IT solutions and hardware integration offerings.
* **Inquiry Inbox:** Read and handle contact form submissions from potential enterprise clients.
* **Global Settings:** Update Hero statistics (SLA Uptime %, connected instruments, project count) without code re-deployment.

---

## 📁 Project Structure

```text
senosoft-web/
├── app/
│   ├── (public)/          # Public routes (Home, Products, Services, Contact)
│   ├── admin/             # Authenticated CMS routes (/dashboard, /products, /services, etc.)
│   ├── api/               # API routes / Webhooks
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/
│   ├── admin/             # CMS-specific components & CRUD forms
│   ├── home/              # Landing page sections (Hero, Stats, Featured Products)
│   ├── shared/            # Common UI elements (Navbar, Footer, Cards)
│   └── ui/                # shadcn/ui primitive components
├── lib/
│   ├── firebase/          # Client & Admin SDK initialization
│   ├── utils.ts           # Helper functions (cn, formatters)
│   └── schema/            # Zod validation schemas
├── public/                # Static assets & logos
└── types/                 # TypeScript interfaces (Product, Service, Inquiry)

```

---

## 🗄️ Database Schema Overview (Firestore)

All collections are structured at top-level (Single-Tenant):

* **`products`**: `id`, `slug`, `title`, `tagline`, `category`, `description`, `features[]`, `techStack[]`, `isFeatured`, `order`
* **`services`**: `id`, `slug`, `title`, `description`, `iconName`, `keyHighlights[]`
* **`inquiries`**: `id`, `name`, `email`, `company`, `category`, `message`, `createdAt`, `status`
* **`settings`**: `doc("global")` $\rightarrow$ Hero Stats (`uptime`, `connectedHardware`, `totalProjects`), Contact Info.

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have Node.js 20+ installed.

### 2. Environment Variables Setup

Create a `.env.local` file in the root directory:

```env
# Firebase Public Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server Side)
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

```

### 3. Installation

Clear cache and install dependencies:

```bash
npm install

```

### 4. Run Development Server

```bash
npm run dev
# Server will start on http://localhost:3000 (or configured port)

```

---

## 📝 License

Private & Proprietary — Developed for **Senosoft** internal use and client showcase.