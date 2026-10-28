export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      runtime: 'Node.js ' + process.version,
      engine: 'KeranjangPintar PRO Basket Intelligence API',
      message: 'API siap menganalisis keranjang belanja, inflasi harga, dan batas dompet.'
    });
  }

  try {
    const payload = req.body || {};
    const cart = Array.isArray(payload.cart) ? payload.cart : [];
    const budgetLimit = Number(payload.budgetLimit) || 350000;

    let totalSpent = 0;
    const categoryAllocation: Record<string, { spent: number; percentage: number }> = {};

    cart.forEach((item: any) => {
      const lineCost = (Number(item.price || item.unitPrice) || 0) * (Number(item.qty || item.quantity) || 1);
      totalSpent += lineCost;

      const cat = item.category || 'Lainnya';
      if (!categoryAllocation[cat]) {
        categoryAllocation[cat] = { spent: 0, percentage: 0 };
      }
      categoryAllocation[cat].spent += lineCost;
    });

    Object.keys(categoryAllocation).forEach((cat) => {
      const spent = categoryAllocation[cat].spent;
      categoryAllocation[cat].percentage = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
    });

    // 2. Evaluasi Inflasi vs Bulan Lalu (F-04)
    let itemsIncreased = 0;
    let itemsDecreased = 0;
    let itemsStable = 0;
    let totalItemsCompared = 0;
    let netInflationAmount = 0;

    cart.forEach((item: any) => {
      const currentPrice = Number(item.price || item.unitPrice) || 0;
      const lastPrice = Number(item.lastMonthPrice) || 0;

      if (lastPrice > 0 && currentPrice > 0) {
        totalItemsCompared++;
        const diff = currentPrice - lastPrice;
        netInflationAmount += diff * (Number(item.qty || item.quantity) || 1);

        if (diff > 0) itemsIncreased++;
        else if (diff < 0) itemsDecreased++;
        else itemsStable++;
      }
    });

    const netInflationPct = totalSpent > 0 ? Number(((netInflationAmount / totalSpent) * 100).toFixed(1)) : 0;

    // 3. Evaluasi Status Dompet (Health Score 0 - 100)
    const ratio = budgetLimit > 0 ? totalSpent / budgetLimit : 0;
    let status: 'SAFE' | 'WARNING' | 'DANGER' = 'SAFE';
    let healthScore = 100;

    if (ratio >= 1.0) {
      status = 'DANGER';
      healthScore = Math.max(20, Math.round(100 - (ratio - 1) * 150));
    } else if (ratio >= 0.85) {
      status = 'WARNING';
      healthScore = Math.round(70 - (ratio - 0.85) * 100);
    } else {
      status = 'SAFE';
      healthScore = Math.round(100 - ratio * 30);
    }

    const recommendations: Array<{
      type: 'SAVINGS' | 'WARNING' | 'SUBSTITUTION' | 'NUTRITION';
      title: string;
      description: string;
      estimatedSavings?: number;
    }> = [];

    if (status === 'DANGER') {
      recommendations.push({
        type: 'WARNING',
        title: 'Batas Dompet Terlampaui (Over-Budget)',
        description: `Total belanja saat ini melebihi limit dompet Anda sebesar Rp ${(totalSpent - budgetLimit).toLocaleString('id-ID')}. Pertimbangkan untuk mengurangi barang sekunder.`,
        estimatedSavings: totalSpent - budgetLimit,
      });
    }

    if (itemsIncreased > 0) {
      recommendations.push({
        type: 'SAVINGS',
        title: 'Kenaikan Harga Terdeteksi (Inflasi Supermarket)',
        description: `Terdapat ${itemsIncreased} barang dengan harga lebih tinggi dari bulan lalu. Beli secukupnya untuk kebutuhan darurat.`,
      });
    }

    return res.status(200).json({
      status,
      healthScore,
      summary: `Keranjang dianalisis: ${cart.length} produk, total Rp ${totalSpent.toLocaleString('id-ID')}`,
      inflationSummary: {
        totalItemsCompared,
        itemsIncreased,
        itemsDecreased,
        itemsStable,
        netInflationPct,
      },
      recommendations,
      categoryAllocation,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Gagal menganalisis keranjang',
      message: err.message,
    });
  }
}

