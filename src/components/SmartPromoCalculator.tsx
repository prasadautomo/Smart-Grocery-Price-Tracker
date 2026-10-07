import React, { useState } from 'react';
import { Calculator, Scale, Zap, Info, ArrowRight } from 'lucide-react';
import { formatRupiah, compareUnitPricing } from '../lib/calculations';

export const SmartPromoCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'promo' | 'unit'>('promo');

  // Tool 1: Kalkulator Diskon Bertingkat vs Potongan Langsung
  const [promoBasePrice, setPromoBasePrice] = useState<number>(50000);
  const [disc1, setDisc1] = useState<number>(50);
  const [disc2, setDisc2] = useState<number>(20);
  const [flatDiscount, setFlatDiscount] = useState<number>(15000);

  // Kalkulasi Opsi A (Diskon Bertingkat)
  const afterDisc1 = promoBasePrice * (1 - disc1 / 100);
  const finalPriceA = Math.round(afterDisc1 * (1 - disc2 / 100));
  const savingsA = promoBasePrice - finalPriceA;
  const effectivePercentA = promoBasePrice > 0 ? Math.round((savingsA / promoBasePrice) * 100) : 0;

  // Kalkulasi Opsi B (Potongan Langsung)
  const finalPriceB = Math.max(0, promoBasePrice - flatDiscount);
  const savingsB = promoBasePrice - finalPriceB;
  const effectivePercentB = promoBasePrice > 0 ? Math.round((savingsB / promoBasePrice) * 100) : 0;

  // Tool 2: Pembanding Kemasan (1 Liter vs 5 Liter)
  const [prodAName, setProdAName] = useState('Kemasan Kecil (1 Liter)');
  const [prodAVolume, setProdAVolume] = useState<number>(1);
  const [prodAPrice, setProdAPrice] = useState<number>(18000);

  const [prodBName, setProdBName] = useState('Jerigen Besar (5 Liter)');
  const [prodBVolume, setProdBVolume] = useState<number>(5);
  const [prodBPrice, setProdBPrice] = useState<number>(85000);

  const unitComparison = compareUnitPricing(
    { name: prodAName, volume: prodAVolume, unit: 'Liter', price: prodAPrice },
    { name: prodBName, volume: prodBVolume, unit: 'Liter', price: prodBPrice }
  );

  return (
    <div className="smart-calc-container">
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={`btn-secondary ${activeTab === 'promo' ? 'btn-primary' : ''}`}
          style={{ flex: 1, fontSize: '12.5px', padding: '10px 12px' }}
          onClick={() => setActiveTab('promo')}
        >
          <Zap size={15} />
          <span>Bedah Promo Rak</span>
        </button>
        <button
          className={`btn-secondary ${activeTab === 'unit' ? 'btn-primary' : ''}`}
          style={{ flex: 1, fontSize: '12.5px', padding: '10px 12px' }}
          onClick={() => setActiveTab('unit')}
        >
          <Scale size={15} />
          <span>Bandingkan Kemasan</span>
        </button>
      </div>

      {/* TAB 1: BEDAH PROMO BERTINGKAT VS POTONGAN LANGSUNG */}
      {activeTab === 'promo' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="header-logo-badge" style={{ width: 32, height: 32 }}>
              <Calculator size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', color: '#fff' }}>Kalkulator Diskon Bertingkat</h3>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                Cek trik promo "50% + 20%" vs Potongan Tunai
              </p>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Harga Asli di Rak Toko (Rp)</label>
            <input
              type="number"
              step="1000"
              className="form-input"
              value={promoBasePrice}
              onChange={(e) => setPromoBasePrice(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {/* OPSI A: Diskon Bertingkat */}
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '14px',
                padding: '12px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#60a5fa', marginBottom: 8 }}>
                Opsi A: Diskon Bertingkat
              </div>

              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                <input
                  type="number"
                  className="form-input"
                  style={{ padding: '6px', textAlign: 'center', fontSize: '12px' }}
                  value={disc1}
                  onChange={(e) => setDisc1(parseFloat(e.target.value) || 0)}
                  placeholder="50"
                />
                <span style={{ alignSelf: 'center', color: '#94a3b8' }}>%+</span>
                <input
                  type="number"
                  className="form-input"
                  style={{ padding: '6px', textAlign: 'center', fontSize: '12px' }}
                  value={disc2}
                  onChange={(e) => setDisc2(parseFloat(e.target.value) || 0)}
                  placeholder="20"
                />
                <span style={{ alignSelf: 'center', color: '#94a3b8' }}>%</span>
              </div>

              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: 4 }}>Harga Akhir:</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                {formatRupiah(finalPriceA)}
              </div>
              <div style={{ fontSize: '11px', color: '#34d399', marginTop: 4 }}>
                Hemat {formatRupiah(savingsA)} ({effectivePercentA}%)
              </div>
            </div>

            {/* OPSI B: Potongan Langsung */}
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '14px',
                padding: '12px',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24', marginBottom: 8 }}>
                Opsi B: Potongan Langsung
              </div>

              <div style={{ marginBottom: 8 }}>
                <input
                  type="number"
                  step="1000"
                  className="form-input"
                  style={{ padding: '6px', fontSize: '12px' }}
                  value={flatDiscount}
                  onChange={(e) => setFlatDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="15000"
                />
              </div>

              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: 4 }}>Harga Akhir:</div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                {formatRupiah(finalPriceB)}
              </div>
              <div style={{ fontSize: '11px', color: '#34d399', marginTop: 4 }}>
                Hemat {formatRupiah(savingsB)} ({effectivePercentB}%)
              </div>
            </div>
          </div>

          {/* Kesimpulan Rekomendasi Cerdas */}
          <div
            style={{
              padding: '12px',
              borderRadius: '12px',
              background: finalPriceA <= finalPriceB ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              border: `1px solid ${finalPriceA <= finalPriceB ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '13px', color: '#fff', marginBottom: 4 }}>
              <Zap size={15} color={finalPriceA <= finalPriceB ? '#34d399' : '#fbbf24'} />
              <span>
                {finalPriceA < finalPriceB
                  ? 'PILIH OPSI A (Diskon Bertingkat Lebih Murah!)'
                  : finalPriceA > finalPriceB
                  ? 'PILIH OPSI B (Potongan Langsung Lebih Murah!)'
                  : 'KEDUA OPSI SAMA PERSIS!'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.4 }}>
              {finalPriceA < finalPriceB ? (
                <>
                  Kamu berhemat ekstra <strong>{formatRupiah(finalPriceB - finalPriceA)}</strong> jika memilih Diskon Bertingkat ({disc1}% + {disc2}%).
                </>
              ) : finalPriceA > finalPriceB ? (
                <>
                  Jangan terkecoh label persen! Potongan Tunai langsung menghemat ekstra <strong>{formatRupiah(finalPriceA - finalPriceB)}</strong> lebih banyak.
                </>
              ) : (
                'Kedua penawaran menghasilkan harga bayar kasir yang persis sama.'
              )}
            </p>
          </div>

          {/* Penjelasan Edukatif Rekayasa Perangkat Lunak */}
          <div style={{ display: 'flex', gap: 8, padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
            <Info size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
              <strong>Logika Kasir:</strong> Diskon 50% + 20% bukan 70%! Barang Rp 50.000 dipotong 50% menjadi Rp 25.000. Lalu sisa Rp 25.000 dipotong lagi 20% (Rp 5.000), sehingga harga akhir Rp 20.000 (total potongan efektif 60%).
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: PEMBANDING HARGA KEMASAN (1L VS 5L) */}
      {activeTab === 'unit' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="header-logo-badge" style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <Scale size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', color: '#fff' }}>Kalkulator Hemat Kemasan</h3>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>
                Bandingkan harga satuan/liter kemasan kecil vs jerigen besar
              </p>
            </div>
          </div>

          {/* Produk A */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label" style={{ color: '#38bdf8' }}>Nama Produk Pilihan A</label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '13px', padding: '8px 12px' }}
                value={prodAName}
                onChange={(e) => setProdAName(e.target.value)}
                placeholder="Kemasan Kecil (1 Liter)"
              />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Isi / Volume</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={prodAVolume}
                  onChange={(e) => setProdAVolume(parseFloat(e.target.value) || 1)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Harga Total (Rp)</label>
                <input
                  type="number"
                  step="500"
                  className="form-input"
                  value={prodAPrice}
                  onChange={(e) => setProdAPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div style={{ marginTop: 6, fontSize: '12px', color: '#cbd5e1' }}>
              Harga per Satuan: <strong style={{ color: '#fff' }}>{formatRupiah(unitComparison.productA.pricePerUnit)} / unit</strong>
            </div>
          </div>

          {/* Produk B */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label" style={{ color: '#a78bfa' }}>Nama Produk Pilihan B</label>
              <input
                type="text"
                className="form-input"
                style={{ fontSize: '13px', padding: '8px 12px' }}
                value={prodBName}
                onChange={(e) => setProdBName(e.target.value)}
                placeholder="Jerigen Besar (5 Liter)"
              />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Isi / Volume</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={prodBVolume}
                  onChange={(e) => setProdBVolume(parseFloat(e.target.value) || 1)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Harga Total (Rp)</label>
                <input
                  type="number"
                  step="500"
                  className="form-input"
                  value={prodBPrice}
                  onChange={(e) => setProdBPrice(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div style={{ marginTop: 6, fontSize: '12px', color: '#cbd5e1' }}>
              Harga per Satuan: <strong style={{ color: '#fff' }}>{formatRupiah(unitComparison.productB.pricePerUnit)} / unit</strong>
            </div>
          </div>

          {/* Hasil Rekomendasi Kemasan */}
          <div
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '14px', color: '#34d399', marginBottom: 6 }}>
              <ArrowRight size={16} />
              <span>
                {unitComparison.cheaperOption === 'A' && 'PILIHAN A LEBIH HEMAT!'}
                {unitComparison.cheaperOption === 'B' && 'PILIHAN B LEBIH HEMAT!'}
                {unitComparison.cheaperOption === 'EQUAL' && 'KEDUA KEMASAN SAMA NILAINYA!'}
              </span>
            </div>

            <p style={{ fontSize: '12.5px', color: '#e2e8f0', lineHeight: 1.5 }}>
              {unitComparison.cheaperOption === 'B' ? (
                <>
                  Membeli Jerigen Besar (Pilihan B) menghemat{' '}
                  <strong style={{ color: '#34d399' }}>{formatRupiah(unitComparison.savingsNominalPerUnit)}</strong> per unit{' '}
                  ({unitComparison.savingsPercent}% lebih ekonomis dibanding kemasan kecil).
                </>
              ) : unitComparison.cheaperOption === 'A' ? (
                <>
                  Kemasan Kecil (Pilihan A) ternyata lebih murah{' '}
                  <strong style={{ color: '#34d399' }}>{formatRupiah(unitComparison.savingsNominalPerUnit)}</strong> per unit! Jangan terkecoh anggapan bahwa kemasan besar selalu lebih murah.
                </>
              ) : (
                'Harga per volume kedua produk persis sama.'
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
