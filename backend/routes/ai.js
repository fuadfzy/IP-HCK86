const express = require('express');
const OpenAI = require('openai');
const { MenuItem } = require('../models');
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /ai/chat - AI chat for menu recommendation (stateless)
// Body: { messages: [{role: 'user'|'assistant'|'system', content: '...'}] }
router.post('/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }
  try {
    // Get all menu items from DB
    const menuItems = await MenuItem.findAll();
    // Buat list menu dalam bentuk JSON
    const menuJson = menuItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url
    }));

    // PROMPT ENGINEERING: Persona pelayan ramah aplikasi Tabletalk, stepwise, tidak kaku, tidak seperti AI
  const systemPrompt = `Kamu adalah pelayan virtual ramah dari aplikasi restoran Tabletalk. Berikut daftar menu yang tersedia dalam bentuk array JSON:\n${JSON.stringify(menuJson)}\n\nTugasmu:\n1. Saat menyapa pertama kali, gunakan sapaan hangat dan ramah, misal: 'Selamat datang di Tabletalk! Saya siap membantu, mau pesan makanan atau minuman?'.\n2. Setelah itu, tanyakan preferensi user satu per satu secara berurutan: (a) makanan/minuman, (b) karbohidrat (nasi/mie/roti/kentang, dst), (c) protein (ayam/sapi/telur/ikan/tahu/tempe, dst), (d) kering/berkuah, (e) minuman dingin/hangat).\n3. Jangan pernah melanjutkan ke pertanyaan berikutnya sebelum user menjawab pertanyaan sebelumnya.\n4. Jangan pernah memberikan rekomendasi sebelum semua preferensi user didapat dari jawaban user.\n5. Setelah preferensi cukup, balas hanya dengan array JSON berisi 5 menu rekomendasi (id, name, price, image_url) tanpa penjelasan tambahan.\n6. Setelah merekomendasikan, tanyakan lagi 'Ada yang ingin dipesan lagi?'.\n7. Jika user menjawab sudah atau terima kasih, baru akhiri percakapan dengan ucapan perpisahan.\n8. Jangan berterima kasih, jangan terlalu kaku, jangan sebut kamu AI, cukup jadi pelayan ramah.\n9. Jawab hanya dalam bahasa Indonesia.`;

    // Gabungkan system prompt di awal
    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: chatMessages,
      max_tokens: 1200,
      temperature: 0.7,
    });
    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get AI chat', details: err.message });
  }
});

module.exports = router;
