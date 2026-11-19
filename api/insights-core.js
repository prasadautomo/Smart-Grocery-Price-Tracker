const DEFAULT_BUDGET_LIMIT = 350000;
const MAX_CART_ITEMS = 500;

function toFiniteNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getDiscountedUnitPrice(price, discountRaw) {
  if (!discountRaw || typeof discountRaw !== 'string') return price;
  const discount = discountRaw.trim().toLowerCase();
  if (!discount) return price;

  if (discount.includes('buy 2 get 1') || discount.includes('beli 2 gratis 1')) {
    return Math.round((price * 2) / 3);
  }

  const nominalMatch = discount.match(/^-?\s*(?:rp\s*)?([\d.]+)$/);
  if (nominalMatch) {
    const nominal = Number(nominalMatch[1].replace(/\./g, ''));
    return nominal > 0 && nominal < price ? price - nominal : price;
  }

  const percentages = discount.split('+')
    .map(part => Number.parseFloat(part.replace(/[^0-9.]/g, '')))
    .filter(Number.isFinite);
  if (!percentages.length || percentages.some(value => value < 0 || value > 100)) return price;

  let finalPrice = price;
  for (const percentage of percentages) finalPrice *= 1 - (percentage / 100);
  return Math.max(0, Math.round(finalPrice));
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('Payload analitik harus berupa objek.');
  }
  if (!Array.isArray(payload.cart)) {
    throw new TypeError('Daftar barang tidak valid.');
  }
  if (payload.cart.length > MAX_CART_ITEMS) {
    throw new RangeError(`Jumlah barang maksimal ${MAX_CART_ITEMS}.`);
  }
  return payload;
}

export function createBasketInsight(payload) {
  validatePayload(payload);

  const budgetInput = toFiniteNumber(payload.budgetLimit, DEFAULT_BUDGET_LIMIT);
  const budgetLimit = budgetInput > 0 ? budgetInput : DEFAULT_BUDGET_LIMIT;
  const purchasedItems = payload.cart.filter(item => item?.inPhysicalCart === true);
  const categoryTotals = new Map();
  let totalSpent = 0;

  let itemsIncreased = 0;
  let itemsDecreased = 0;
  let itemsStable = 0;
  let totalItemsCompared = 0;
  let netInflationAmount = 0;
  let positiveInflationAmount = 0;

  for (const item of purchasedItems) {
    const price = toFiniteNumber(item.price, Number.NaN);
    const quantity = toFiniteNumber(item.qty, Number.NaN);
    if (!Number.isFinite(price) || price <= 0) {
      throw new TypeError('Harga barang yang dipilih harus lebih dari nol.');
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new TypeError('Jumlah barang yang dipilih harus berupa bilangan bulat positif.');
    }

    const finalUnitPrice = getDiscountedUnitPrice(price, item.discountRaw);
    const lineCost = finalUnitPrice * quantity;
    totalSpent += lineCost;

    const category = typeof item.category === 'string' && item.category.trim()
      ? item.category.trim().slice(0, 80)
      : 'Lainnya';
    categoryTotals.set(category, (categoryTotals.get(category) || 0) + lineCost);

    const previousPrice = toFiniteNumber(item.lastMonthPrice, 0);
    if (previousPrice > 0) {
      totalItemsCompared++;
      const difference = price - previousPrice;
      netInflationAmount += difference * quantity;
      if (difference > 0) {
        itemsIncreased++;
        positiveInflationAmount += difference * quantity;
      } else if (difference < 0) {
        itemsDecreased++;
      } else {
        itemsStable++;
      }
    }
  }

  const categoryAllocation = Object.fromEntries(
    [...categoryTotals].map(([category, spent]) => [category, {
      spent,
      percentage: totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0
    }])
  );
  const netInflationPct = totalSpent > 0
    ? Number(((netInflationAmount / totalSpent) * 100).toFixed(1))
    : 0;

  const ratio = totalSpent / budgetLimit;
  let status = 'SAFE';
  let healthScore = Math.round(100 - ratio * 20);
  if (ratio > 1) {
    status = 'DANGER';
    healthScore = Math.max(20, Math.round(75 - (ratio - 1) * 150));
  } else if (ratio >= 0.9) {
    status = 'WARNING';
    healthScore = Math.round(90 - (ratio - 0.9) * 150);
  }
  healthScore = Math.min(100, Math.max(0, healthScore));

  const recommendations = [];
  if (status === 'DANGER') {
    const deficit = totalSpent - budgetLimit;
    recommendations.push({
      type: 'WARNING',
      title: 'Defisit Anggaran Terdeteksi',
      description: `Keranjang Anda melebihi batas dompet sebesar Rp ${deficit.toLocaleString('id-ID')}. Pertimbangkan mengurangi barang sekunder atau kuantitasnya.`,
      estimatedSavings: deficit
    });
  }

  if (itemsIncreased > 0) {
    recommendations.push({
      type: 'SAVINGS',
      title: 'Kenaikan Harga Terdeteksi (F-04)',
      description: `Terdapat ${itemsIncreased} barang yang naik harga dibanding bulan lalu. Dampak kenaikan pada barang terpilih sebesar Rp ${positiveInflationAmount.toLocaleString('id-ID')}.`,
      estimatedSavings: positiveInflationAmount
    });
  }

  const nonEssentialSpent = (categoryTotals.get('Makanan & Minuman') || 0)
    + (categoryTotals.get('Lainnya') || 0);
  if (nonEssentialSpent > budgetLimit * 0.4 && status !== 'SAFE') {
    recommendations.push({
      type: 'SUBSTITUTION',
      title: 'Optimasi Belanja Non-Pokok',
      description: `Alokasi makanan dan barang lainnya mencapai Rp ${nonEssentialSpent.toLocaleString('id-ID')}. Mengurangi barang sekunder dapat membantu menurunkan total belanja.`,
      estimatedSavings: Math.round(nonEssentialSpent * 0.3)
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      type: 'SAVINGS',
      title: 'Keranjang Belanja Sehat',
      description: 'Belanja terpilih masih berada dalam batas anggaran.'
    });
  }

  return {
    status,
    healthScore,
    summary: status === 'SAFE'
      ? `Keranjang belanja sehat (${healthScore}/100). Sisa uang dompet Rp ${(budgetLimit - totalSpent).toLocaleString('id-ID')}.`
      : status === 'WARNING'
        ? `Belanja mencapai ${Math.round(ratio * 100)}% dari batas dompet. Berhati-hatilah saat menambah barang.`
        : `Defisit Rp ${(totalSpent - budgetLimit).toLocaleString('id-ID')}. Disarankan mengurangi barang sebelum ke kasir.`,
    inflationSummary: {
      totalItemsCompared,
      itemsIncreased,
      itemsDecreased,
      itemsStable,
      netInflationPct
    },
    recommendations,
    categoryAllocation,
    timestamp: new Date().toISOString()
  };
}
