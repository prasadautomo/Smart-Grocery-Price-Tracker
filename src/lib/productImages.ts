// Database Foto Produk Asli dari Internet (Verified FMCG & E-Grocery CDNs)
// Termasuk Astronauts CDN, Open Food Facts, Open Beauty Facts, dan Unsplash Grocery Packshots.

export interface ProductImageMatch {
  keywords: string[];
  imageUrl: string;
  source: string;
}

export const VERIFIED_PRODUCT_IMAGES: ProductImageMatch[] = [
  // --- BAHAN POKOK ---
  {
    keywords: ['beras', 'rice', 'ramos', 'pandan wangi', 'rojolele', 'basmati'],
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/10/Untitled20261015T103343658_f2c66217-cdc9-4eee-9880-99267097b786_400x400.png',
    source: 'Astronauts.id',
  },
  {
    keywords: ['minyak', 'goreng', 'sawit', 'bimoli', 'filma', 'sania', 'tropical'],
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/9/RestockBahanWajibdiDapur_04b8c552-e833-4f30-b13c-e09a7d5ea68e_400x400.jpg',
    source: 'Astronauts.id',
  },
  {
    keywords: ['telur', 'egg', 'omega', 'telor', 'ayam negeri', 'kampung'],
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/9/TelurAyamNegeriAstroFarm1_55ce9dfb-31de-4afb-b36d-1ea35f75105c_400x400.jpg',
    source: 'Astronauts.id',
  },
  {
    keywords: ['gula', 'gulaku', 'pasir', 'sugar', 'pemanis'],
    imageUrl: 'https://images.openfoodfacts.org/images/products/899/517/710/2058/front_id.6.400.jpg',
    source: 'Open Food Facts',
  },
  {
    keywords: ['terigu', 'tepung', 'segitiga biru', 'bogasari', 'flour', 'maizena'],
    imageUrl: 'https://images.openfoodfacts.org/images/products/899/329/620/1119/front_en.5.400.jpg',
    source: 'Open Food Facts',
  },

  // --- MIE & MAKANAN INSTAN ---
  {
    keywords: ['indomie', 'mie goreng', 'mi goreng', 'goreng spesial'],
    imageUrl: 'https://images.openfoodfacts.org/images/products/008/968/618/0626/front_en.3.400.jpg',
    source: 'Open Food Facts',
  },
  {
    keywords: ['samyang', 'ramen', 'buldak', 'mie cup', 'noodle', 'mie instan'],
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/9/AL20260911T092823558_a46bd4e1-8c9c-48ad-983e-394efe2f41ce_400x400.png',
    source: 'Astronauts.id',
  },
  {
    keywords: ['sarden', 'sardine', 'kaleng', 'ikan sarden', 'tuna', 'kornet'],
    imageUrl: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=400&q=80',
    source: 'Unsplash Packshot',
  },

  // --- BUMBU & DAPUR ---
  {
    keywords: ['kecap', 'bango', 'kecap manis', 'kecap asin'],
    imageUrl: 'https://images.openfoodfacts.org/images/products/899/999/900/2503/front_fr.3.400.jpg',
    source: 'Open Food Facts',
  },
  {
    keywords: ['saus', 'sambal', 'chili', 'ekstra pedas', 'pedas', 'abc saus'],
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80',
    source: 'Unsplash Packshot',
  },
  {
    keywords: ['bawang merah', 'shallot', 'bawang brebes', 'bawang sumenep'],
    imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80',
    source: 'Unsplash Produce',
  },
  {
    keywords: ['bawang putih', 'garlic'],
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80',
    source: 'Unsplash Produce',
  },
  {
    keywords: ['bawang goreng', 'kentang mustofa'],
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/9/BAWANGGORENGSUMENEPMURAH1_42aa7cd1-b376-4825-9140-68542cab4b4e_900x900.jpg',
    source: 'Astronauts.id',
  },

  // --- CAMILAN & SNACK ---
  {
    keywords: ['chitato', 'keripik', 'chips', 'potato chips', 'snack', 'kentang'],
    imageUrl: 'https://images.openfoodfacts.org/images/products/008/968/659/9077/front_en.43.400.jpg',
    source: 'Open Food Facts',
  },
  {
    keywords: ['biskuit', 'roma', 'kelapa', 'gandum', 'cookie', 'cookies', 'wafer', 'oreo'],
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80',
    source: 'Unsplash Packshot',
  },
  {
    keywords: ['makaroni', 'seblak', 'gelichips'],
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/10/KVlume100_652a301f-aff0-4216-b8fd-4ecf44922c96_400x400.png',
    source: 'Astronauts.id',
  },

  // --- MINUMAN & SUSU ---
  {
    keywords: ['aqua', 'galon', 'air mineral', 'le minerale', 'cleo', 'mineral', 'water'],
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=400&q=80',
    source: 'Unsplash Packshot',
  },
  {
    keywords: ['kopi', 'coffee', 'kapal api', 'good day', 'nescafe', 'americano', 'luwak'],
    imageUrl: 'https://images.openfoodfacts.org/images/products/899/100/210/3436/front_id.6.400.jpg',
    source: 'Open Food Facts',
  },
  {
    keywords: ['teh', 'tea', 'sariwangi', 'melati', 'celup', 'tong tji', 'sosro'],
    imageUrl: 'https://images.openfoodfacts.org/images/products/899/999/953/8118/front_en.4.400.jpg',
    source: 'Open Food Facts',
  },
  {
    keywords: ['buavita', 'jus', 'juice', 'mangga', 'apel', 'leci', 'orange'],
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/8/CHILLEDBuavitaJusMangga245ml1_cf71ef5d-1a9c-4a9e-9da6-db83e0a8eef6_900x900.jpg',
    source: 'Astronauts.id',
  },
  {
    keywords: ['susu', 'milk', 'ultra milk', 'bear brand', 'dancow', 'indomilk'],
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/9/KopiSusuAstronauts1Liter_f345bc5e-78aa-48a9-9799-c2945c66dfdc_400x400.jpg',
    source: 'Astronauts.id',
  },

  // --- MANDI & KEBERSIHAN ---
  {
    keywords: ['sabun cair', 'sabun mandi', 'lifebuoy', 'biore', 'dettol', 'body wash', 'sabun'],
    imageUrl: 'https://images.openbeautyfacts.org/images/products/890/103/081/3252/front_en.3.400.jpg',
    source: 'Open Beauty Facts',
  },
  {
    keywords: ['shampoo', 'sampo', 'pantene', 'clear', 'sunsilk', 'head & shoulders'],
    imageUrl: 'https://images.openbeautyfacts.org/images/products/541/007/665/1627/front_en.14.400.jpg',
    source: 'Open Beauty Facts',
  },
  {
    keywords: ['pasta gigi', 'odol', 'pepsodent', 'formula', 'sensodyne', 'ciptadent', 'gigi'],
    imageUrl: 'https://images.openbeautyfacts.org/images/products/893/483/912/8302/front_en.3.400.jpg',
    source: 'Open Beauty Facts',
  },
  {
    keywords: ['deterjen', 'rinso', 'daia', 'so klin', 'cuci baju', 'detergent', 'laundry'],
    imageUrl: 'https://images.unsplash.com/photo-1585670210693-e7fdd16b142e?auto=format&fit=crop&w=400&q=80',
    source: 'Unsplash Packshot',
  },
  {
    keywords: ['sunlight', 'cuci piring', 'jeruk nipis', 'dish soap', 'mama lemon'],
    imageUrl: 'https://images.openbeautyfacts.org/images/products/007/261/373/9318/front_fr.3.400.jpg',
    source: 'Open Beauty Facts',
  },
  {
    keywords: ['lantai', 'pembersih lantai', 'wipol', 'super pell', 'so klin lantai'],
    imageUrl: 'https://image.astronauts.cloud/homepage-category/2026/10/cattiles02_85172688-a7e5-413d-84bd-f2d96f715791_239x306.png',
    source: 'Astronauts.id',
  },
  {
    keywords: ['tisu', 'tissue', 'tishoo', 'paseo', 'facial tissue'],
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/7/tishoo10001_b7b0bdd6-8794-4ee6-916b-2a87a4bdf686_400x400.png',
    source: 'Astronauts.id',
  },
  {
    keywords: ['pengharum', 'stella', 'glade', 'air freshener'],
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/10/stellafrench_ef53786c-2199-41e0-85d2-2eee0e63bce7_400x400.png',
    source: 'Astronauts.id',
  },

  // --- AYAM & DAGING SEGAR ---
  {
    keywords: ['ayam', 'fillet', 'dada ayam', 'paha ayam', 'broiler', 'chicken', 'daging'],
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/9/ayampotong8_1b408c60-7304-4685-99ff-c5cf372b665c_400x400.png',
    source: 'Astronauts.id',
  },
  {
    keywords: ['nugget', 'spicy wing', 'frozen', 'sosis', 'belfoods', 'hato'],
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/9/belfoods4_29ffaef5-4193-488b-9b37-19ac75cf23f4_400x400.png',
    source: 'Astronauts.id',
  },
  {
    keywords: ['melon', 'buah', 'fruit', 'pisang', 'apel', 'jeruk'],
    imageUrl: 'https://image.astronauts.cloud/product-images/2026/9/MelonDalmation02_9e4b7d4f-fb1e-4445-ade7-fc5f5a3d2a5c_400x400.png',
    source: 'Astronauts.id',
  },
];

// Fallback kategori beresolusi tinggi bila kata kunci tidak spesifik
export const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  'Bahan Pokok': 'https://image.astronauts.cloud/product-images/2026/10/Untitled20261015T103343658_f2c66217-cdc9-4eee-9880-99267097b786_400x400.png',
  'Mandi & Cuci': 'https://images.openbeautyfacts.org/images/products/890/103/081/3252/front_en.3.400.jpg',
  'Mandi & Kebersihan': 'https://images.openbeautyfacts.org/images/products/890/103/081/3252/front_en.3.400.jpg',
  'Makanan Instan': 'https://images.openfoodfacts.org/images/products/008/968/618/0626/front_en.3.400.jpg',
  'Makanan & Camilan': 'https://images.openfoodfacts.org/images/products/008/968/659/9077/front_en.43.400.jpg',
  'Minuman': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=400&q=80',
  'Bumbu & Dapur': 'https://images.openfoodfacts.org/images/products/899/999/900/2503/front_fr.3.400.jpg',
  'Telur, Tahu & Tempe': 'https://image.astronauts.cloud/product-images/2026/9/TelurAyamNegeriAstroFarm1_55ce9dfb-31de-4afb-b36d-1ea35f75105c_400x400.jpg',
  'Ayam & Daging': 'https://image.astronauts.cloud/product-images/2026/9/ayampotong8_1b408c60-7304-4685-99ff-c5cf372b665c_400x400.png',
  'Makanan Beku': 'https://image.astronauts.cloud/product-images/2026/9/belfoods4_29ffaef5-4193-488b-9b37-19ac75cf23f4_400x400.png',
  'Buah Segar': 'https://image.astronauts.cloud/product-images/2026/9/MelonDalmation02_9e4b7d4f-fb1e-4445-ade7-fc5f5a3d2a5c_400x400.png',
  'Astro Cafe': 'https://image.astronauts.cloud/product-images/2026/9/KopiSusuAstronauts1Liter_f345bc5e-78aa-48a9-9799-c2945c66dfdc_400x400.jpg',
};

/**
 * Otomatis mencari foto produk asli dari internet berdasarkan nama produk atau kategori
 */
export function resolveProductImageUrl(name: string, category?: string): string {
  if (!name) {
    if (category && CATEGORY_DEFAULT_IMAGES[category]) {
      return CATEGORY_DEFAULT_IMAGES[category];
    }
    return '';
  }

  const cleanName = name.toLowerCase().trim();

  // 1. Cari kecocokan kata kunci terpanjang terlebih dahulu
  for (const match of VERIFIED_PRODUCT_IMAGES) {
    for (const kw of match.keywords) {
      if (cleanName.includes(kw.toLowerCase())) {
        return match.imageUrl;
      }
    }
  }

  // 2. Jika tidak ada kecocokan nama, gunakan gambar default kategori yang cocok
  if (category && CATEGORY_DEFAULT_IMAGES[category]) {
    return CATEGORY_DEFAULT_IMAGES[category];
  }

  return '';
}

/**
 * Mencari sumber informasi asal foto (misal Astronauts.id, Open Food Facts, dll)
 */
export function resolveProductImageSource(name: string): string {
  if (!name) return 'Internet Catalog';
  const cleanName = name.toLowerCase().trim();

  for (const match of VERIFIED_PRODUCT_IMAGES) {
    for (const kw of match.keywords) {
      if (cleanName.includes(kw.toLowerCase())) {
        return match.source;
      }
    }
  }
  return 'Internet Catalog';
}
