// src/app/api/inquiry/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import wa from '@/lib/whatsapp'; // 🎯 Pakai import alias sesuai pola milik lu

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, serviceRequested, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Nama, Email, dan Pesan wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Simpan Inquiry ke Firestore root collection 'inquiries'
    const inquiryRef = await addDoc(collection(db, 'inquiries'), {
      name,
      email,
      phone: phone || '',
      company: company || '',
      serviceRequested: serviceRequested || '-',
      message,
      status: 'unread',
      createdAt: serverTimestamp(),
    });

    // 2. Ambil daftar admin yang punya flag isContact == true dari Firestore
    const usersQuery = query(collection(db, 'users'), where('isContact', '==', true));
    const querySnapshot = await getDocs(usersQuery);

    const contactNumbers: string[] = [];
    querySnapshot.forEach((docSnap) => {
      const uData = docSnap.data();
      if (uData.whatsapp) {
        contactNumbers.push(uData.whatsapp);
      }
    });

    // 3. Format Pesan WhatsApp Notifikasi
    const nowStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const waMessage = 
`🚀 *INQUIRY BARU WEBSITE SENOSOFT*
----------------------------------------
🕒 *Waktu:* ${nowStr}
👤 *Nama:* ${name}
✉️ *Email:* ${email}
📞 *No. HP/WA:* ${phone || '-'}
🏢 *Perusahaan:* ${company || '-'}
🛠️ *Layanan:* ${serviceRequested || '-'}

📝 *Pesan/Kebutuhan:*
${message}
----------------------------------------
_Dikirim otomatis via WABot Senosoft CMS_`;

    // 4. Kirim WA ke semua admin penerima inquiry menggunakan wa.sendMessage()
    const sendResults = [];
    for (const targetPhone of contactNumbers) {
      try {
        console.log(`📨 Mengirim notifikasi inquiry WhatsApp ke: ${targetPhone}`);
        const result = await wa.sendMessage(targetPhone, waMessage);
        sendResults.push({ targetPhone, status: 'success', result });
      } catch (err: any) {
        console.error(`❌ Gagal kirim WA ke ${targetPhone}:`, err.message);
        sendResults.push({ targetPhone, status: 'failed', error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry berhasil disimpan dan notifikasi WA dikirim!',
      inquiryId: inquiryRef.id,
      recipientsCount: contactNumbers.length,
      sendResults,
    });

  } catch (error: any) {
    console.error('❌ Error handling inquiry API:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}