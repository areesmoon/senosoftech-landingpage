// src/components/VotePointBannerGenerator.tsx
'use client';

import React, { useRef } from 'react';
import { Download, Sparkles } from 'lucide-react';

export default function VotePointBannerGenerator() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateAndDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set Ukuran Canvas High-Res (16:9 Showcase Banner)
    canvas.width = 1200;
    canvas.height = 675;

    // 1. Background Gradient Tech Dark
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 675);
    bgGradient.addColorStop(0, '#020617');   // slate-950
    bgGradient.addColorStop(0.5, '#0f172a'); // slate-900
    bgGradient.addColorStop(1, '#020617');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 675);

    // 2. Glow Effects (Blue & Emerald)
    const glow1 = ctx.createRadialGradient(300, 200, 10, 300, 200, 400);
    glow1.addColorStop(0, 'rgba(37, 99, 235, 0.25)'); // Blue glow
    glow1.addColorStop(1, 'transparent');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1200, 675);

    const glow2 = ctx.createRadialGradient(900, 450, 10, 900, 450, 350);
    glow2.addColorStop(0, 'rgba(16, 185, 129, 0.2)'); // Emerald glow
    glow2.addColorStop(1, 'transparent');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1200, 675);

    // 3. Tech Grid Lines Pattern
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1200; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 675);
      ctx.stroke();
    }
    for (let y = 0; y < 675; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // 4. Card Framing (Live Re-cap Mockup Simulation)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    
    // Outer Container Card
    ctx.beginPath();
    ctx.roundRect(80, 80, 1040, 515, 24);
    ctx.fill();
    ctx.stroke();

    // 5. Product Branding Title
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px Inter, sans-serif';
    ctx.fillText('VOTEPOINT', 120, 150);

    // Subtitle Tagline
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 14px Inter, sans-serif';
    ctx.fillText('ENTERPRISE MULTI-TENANT E-VOTING SYSTEM', 120, 175);

    // Badge Real-time Active
    ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
    ctx.beginPath();
    ctx.roundRect(880, 125, 200, 36, 18);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('● LIVE SYNC ACTIVE', 915, 147);

    // 6. Visual Metric Counters
    // Box Metric 1
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(120, 210, 280, 90, 16);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('TOTAL SUARA MASUK', 140, 240);
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px Inter, sans-serif';
    ctx.fillText('100%', 140, 280);

    // Box Metric 2
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(420, 210, 280, 90, 16);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('ISOLASI DATA TENANT', 440, 240);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '900 24px Inter, sans-serif';
    ctx.fillText('SECURED', 440, 278);

    // Box Metric 3
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(720, 210, 360, 90, 16);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('AUTENTIKASI PEMILIH', 740, 240);
    ctx.fillStyle = '#10b981';
    ctx.font = '900 20px Inter, sans-serif';
    ctx.fillText('KTP / TOKEN / GOOGLE', 740, 276);

    // 7. Preview Candidate Cards Mockup Grid
    const candidates = [
      { name: 'Aris Munawar', role: 'Kandidat 01', votes: '50%', color: '#3b82f6', leading: false },
      { name: 'Riza Agus Al Hasan', role: 'Kandidat 02 (Unggul)', votes: '50%', color: '#10b981', leading: true },
      { name: 'Muhammad Ismail', role: 'Kandidat 03', votes: 'Standby', color: '#6366f1', leading: false }
    ];

    candidates.forEach((c, idx) => {
      const xPos = 120 + idx * 320;
      const yPos = 330;

      ctx.fillStyle = c.leading ? 'rgba(16, 185, 129, 0.08)' : '#0f172a';
      ctx.strokeStyle = c.leading ? '#10b981' : '#334155';
      ctx.lineWidth = c.leading ? 2 : 1;

      ctx.beginPath();
      ctx.roundRect(xPos, yPos, 300, 220, 16);
      ctx.fill();
      ctx.stroke();

      // Candidate Avatar Circle
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(xPos + 50, yPos + 50, 24, 0, Math.PI * 2);
      ctx.fill();

      // Candidate Name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText(c.name, xPos + 88, yPos + 45);

      ctx.fillStyle = c.leading ? '#10b981' : '#94a3b8';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(c.role, xPos + 88, yPos + 65);

      // Progress Bar Track
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(xPos + 20, yPos + 160, 260, 12, 6);
      ctx.fill();

      // Progress Fill
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.roundRect(xPos + 20, yPos + 160, c.leading ? 260 : 130, 12, 6);
      ctx.fill();
    });

    // Trigger Download JPG / PNG
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'votepoint-showcase-banner.png';
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
      <div className="flex items-center justify-center gap-2 text-blue-400 font-bold text-sm">
        <Sparkles className="w-4 h-4" />
        <span>VotePoint Banner Generator</span>
      </div>
      <p className="text-xs text-slate-400 max-w-md mx-auto">
        Klik tombol di bawah untuk men-generate dan mengunduh aset banner komposit VotePoint (1200x675 px) secara otomatis untuk di-upload ke form produk.
      </p>

      {/* Hidden Canvas Area */}
      <canvas ref={canvasRef} className="hidden" />

      <button
        type="button"
        onClick={generateAndDownload}
        className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all inline-flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        <span>Generate & Download Banner (.png)</span>
      </button>
    </div>
  );
}