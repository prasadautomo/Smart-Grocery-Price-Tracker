import React, { useState } from 'react';
import {
  ShieldCheck,
  Edit3,
  Info,
  Check,
} from 'lucide-react';
import { formatRupiah, compareUnitPricing } from '../lib/calculations';
import type { BudgetSettings, GroceryItem } from '../types/grocery';

interface SmartPromoCalculatorProps {
  budgetSettings?: BudgetSettings;
  totalSpent?: number;
  items?: GroceryItem[];
  onEditBudget?: () => void;
  onApplyToCart?: (item: GroceryItem) => void;
}

export const SmartPromoCalculator: React.FC<SmartPromoCalculatorProps> = ({
  budgetSettings = { monthlyBudget: 400000, warningThresholdPercent: 80 },
  totalSpent = 264000,
  items = [],
  onEditBudget,
  onApplyToCart,
}) => {
  // Tool 1: Kalkulator Diskon Supermarket (F-03)
  const [promoBasePrice, setPromoBasePrice] = useState<number>(25000);
  const [promoType, setPromoType] = useState<string>('50+20');
  const [disc1, setDisc1] = useState<number>(50);
  const [disc2, setDisc2] = useState<number>(20);

  // Kalkulasi Diskon Bertingkat Step-by-Step
  const step1Discount = (promoBasePrice * disc1) / 100;
  const priceAfterStep1 = promoBasePrice - step1Discount;
  const step2Discount = (priceAfterStep1 * disc2) / 100;
  const finalPrice = Math.max(0, Math.round(priceAfterStep1 - step2Discount));
  const totalSavings = promoBasePrice - finalPrice;
  const effectivePercent = promoBasePrice > 0 ? Math.round((totalSavings / promoBasePrice) * 100) : 0;

  // Tool 2: Komparasi Satuan Kemasan (Unit Price)
  const [productName, setProductName] = useState<string>('Minyak Goreng Sawit');
  const [volA, setVolA] = useState<number>(3); // 3x 1L = 3L
  const [priceA, setPriceA] = useState<number>(54000); // 3x 18rb
  const [volB, setVolB] = useState<number>(5); // 5L
  const [priceB, setPriceB] = useState<number>(85000); // 85rb

  const unitComparison = compareUnitPricing(
    { name: 'Kemasan Eceran', volume: volA, unit: 'Liter/Kg', price: priceA },
    { name: 'Kemasan Grosir/Besar', volume: volB, unit: 'Liter/Kg', price: priceB }
  );

  const budgetLimit = budgetSettings.monthlyBudget;
  const spentPercent = Math.min(100, Math.round((totalSpent / budgetLimit) * 100));
  const remainingBudget = budgetLimit - totalSpent;

  const handleApplyPromoItem = () => {
    if (!onApplyToCart) {
      alert('Hasil promo siap digunakan di troli!');
      return;
    }
    const newItem: GroceryItem = {
      id: `item-${Date.now()}`,
      name: `Produk Promo (${disc1}% + ${disc2}%)`,
      category: 'Mandi & Kebersihan',
      unit: 'botol',
      quantity: 1,
      unitPrice: promoBasePrice,
      lastMonthPrice: promoBasePrice,
      discountType: 'stacked',
      discountPercent1: disc1,
      discountPercent2: disc2,
      notes: `Promo bertingkat efektif hemat ${effectivePercent}%`,
      createdAt: new Date().toISOString(),
    };
    onApplyToCart(newItem);
    alert('Barang promo berhasil dimasukkan ke troli!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ============================================================
          BAGIAN 1: PENGENDALI ANGGARAN (F-05) - STITCH SCREEN 1
          ============================================================ */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Pengendali Anggaran
              </h2>
            </div>
          </div>

          <span
            style={{
              background: '#ecfdf5',
              color: '#047857',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 20,
              border: '1px solid #a7f3d0',
            }}
          >
            ● F-05 Active
          </span>
        </div>

        {/* Alokasi Uang Saku & Edit Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Alokasi Uang Saku Kos</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
              {formatRupiah(budgetLimit)}
            </div>
          </div>

          <button
            type="button"
            onClick={onEditBudget}
            className="btn-secondary"
            style={{ fontSize: '11.5px', padding: '6px 12px', borderRadius: 8, height: 32 }}
          >
            <Edit3 size={13} />
            <span>Ubah Target</span>
          </button>
        </div>

        {/* Progress Slider Track with Cap Indicator */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: 4 }}>
            <span>Terpakai {spentPercent}%</span>
            <span>Batas Aman {budgetSettings.warningThresholdPercent}%</span>
          </div>

          <div style={{ position: 'relative', height: 8, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${spentPercent}%`,
                background: spentPercent > 90 ? '#ef4444' : spentPercent > 75 ? '#f59e0b' : '#10b981',
                borderRadius: 999,
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginTop: 4 }}>
            <span>Rp 0</span>
            <span style={{ color: '#ef4444', fontWeight: 700 }}>
              ⚠ Cap: {formatRupiah(Math.round(budgetLimit * 0.95))}
            </span>
            <span>{formatRupiah(budgetLimit)}</span>
          </div>
        </div>

        {/* 2 Big Stat Cards Side-by-Side (Stitch Screen 1) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Card 1: Total Keranjang */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b' }}>Total Keranjang Saat Ini</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
              {formatRupiah(totalSpent)}
            </div>
            <div style={{ fontSize: '10.5px', color: '#10b981', fontWeight: 600 }}>
              ✓ Terkontrol {items.length} item
            </div>
          </div>

          {/* Card 2: Sisa Saldo Aman */}
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 14,
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#047857' }}>Sisa Saldo Aman</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#047857', margin: '4px 0' }}>
              {formatRupiah(Math.max(0, remainingBudget))}
            </div>
            <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: 600 }}>
              🌱 Cukup s/d akhir bulan
            </div>
          </div>
        </div>

        {/* Status Box: Aman (Hijau) */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={13} strokeWidth={3} />
            </div>
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#15803d' }}>
                Status: Aman (Hijau)
              </div>
              <div style={{ fontSize: '10.5px', color: '#475569' }}>
                Belanjaan masih di bawah 80% dari alokasi bulanan kos
              </div>
            </div>
          </div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803d' }}>
            {spentPercent}%
          </span>
        </div>

        {/* Breakdown Alokasi Belanja Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: 6 }}>
            <span style={{ fontWeight: 700 }}>Breakdown Alokasi Belanja</span>
            <span style={{ color: '#94a3b8' }}>Kategori Terpilih</span>
          </div>

          <div style={{ display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden', gap: 2 }}>
            <div style={{ width: '55%', background: '#10b981' }} title="Bahan Pokok (55%)" />
            <div style={{ width: '25%', background: '#3b82f6' }} title="Kebersihan (25%)" />
            <div style={{ width: '20%', background: '#f59e0b' }} title="Dapur/Camilan (20%)" />
          </div>

          <div style={{ display: 'flex', gap: 12, fontSize: '10px', color: '#64748b', marginTop: 6, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              Pokok (55%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
              Mandi (25%)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
              Dapur/Jajan (20%)
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          BAGIAN 2: KALKULATOR DISKON SUPERMARKET (F-03 ANTI-GIMMICK)
          ============================================================ */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Kalkulator Diskon Supermarket
            </h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>
              F-03: Bedah Trik Promo Bertumpuk ({disc1}% + {disc2}%)
            </p>
          </div>

          <span
            style={{
              background: '#fef3c7',
              color: '#b45309',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 20,
              border: '1px solid #fde68a',
            }}
          >
            Anti-Gimmick
          </span>
        </div>

        {/* Inputs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div className="form-group">
            <label className="form-label">Harga Label Rak</label>
            <input
              type="number"
              className="form-input"
              value={promoBasePrice}
              onChange={(e) => setPromoBasePrice(parseFloat(e.target.value) || 0)}
              style={{ fontSize: '13px', fontWeight: 700 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tipe Promo Rak</label>
            <select
              className="form-select"
              value={promoType}
              onChange={(e) => {
                const val = e.target.value;
                setPromoType(val);
                if (val === '50+20') { setDisc1(50); setDisc2(20); }
                else if (val === '70+10') { setDisc1(70); setDisc2(10); }
                else if (val === '30+20') { setDisc1(30); setDisc2(20); }
              }}
              style={{ fontSize: '13px', fontWeight: 700 }}
            >
              <option value="50+20">50% + 20%</option>
              <option value="70+10">70% + 10%</option>
              <option value="30+20">30% + 20%</option>
            </select>
          </div>
        </div>

        {/* Explanatory Alert (Stitch Screen 1) */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
          }}
        >
          <Info size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ fontSize: '11px', color: '#475569', lineHeight: 1.45 }}>
            <strong style={{ color: '#0f172a' }}>
              Bukan Diskon {disc1 + disc2}% ({formatRupiah(promoBasePrice * (1 - (disc1 + disc2) / 100))})!
            </strong>{' '}
            Supermarket menghitung diskon kedua dari sisa potongan harga pertama.
          </div>
        </div>

        {/* Step-by-Step Transparent Formula (Stitch Screen 1) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
            Rumus Transparan Step-by-Step:
          </div>

          {/* Step 1 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: '#f8fafc',
              borderRadius: 10,
              fontSize: '11.5px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#10b981', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                1
              </span>
              <span>Potongan 1 ({disc1}%)</span>
            </div>
            <div>
              <span style={{ color: '#94a3b8', textDecoration: 'line-through', marginRight: 6 }}>
                {formatRupiah(promoBasePrice)}
              </span>
              <strong style={{ color: '#0f172a' }}>{formatRupiah(priceAfterStep1)}</strong>
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              background: '#f8fafc',
              borderRadius: 10,
              fontSize: '11.5px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#10b981', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                2
              </span>
              <span>Potongan 2 ({disc2}% dari sisa)</span>
            </div>
            <div>
              <span style={{ color: '#94a3b8', textDecoration: 'line-through', marginRight: 6 }}>
                {formatRupiah(priceAfterStep1)}
              </span>
              <strong style={{ color: '#10b981' }}>{formatRupiah(finalPrice)}</strong>
            </div>
          </div>
        </div>

        {/* Total Bayar Kasir Sebenarnya (Stitch Screen 1) */}
        <div
          style={{
            background: '#ecfdf5',
            border: '1.5px solid #a7f3d0',
            borderRadius: 14,
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>Total Bayar Kasir Sebenarnya</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#047857' }}>
              {formatRupiah(finalPrice)}
            </div>
          </div>

          <div
            style={{
              background: '#10b981',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: '12px',
              fontWeight: 800,
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            }}
          >
            Hemat {formatRupiah(totalSavings)} ({effectivePercent}%)
          </div>
        </div>

        <button
          type="button"
          onClick={handleApplyPromoItem}
          className="btn-primary"
          style={{ width: '100%', borderRadius: 12, padding: '12px', fontSize: '13px' }}
        >
          <span>🛒 Terapkan Hasil ke Troli Belanja</span>
        </button>
      </div>

      {/* ============================================================
          BAGIAN 3: KOMPARASI SATUAN KEMASAN (UNIT PRICE)
          ============================================================ */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '18px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Komparasi Satuan Kemasan
            </h3>
            <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>
              Dilema Belanja Anak Kos: Eceran vs Grosir
            </p>
          </div>

          <span
            style={{
              background: '#eff6ff',
              color: '#2563eb',
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 9px',
              borderRadius: 20,
              border: '1px solid #bfdbfe',
            }}
          >
            Unit Price
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
            🍳 {productName} (Studi Kasus)
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => {
                setProductName('Minyak Goreng Sawit');
                setVolA(3);
                setPriceA(54000);
                setVolB(5);
                setPriceB(85000);
              }}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: 6,
                border: productName === 'Minyak Goreng Sawit' ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                background: productName === 'Minyak Goreng Sawit' ? '#ecfdf5' : '#ffffff',
                color: productName === 'Minyak Goreng Sawit' ? '#047857' : '#64748b',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Minyak (3L vs 5L)
            </button>
            <button
              type="button"
              onClick={() => {
                setProductName('Beras Premium Ramos');
                setVolA(2.5);
                setPriceA(38000);
                setVolB(5);
                setPriceB(72000);
              }}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: 6,
                border: productName === 'Beras Premium Ramos' ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                background: productName === 'Beras Premium Ramos' ? '#ecfdf5' : '#ffffff',
                color: productName === 'Beras Premium Ramos' ? '#047857' : '#64748b',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Beras (2.5kg vs 5kg)
            </button>
            <button
              type="button"
              onClick={() => {
                setProductName('Deterjen Cair');
                setVolA(0.8);
                setPriceA(22000);
                setVolB(1.8);
                setPriceB(44000);
              }}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: 6,
                border: productName === 'Deterjen Cair' ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                background: productName === 'Deterjen Cair' ? '#ecfdf5' : '#ffffff',
                color: productName === 'Deterjen Cair' ? '#047857' : '#64748b',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Deterjen (800ml vs 1.8L)
            </button>
          </div>
        </div>

        {/* 2 Options Side-by-Side (Stitch Screen 1) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* Opsi A: Eceran */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#64748b' }}>Kemasan 1L (x3)</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px' }}>
              3 Kantong / 3 Liter
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              Total: {formatRupiah(priceA)}
            </div>
            <div style={{ borderTop: '1px dashed #e2e8f0', marginTop: 8, paddingTop: 6 }}>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>Harga per Liter:</div>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>
                {formatRupiah(unitComparison.productA.pricePerUnit)}/L
              </strong>
            </div>
          </div>

          {/* Opsi B: Jerigen 5L (Paling Irit) */}
          <div
            style={{
              background: '#ecfdf5',
              border: '1.5px solid #10b981',
              borderRadius: 14,
              padding: '12px',
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -8,
                right: 8,
                background: '#047857',
                color: '#fff',
                fontSize: '9.5px',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: 4,
              }}
            >
              Paling Irit!
            </span>

            <div style={{ fontSize: '11px', color: '#047857' }}>Jerigen 5 Liter</div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#047857', margin: '4px 0 2px' }}>
              1 Jerigen / 5 Liter
            </div>
            <div style={{ fontSize: '11px', color: '#059669' }}>
              Total: {formatRupiah(priceB)}
            </div>
            <div style={{ borderTop: '1px dashed #a7f3d0', marginTop: 8, paddingTop: 6 }}>
              <div style={{ fontSize: '10px', color: '#047857' }}>Harga per Liter:</div>
              <strong style={{ fontSize: '13px', color: '#047857' }}>
                {formatRupiah(unitComparison.productB.pricePerUnit)}/L
              </strong>
            </div>
          </div>
        </div>

        {/* Rekomendasi Cerdas Card (Stitch Screen 1) */}
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 12,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <div style={{ fontSize: '11.5px', color: '#047857', lineHeight: 1.4 }}>
            💡 <strong>Rekomendasi Cerdas Anak Kos:</strong> Beli Jerigen 5L lebih hemat{' '}
            <strong>{formatRupiah(unitComparison.savingsNominalPerUnit)}</strong> tiap liternya!
          </div>

          <button
            type="button"
            className="btn-primary"
            style={{ fontSize: '11px', padding: '6px 10px', borderRadius: 8, whiteSpace: 'nowrap' }}
            onClick={() => alert('Pilihan Jerigen 5 Liter direkomendasikan untuk belanja bulanan!')}
          >
            Pilih Jerigen
          </button>
        </div>
      </div>
    </div>
  );
};
