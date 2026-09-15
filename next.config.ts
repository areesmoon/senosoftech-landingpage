import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tambahkan izin domain Firebase Storage untuk komponen <Image /> Next.js
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
  
  // Opsional: Boleh diaktifkan sementara saat riset/migrasi, 
  // tapi hapus baris typescript ini jika tipe data produk/services sudah bersih.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;