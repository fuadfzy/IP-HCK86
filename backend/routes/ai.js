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
    
    // Extract keywords from conversation to help with filtering
    const conversationText = messages.map(msg => msg.content).join(' ').toLowerCase();
    let filteredMenuItems = menuItems;
    
    // Define keyword mappings for better filtering
    const keywordMappings = {
      'ayam': ['ayam', 'chicken', 'geprek', 'bakar', 'goreng', 'kremes'],
      'sapi': ['sapi', 'beef', 'rendang', 'steak', 'daging'],
      'ikan': ['ikan', 'fish', 'lele', 'nila', 'tuna', 'salmon', 'gurame', 'bawal'],
      'nasi': ['nasi', 'rice'],
      'mie': ['mie', 'mee', 'noodle', 'bakmi', 'ramen'],
      'kwetiaw': ['kwetiaw', 'kwetiau', 'kway teow', 'kuey teow'],
      'tahu': ['tahu', 'tofu'],
      'tempe': ['tempe', 'tempeh'],
      'telur': ['telur', 'egg', 'dadar'],
      'udang': ['udang', 'shrimp', 'prawn'],
      'cumi': ['cumi', 'squid'],
      'bebek': ['bebek', 'duck']
    };
    
    // Check if user mentioned specific protein/ingredient
    for (const [keyword, variants] of Object.entries(keywordMappings)) {
      if (conversationText.includes(keyword)) {
        filteredMenuItems = menuItems.filter(item => 
          variants.some(variant => 
            item.name.toLowerCase().includes(variant)
          )
        );
        break; // Use first matching category
      }
    }
    
    // Buat list menu dalam bentuk JSON (gunakan filtered items jika ada keyword match)
    const menuJson = filteredMenuItems.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url
    }));

    // PROMPT ENGINEERING: Persona pelayan ramah aplikasi Tabletalk, stepwise, tidak kaku, tidak seperti AI
  const systemPrompt = `Kamu adalah pelayan virtual ramah dari aplikasi restoran Tabletalk. Berikut daftar menu yang tersedia dalam bentuk array JSON:\n${JSON.stringify(menuJson)}\n\nTugasmu:\n1. Saat menyapa pertama kali, gunakan sapaan hangat dan ramah, misal: 'Selamat datang di Tabletalk! Saya siap membantu, mau pesan makanan atau minuman?'.\n2. Setelah itu, tanyakan preferensi user satu per satu secara berurutan: (a) makanan/minuman, (b) karbohidrat (nasi/mie/roti/kentang, dst), (c) protein (ayam/sapi/telur/ikan/tahu/tempe, dst), (d) kering/berkuah, (e) minuman dingin/hangat).\n3. Jangan pernah melanjutkan ke pertanyaan berikutnya sebelum user menjawab pertanyaan sebelumnya.\n4. Jangan pernah memberikan rekomendasi sebelum semua preferensi user didapat dari jawaban user.\n5. PENTING: Saat memberikan rekomendasi, WAJIB filter menu berdasarkan keyword yang disebutkan user:\n   - Jika user bilang "ayam", hanya rekomendasikan menu yang nama-nya mengandung kata: "ayam", "chicken", "geprek", "bakar", "goreng" (yang berkaitan dengan ayam)\n   - Jika user bilang "sapi", hanya rekomendasikan menu yang nama-nya mengandung kata: "sapi", "beef", "rendang", "gudeg" (yang berkaitan dengan sapi)\n   - Jika user bilang "ikan", hanya rekomendasikan menu yang nama-nya mengandung kata: "ikan", "fish", "lele", "nila", "tuna", "salmon"\n   - Jika user bilang "nasi", hanya rekomendasikan menu yang nama-nya mengandung kata: "nasi", "rice"\n   - Jika user bilang "mie", hanya rekomendasikan menu yang nama-nya mengandung kata: "mie", "mee", "noodle", "bakmi"\n   - Jika user bilang "kwetiaw", hanya rekomendasikan menu yang nama-nya mengandung kata: "kwetiaw", "kwetiau", "kway teow"\n   - Dan seterusnya untuk keyword lainnya\n6. WAJIB: Pastikan TIDAK ADA DUPLIKASI dalam rekomendasi. Setiap menu hanya boleh muncul sekali saja. Periksa ID menu untuk memastikan tidak ada yang sama.\n7. Setelah preferensi cukup, balas hanya dengan array JSON berisi maksimal 5 menu rekomendasi UNIK (id, name, price, image_url) yang BENAR-BENAR sesuai keyword tanpa penjelasan tambahan.\n8. Setelah merekomendasikan, tanyakan lagi 'Ada yang ingin dipesan lagi?'.\n9. Jika user menjawab sudah atau terima kasih, baru akhiri percakapan dengan ucapan perpisahan.\n10. Jangan berterima kasih, jangan terlalu kaku, jangan sebut kamu AI, cukup jadi pelayan ramah.\n11. Jawab hanya dalam bahasa Indonesia.\n12. JANGAN PERNAH merekomendasikan menu yang tidak sesuai dengan keyword yang disebutkan user.\n13. JANGAN PERNAH memberikan menu duplikat dalam satu rekomendasi.`;

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
    
    let aiResponse = completion.choices[0].message.content;
    
    // Post-process to remove duplicates if AI returned JSON recommendations
    try {
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const recommendations = JSON.parse(jsonMatch[0]);
        if (Array.isArray(recommendations)) {
          // Remove duplicates based on ID
          const uniqueRecommendations = recommendations.filter((item, index, self) => 
            index === self.findIndex(t => t.id === item.id)
          );
          
          // Replace the original JSON with deduplicated version
          aiResponse = aiResponse.replace(jsonMatch[0], JSON.stringify(uniqueRecommendations));
        }
      }
    } catch (e) {
      // If not valid JSON, keep original response
    }
    
    res.json({ reply: aiResponse });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get AI chat', details: err.message });
  }
});

module.exports = router;
