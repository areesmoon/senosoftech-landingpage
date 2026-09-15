// src/app/api/test-wa/route.ts
import { NextRequest, NextResponse } from 'next/server';
import wa from '@/lib/whatsapp';

export async function GET(request: NextRequest) {
  try {
    const urlParams = request.nextUrl.searchParams;
    const authHeader = request.headers.get('authorization');
    const querySecret = urlParams.get('secret');
    const bearerToken = authHeader ? authHeader.replace('Bearer ', '') : null;

    // Secret Key Pengaman
    const EXPECTED_SECRET = process.env.API_SECRET || 'Yoso5ukarto1956';
    const isAuthorized = (bearerToken === EXPECTED_SECRET || querySecret === EXPECTED_SECRET);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Secret key salah atau tidak ada.' }, 
        { status: 401 }
      );
    }

    // Ambil parameter target nomor atau pesan opsional dari URL query
    const targetPhone = urlParams.get('phone') || process.env.WA_TARGET_NUMBER || '';
    const nowStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const customMessage = urlParams.get('message') || 
      `🤖 *TEST NOTIFIKASI WA SENOSOFT*\n\nHalo, sistem WhatsApp Gateway Senosoft CMS berjalan normal dan terhubung sempurna!\n🕒 Waktu: ${nowStr}`;

    if (!targetPhone) {
      return NextResponse.json(
        { success: false, error: 'Nomor tujuan (phone) belum diset di .env.local atau parameter URL!' },
        { status: 400 }
      );
    }

    console.log(`📨 Mengirim pesan test WhatsApp ke target: ${targetPhone}`);

    // Kirim pesan via WhatsApp Service
    const result = await wa.sendMessage(targetPhone, customMessage);

    return NextResponse.json({
      success: true,
      message: 'Pesan test WhatsApp berhasil dikirim!',
      targetPhone,
      gatewayResponse: result
    });

  } catch (error: any) {
    console.error('❌ Gagal kirim test pesan WhatsApp:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}