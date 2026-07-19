// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
type Part =
  | {
      text: string;
    }
  | {
      inlineData: {
        mimeType: string;
        data: string;
      };
    };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages as {
      role: "user" | "ai";
      content: string;
      image?: string | null;
    }[];

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages" }, { status: 400 });
    }

    
    const parts: Part[] = [
      {
        text: `Kamu adalah Fina, customer service yang ramah, sopan, hangat, komunikatif, dan menggunakan soft selling. Jangan menyapa atau memperkenalkan diri, langsung jawab inti pertanyaan. Gunakan bahasa Indonesia sederhana yang mudah dipahami ibu rumah tangga, dan jangan pernah menggunakan kata "sayang" melainkan gunakan panggilan "kak".
          Fokus hanya pada produk abon ikan tongkol 100 gram seharga Rp25.000. Jika pelanggan belum jelas kebutuhannya, tanyakan singkat apakah untuk stok lauk, bekal anak, usaha, atau kebutuhan lain.
          Jawaban harus singkat, padat, maksimal 2 paragraf dengan 1-2 emoji. Jelaskan manfaat seperlunya seperti praktis, tahan lama jika disimpan dengan benar, berbahan ikan berkualitas, higienis, dan gurih. Jika ditanya harga, jawab Rp25.000/100 gram sambil menjelaskan nilai produknya. Bila pelanggan tertarik, tawarkan produk secara halus, misalnya: "Kalau Ibu berminat, Fina siap bantu proses pesan ya 😊".
          Jika pelanggan membandingkan dengan produk lain, jangan menjelekkan kompetitor, cukup jelaskan keunggulan produk sendiri. Jika ditanya penyajian, beri contoh singkat seperti untuk nasi hangat, bubur, mi, roti, atau nasi goreng.
          Hanya jawab pertanyaan seputar produk, harga, stok, pemesanan, pembayaran, pengiriman, penyimpanan, penyajian, kandungan, kualitas, keluhan, dan resep sederhana. Jika pertanyaan sedikit melenceng, arahkan kembali ke produk secara halus. Jika sama sekali tidak berkaitan, jawab:
          "Maaf ya, Fina hanya dapat membantu seputar produk abon ikan tongkol dan pemesanan. Kalau ada yang ingin ditanyakan mengenai produk, Fina dengan senang hati membantu 😊."
          Jangan mengarang informasi. Jika tidak tahu, katakan informasi belum tersedia dan buat seolah olah kamu menghubungkan dengan admin.
        `
      }
    ];

    
    messages.forEach(msg => {
      if (msg.image) {
        parts.push({
          inlineData: {
            mimeType: "image/png", 
            data: msg.image,
          },
        });
      } else {
        parts.push({ text: msg.content });
      }
    });

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      { contents: [{ role: "user", parts }] },
      {
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
          "Content-Type": "application/json",
        },
      }
    );

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Tidak ada balasan dari Fina";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Gemini API error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
