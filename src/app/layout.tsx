import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Senosoft — Enterprise Software & Systems Integrator",
  description: "Specialist in IoT, Hardware Integration, Laboratory Systems, and Custom Software Development.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        {children}
      </body>
    </html>
  );
}