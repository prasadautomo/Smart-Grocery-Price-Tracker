import type {
  GroceryItem,
  ItemCalculatedPrice,
  PriceComparison,
  UnitComparisonResult,
} from '../types/grocery';

/**
 * Format angka ke format mata uang Rupiah Indonesia (Rp xx.xxx)
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Hitung harga per item setelah memperhitungkan diskon tunggal, diskon bertingkat (stacked), atau nominal
 * Memenuhi spesifikasi F-02 dan F-03
 */
export function calculateItemPrice(item: GroceryItem): ItemCalculatedPrice {
  const qty = Math.max(0, Number(item.quantity) || 0);
  const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
  const baseTotal = qty * unitPrice;

  let discountedUnitPrice = unitPrice;

  if (item.discountType === 'single') {
    const p1 = Math.min(100, Math.max(0, Number(item.discountPercent1) || 0));
    discountedUnitPrice = unitPrice * (1 - p1 / 100);
  } else if (item.discountType === 'stacked') {
    // Logika Diskon Bertingkat (F-03):
    // Contoh 50% + 20%: Harga awal didiskon 50%, lalu sisanya didiskon lagi 20%
    const p1 = Math.min(100, Math.max(0, Number(item.discountPercent1) || 0));
    const p2 = Math.min(100, Math.max(0, Number(item.discountPercent2) || 0));
    const afterFirstDiscount = unitPrice * (1 - p1 / 100);
    discountedUnitPrice = afterFirstDiscount * (1 - p2 / 100);
  } else if (item.discountType === 'nominal') {
    const nominal = Math.max(0, Number(item.discountNominal) || 0);
    discountedUnitPrice = Math.max(0, unitPrice - nominal);
  }

  // Bulatkan agar tidak ada koma aneh pada mata uang
  discountedUnitPrice = Math.round(discountedUnitPrice * 100) / 100;
  const finalTotal = Math.round(qty * discountedUnitPrice);
  const totalDiscountAmount = Math.max(0, baseTotal - finalTotal);
  const effectiveDiscountRate = baseTotal > 0 ? (totalDiscountAmount / baseTotal) * 100 : 0;

  return {
    baseTotal,
    discountedUnitPrice,
    finalTotal,
    totalDiscountAmount,
    effectiveDiscountRate: Math.round(effectiveDiscountRate * 10) / 10,
  };
}

/**
 * Komparator Harga Realtime vs Bulan Lalu (F-04)
 * Menghasilkan tren Naik (Merah), Turun (Hijau), Setara (Stabil), atau Baru
 */
export function compareWithLastMonth(
  currentUnitPrice: number,
  lastMonthPrice?: number | null
): PriceComparison {
  if (lastMonthPrice === undefined || lastMonthPrice === null || lastMonthPrice <= 0) {
    return {
      trend: 'new',
      difference: 0,
      percentChange: 0,
    };
  }

  const diff = currentUnitPrice - lastMonthPrice;
  const percentChange = (diff / lastMonthPrice) * 100;

  // Toleransi perbedaan Rp 10 untuk rounding
  if (Math.abs(diff) < 10) {
    return {
      trend: 'equal',
      difference: 0,
      percentChange: 0,
    };
  }

  return {
    trend: diff > 0 ? 'up' : 'down',
    difference: diff,
    percentChange: Math.round(percentChange * 10) / 10,
  };
}

/**
 * Kalkulator Perbandingan Kemasan Unit (Unit Price Comparison)
 * Membantu Rian memutuskan: Minyak 1L Rp 18.000 x 3 vs Jerigen 5L Rp 85.000
 */
export function compareUnitPricing(
  prodA: { name: string; volume: number; unit: string; price: number },
  prodB: { name: string; volume: number; unit: string; price: number }
): UnitComparisonResult {
  const volA = Math.max(0.001, Number(prodA.volume) || 1);
  const priceA = Math.max(0, Number(prodA.price) || 0);
  const pricePerUnitA = priceA / volA;

  const volB = Math.max(0.001, Number(prodB.volume) || 1);
  const priceB = Math.max(0, Number(prodB.price) || 0);
  const pricePerUnitB = priceB / volB;

  let cheaperOption: 'A' | 'B' | 'EQUAL' = 'EQUAL';
  let diff = Math.abs(pricePerUnitA - pricePerUnitB);
  let higherPrice = Math.max(pricePerUnitA, pricePerUnitB);
  let savingsPercent = higherPrice > 0 ? (diff / higherPrice) * 100 : 0;

  if (Math.abs(pricePerUnitA - pricePerUnitB) < 1) {
    cheaperOption = 'EQUAL';
  } else if (pricePerUnitA < pricePerUnitB) {
    cheaperOption = 'A';
  } else {
    cheaperOption = 'B';
  }

  return {
    productA: {
      ...prodA,
      pricePerUnit: Math.round(pricePerUnitA),
    },
    productB: {
      ...prodB,
      pricePerUnit: Math.round(pricePerUnitB),
    },
    cheaperOption,
    savingsPercent: Math.round(savingsPercent * 10) / 10,
    savingsNominalPerUnit: Math.round(diff),
  };
}

/**
 * Menghitung status keselamatan anggaran (Budget Safety Cap - F-05)
 */
export function getBudgetSafetyStatus(
  currentTotal: number,
  budgetLimit: number,
  warningPercent = 80
): {
  status: 'SAFE' | 'WARNING' | 'DANGER';
  percentage: number;
  remaining: number;
  label: string;
  advice: string;
} {
  const limit = Math.max(1, budgetLimit);
  const percentage = Math.min(200, Math.round((currentTotal / limit) * 100));
  const remaining = budgetLimit - currentTotal;

  if (currentTotal > limit) {
    return {
      status: 'DANGER',
      percentage,
      remaining,
      label: 'OVER BUDGET!',
      advice: `Tagihan melebihi dompet sebesar ${formatRupiah(Math.abs(remaining))}. Kurangi barang sebelum ke kasir!`,
    };
  }

  if (percentage >= warningPercent) {
    return {
      status: 'WARNING',
      percentage,
      remaining,
      label: 'Mendekati Limit',
      advice: `Sisa anggaran tinggal ${formatRupiah(remaining)} (${100 - percentage}%). Cermati barang berikutnya.`,
    };
  }

  return {
    status: 'SAFE',
    percentage,
    remaining,
    label: 'Saldo Aman',
    advice: `Belanja terkendali. Sisa anggaran aman sebesar ${formatRupiah(remaining)}.`,
  };
}

/**
 * Format daftar belanjaan menjadi teks rapi untuk dibagikan ke WhatsApp / Clipboard
 */
export function formatGroceryListForSharing(
  items: GroceryItem[],
  totalSpent: number,
  budgetLimit?: number
): string {
  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  let text = `🛒 *CATATAN BELANJA - SMART GROCERY*\n`;
  text += `📅 ${dateStr}\n`;
  text += `💰 Estimasi Total: *${formatRupiah(totalSpent)}*`;
  if (budgetLimit && budgetLimit > 0) {
    text += ` (Limit: ${formatRupiah(budgetLimit)})`;
  }
  text += `\n━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Kelompokkan per kategori
  const grouped: Record<string, GroceryItem[]> = {};
  items.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  Object.entries(grouped).forEach(([cat, catItems]) => {
    text += `*📂 ${cat.toUpperCase()}*\n`;
    catItems.forEach((item) => {
      const calc = calculateItemPrice(item);
      const checkMark = item.isCheckedInCart ? '✅' : '⬜';
      const prioMark = item.priority === 'optional' ? ' _(Jajan)_' : '';
      text += `${checkMark} ${item.name} (${item.quantity} ${item.unit}) - ${formatRupiah(calc.finalTotal)}${prioMark}\n`;
    });
    text += `\n`;
  });

  text += `━━━━━━━━━━━━━━━━━━━━\n`;
  text += `💡 _Dibuat dengan Smart Grocery & Price Tracker (PWA)_`;
  return text;
}

/**
 * Rekomendasi Pangkas Otomatis untuk Barang Jajan/Opsional jika Over-Budget
 */
export function getTrimRecommendations(
  items: GroceryItem[],
  currentSpent: number,
  budgetLimit: number
): {
  optionalItems: GroceryItem[];
  totalOptionalAmount: number;
  newSpentIfDropped: number;
  isBackInBudget: boolean;
} {
  const optionalItems = items.filter((i) => i.priority === 'optional');
  let totalOptionalAmount = 0;
  optionalItems.forEach((item) => {
    const calc = calculateItemPrice(item);
    totalOptionalAmount += calc.finalTotal;
  });

  const newSpentIfDropped = Math.max(0, currentSpent - totalOptionalAmount);
  const isBackInBudget = newSpentIfDropped <= budgetLimit;

  return {
    optionalItems,
    totalOptionalAmount,
    newSpentIfDropped,
    isBackInBudget,
  };
}

/**
 * Menghitung Total Biaya Kasir Realtime (Belanja + Kantong + Parkir + PPN)
 */
export function calculateCashierGrandTotal(
  subtotal: number,
  bagFee = 0,
  parkingFee = 0,
  taxPercent = 0
): {
  subtotal: number;
  bagFee: number;
  parkingFee: number;
  taxPercent: number;
  taxAmount: number;
  extraTotal: number;
  grandTotal: number;
} {
  const safeSubtotal = Math.max(0, subtotal);
  const safeBag = Math.max(0, bagFee);
  const safeParking = Math.max(0, parkingFee);
  const safeTaxPercent = Math.max(0, Math.min(100, taxPercent));
  const taxAmount = Math.round((safeSubtotal * safeTaxPercent) / 100);
  const extraTotal = safeBag + safeParking + taxAmount;
  const grandTotal = safeSubtotal + extraTotal;

  return {
    subtotal: safeSubtotal,
    bagFee: safeBag,
    parkingFee: safeParking,
    taxPercent: safeTaxPercent,
    taxAmount,
    extraTotal,
    grandTotal,
  };
}

