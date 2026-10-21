import fs from 'fs';

const categories = [
  { slug: 'kebutuhan-pokok-2721', name: 'Bahan Pokok' },
  { slug: 'telur-tahu-tempe-7184', name: 'Telur, Tahu & Tempe' },
  { slug: 'susu-olahan-susu-2911', name: 'Susu & Olahan Susu' },
  { slug: 'snack-3615', name: 'Makanan & Camilan' },
  { slug: 'minuman-2768', name: 'Minuman' },
  { slug: 'buah-segar-7176', name: 'Buah Segar' },
  { slug: 'sayur-segar-7171', name: 'Sayur Segar' },
  { slug: 'bahan-masak-bumbu-2697', name: 'Bumbu & Dapur' },
  { slug: 'perawatan-rumah-3588', name: 'Mandi & Kebersihan' },
  { slug: 'astro-cafe-2458', name: 'Astro Cafe' },
  { slug: 'makanan-beku-2763', name: 'Makanan Beku' },
  { slug: 'ayam-unggas-7179', name: 'Ayam & Daging' }
];

async function scrapeAll() {
  const allProducts = [];
  const seenNames = new Set();

  for (const cat of categories) {
    const url = `https://www.astronauts.id/category/${cat.slug}`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }
      });
      const html = await res.text();

      // Look for individual product patterns by finding every product_name
      const namePattern = /\\*"product_name\\*"\s*:\s*\\*"([^"\\]+)\\*"/g;
      let nm;
      let count = 0;

      while ((nm = namePattern.exec(html)) !== null) {
        const name = nm[1];
        if (seenNames.has(name.toLowerCase())) continue;

        // Take a window of 3000 chars around this product to grab its fields
        const start = Math.max(0, nm.index - 500);
        const end = Math.min(html.length, nm.index + 2500);
        const windowText = html.slice(start, end);

        const priceM = windowText.match(/\\*"product_price\\*"\s*:\s*\\*"(\d+)\\*"/);
        const imgM = windowText.match(/https:\\*\/\\*\/image\.astronauts\.cloud\\*\/product-images\\*\/[^\s"',\\]+\.(jpg|jpeg|png|webp)/i);
        const discPriceM = windowText.match(/\\*"product_discount_price\\*"\s*:\s*\\*"(\d+)\\*"/);
        const discPctM = windowText.match(/\\*"product_discount_percentage\\*"\s*:\s*\\*"([^"\\]+)\\*"/);
        const gramM = windowText.match(/\\*"product_grammation_label\\*"\s*:\s*\\*"([^"\\]+)\\*"/);

        if (priceM && imgM) {
          const rawPrice = parseInt(priceM[1], 10);
          const discPrice = discPriceM && parseInt(discPriceM[1], 10) > 0 ? parseInt(discPriceM[1], 10) : undefined;
          const cleanImg = imgM[0].replace(/\\/g, '');

          let unit = 'pcs';
          if (gramM && gramM[1]) {
            unit = gramM[1];
          } else if (name.toLowerCase().includes('kg')) {
            unit = 'kg';
          } else if (name.toLowerCase().includes('liter') || name.toLowerCase().includes('1l') || name.toLowerCase().includes('2l')) {
            unit = 'liter';
          } else if (name.toLowerCase().includes('botol')) {
            unit = 'botol';
          } else if (name.toLowerCase().includes('pack')) {
            unit = 'pack';
          }

          seenNames.add(name.toLowerCase());
          allProducts.push({
            id: `astro-prod-${allProducts.length + 1}`,
            name,
            category: cat.name,
            unitPrice: discPrice || rawPrice,
            originalPrice: discPrice ? rawPrice : undefined,
            lastMonthPrice: discPrice ? rawPrice : Math.round(rawPrice * 0.95), // realistic benchmark
            discountType: discPrice ? 'nominal' : 'none',
            discountNominal: discPrice ? (rawPrice - discPrice) : 0,
            discountPercent: discPctM && discPctM[1] ? discPctM[1] : undefined,
            unit,
            imageUrl: cleanImg,
            source: 'Astronauts.id',
            priority: (cat.name === 'Makanan & Camilan' || cat.name === 'Astro Cafe') ? 'optional' : 'essential'
          });
          count++;
        }
      }
      console.log(`✅ ${cat.name}: parsed ${count} unique products`);
    } catch (e) {
      console.error(`❌ Error in ${cat.name}:`, e.message);
    }
  }

  console.log(`\n🎉 Total unique products parsed from Astronauts.id: ${allProducts.length}`);
  fs.writeFileSync('astro_catalog.json', JSON.stringify(allProducts, null, 2), 'utf8');
}

scrapeAll();
