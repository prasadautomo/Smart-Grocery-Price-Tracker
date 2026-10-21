import React, { useState } from 'react';
import { X, Scale, CheckCircle2, Zap } from 'lucide-react';
import { formatRupiah, compareUnitPricing } from '../lib/calculations';
import type { GroceryItem } from '../types/grocery';

interface UnitBulkComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (item: GroceryItem) => void;
}

export const UnitBulkComparatorModal: React.FC<UnitBulkComparatorModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
}) => {
  // Mode: 'unit' (Kemasan/Volume) atau 'promo' (Diskon 50%+20% vs Potongan Tunai)
  const [mode, setMode] = useState<'unit' | 'promo'>('unit');

  // State Mode Unit (Kasus Minyak Goreng 3x1L vs 1x5L)
  const [productName, setProductName] = useState('Minyak Goreng Sawit');
  const [unitType, setUnitType] = useState('Liter');
  const [nameA, setNameA] = useState('3 Kantong @ 1 Liter');
  const [volA, setVolA] = useState<number>(3);
  const [priceA, setPriceA] = useState<number>(54000); // 3 x 18rb

  const [nameB, setNameB] = useState('1 Jerigen 5 Liter');
  const [volB, setVolB] = useState<number>(5);
  const [priceB, setPriceB] = useState<number>(85000);

  // State Mode Promo (Diskon Bertingkat vs Potongan Tunai)
  const [promoName, setPromoName] = useState('Sabun Cuci / Pembersih');
  const [basePriceA, setBasePriceA] = useState<number>(25000);
  const [disc1, setDisc1] = useState<number>(50);
  const [disc2, setDisc2] = useState<number>(20);

  const [basePriceB, setBasePriceB] = useState<number>(28000);
  const [potonganB, setPotonganB] = useState<number>(15000);

  if (!isOpen) return null;

  // Kalkulasi Unit Mode
  const unitResult = compareUnitPricing(
    { name: nameA, volume: volA, unit: unitType, price: priceA },
    { name: nameB, volume: volB, unit: unitType, price: priceB }
  );

  // Kalkulasi Promo Mode
  const priceAfterDisc1 = basePriceA * (1 - disc1 / 100);
  const finalPriceA = Math.round(priceAfterDisc1 * (1 - disc2 / 100));
  const savingsA = basePriceA - finalPriceA;

  const finalPriceB = Math.max(0, basePriceB - potonganB);
  const savingsB = basePriceB - finalPriceB;

  const promoCheaper =
    finalPriceA < finalPriceB ? 'A' : finalPriceB < finalPriceA ? 'B' : 'EQUAL';
  const promoDiff = Math.abs(finalPriceA - finalPriceB);

  // Quick Preset Handlers
  const handleLoadOilPreset = () => {
    setMode('unit');
    setProductName('Minyak Goreng Sawit');
    setUnitType('Liter');
    setNameA('3 Kantong @ 1 Liter');
    setVolA(3);
    setPriceA(54000);
    setNameB('1 Jerigen 5 Liter');
    setVolB(5);
    setPriceB(85000);
  };

  const handleLoadRicePreset = () => {
    setMode('unit');
    setProductName('Beras Ramos');
    setUnitType('Kg');
    setNameA('Eceran 5 x @ 1 Kg');
    setVolA(5);
    setPriceA(95000);
    setNameB('Karung Kemasan 5 Kg');
    setVolB(5);
    setPriceB(88799);
  };

  const handleLoadPromoPreset = () => {
    setMode('promo');
    setPromoName('Sabun Pembersih Lantai (800 ml)');
    setBasePriceA(25000);
    setDisc1(50);
    setDisc2(20);
    setBasePriceB(28000);
    setPotonganB(15000);
  };

  const handleAddWinnerToCart = () => {
    if (!onAddToCart) return;

    if (mode === 'unit') {
      const isA = unitResult.cheaperOption === 'A' || unitResult.cheaperOption === 'EQUAL';
      const newItem: GroceryItem = {
        id: `comparator-${Date.now()}`,
        name: `${productName} (${isA ? nameA : nameB})`,
        category: 'Bahan Pokok',
        unit: isA ? (volA > 1 ? 'kantong' : 'liter') : 'jerigen',
        quantity: 1,
        unitPrice: isA ? priceA : priceB,
        discountType: 'none',
        priority: 'essential',
        notes: `Pilihan lebih hemat via Pembanding Satuan (Hemat ${unitResult.savingsPercent}%)`,
        createdAt: new Date().toISOString(),
      };
      onAddToCart(newItem);
    } else {
      const isA = promoCheaper === 'A' || promoCheaper === 'EQUAL';
      const newItem: GroceryItem = {
        id: `comparator-promo-${Date.now()}`,
        name: `${promoName} (${isA ? 'Promo Bertingkat 50%+20%' : 'Promo Potongan Langsung'})`,
        category: 'Mandi & Cuci',
        unit: 'botol',
        quantity: 1,
        unitPrice: isA ? basePriceA : basePriceB,
        discountType: isA ? 'stacked' : 'nominal',
        discountPercent1: isA ? disc1 : undefined,
        discountPercent2: isA ? disc2 : undefined,
        discountNominal: !isA ? potonganB : undefined,
        priority: 'essential',
        notes: `Rekomendasi promo hemat selisih ${formatRupiah(promoDiff)}`,
        createdAt: new Date().toISOString(),
      };
      onAddToCart(newItem);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '92vh' }}>
        <div className="sheet-handle-bar" />

        {/* Header */}
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scale size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '15.5px', margin: 0 }}>Bandingkan Kemasan & Merek</h2>
              <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                Kalkulator Pembanding Unit Cerdas (F-03)
              </p>
            </div>
          </div>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="sheet-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Preset Buttons Kasus Nyata Rian */}
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: 6, fontWeight: 600 }}>
              ⚡ Contoh Kasus Nyata di Rak Supermarket:
            </div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              <button
                type="button"
                onClick={handleLoadOilPreset}
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '5px 10px', whiteSpace: 'nowrap', borderRadius: 8 }}
              >
                🍳 3x 1L vs 1x Jerigen 5L
              </button>
              <button
                type="button"
                onClick={handleLoadPromoPreset}
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '5px 10px', whiteSpace: 'nowrap', borderRadius: 8 }}
              >
                🏷️ 50%+20% vs Potong Rp15rb
              </button>
              <button
                type="button"
                onClick={handleLoadRicePreset}
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '5px 10px', whiteSpace: 'nowrap', borderRadius: 8 }}
              >
                🌾 Beras 5x1kg vs 1x5kg
              </button>
            </div>
          </div>

          {/* Mode Switch Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: '#f1f5f9', padding: 4, borderRadius: 12 }}>
            <button
              type="button"
              onClick={() => setMode('unit')}
              style={{
                padding: '8px 10px',
                borderRadius: 9,
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: mode === 'unit' ? '#ffffff' : 'transparent',
                color: mode === 'unit' ? '#0f172a' : '#64748b',
                boxShadow: mode === 'unit' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              📦 Beda Ukuran / Kemasan
            </button>
            <button
              type="button"
              onClick={() => setMode('promo')}
              style={{
                padding: '8px 10px',
                borderRadius: 9,
                fontSize: '12px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: mode === 'promo' ? '#ffffff' : 'transparent',
                color: mode === 'promo' ? '#0f172a' : '#64748b',
                boxShadow: mode === 'promo' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              🏷️ Promo Bertingkat vs Tunai
            </button>
          </div>

          {/* ===================== MODE 1: KEMASAN / UNIT ===================== */}
          {mode === 'unit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Product Info */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Nama Barang</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Satuan Ukuran</label>
                  <select
                    className="form-select"
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value)}
                  >
                    <option value="Liter">Liter (Minyak/Susu)</option>
                    <option value="Kg">Kg (Beras/Gula)</option>
                    <option value="Pcs">Pcs / Lembar</option>
                    <option value="Gram">Gram</option>
                  </select>
                </div>
              </div>

              {/* Grid 2 Opsi Side by Side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* OPSI A */}
                <div
                  style={{
                    background: unitResult.cheaperOption === 'A' ? '#f0fdf4' : '#f8fafc',
                    border: `1.5px solid ${unitResult.cheaperOption === 'A' ? '#10b981' : '#e2e8f0'}`,
                    borderRadius: 14,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155' }}>OPSI A</span>
                    {unitResult.cheaperOption === 'A' && (
                      <span style={{ background: '#10b981', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>
                        Lebih Hemat!
                      </span>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>Nama / Keterangan</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ height: 32, fontSize: '11.5px' }}
                      value={nameA}
                      onChange={(e) => setNameA(e.target.value)}
                    />
                  </div>
                  <div className="form-row-2">
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b' }}>Vol ({unitType})</label>
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        style={{ height: 32, fontSize: '11.5px' }}
                        value={volA || ''}
                        onChange={(e) => setVolA(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b' }}>Harga (Rp)</label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ height: 32, fontSize: '11.5px' }}
                        value={priceA || ''}
                        onChange={(e) => setPriceA(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 4, paddingTop: 6, borderTop: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Harga Satuan:</span>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: unitResult.cheaperOption === 'A' ? '#047857' : '#0f172a' }}>
                      {formatRupiah(unitResult.productA.pricePerUnit)} / {unitType}
                    </div>
                  </div>
                </div>

                {/* OPSI B */}
                <div
                  style={{
                    background: unitResult.cheaperOption === 'B' ? '#f0fdf4' : '#f8fafc',
                    border: `1.5px solid ${unitResult.cheaperOption === 'B' ? '#10b981' : '#e2e8f0'}`,
                    borderRadius: 14,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155' }}>OPSI B</span>
                    {unitResult.cheaperOption === 'B' && (
                      <span style={{ background: '#10b981', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>
                        Lebih Hemat!
                      </span>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>Nama / Keterangan</label>
                    <input
                      type="text"
                      className="form-input"
                      style={{ height: 32, fontSize: '11.5px' }}
                      value={nameB}
                      onChange={(e) => setNameB(e.target.value)}
                    />
                  </div>
                  <div className="form-row-2">
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b' }}>Vol ({unitType})</label>
                      <input
                        type="number"
                        step="any"
                        className="form-input"
                        style={{ height: 32, fontSize: '11.5px' }}
                        value={volB || ''}
                        onChange={(e) => setVolB(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b' }}>Harga (Rp)</label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ height: 32, fontSize: '11.5px' }}
                        value={priceB || ''}
                        onChange={(e) => setPriceB(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 4, paddingTop: 6, borderTop: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Harga Satuan:</span>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: unitResult.cheaperOption === 'B' ? '#047857' : '#0f172a' }}>
                      {formatRupiah(unitResult.productB.pricePerUnit)} / {unitType}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ringkasan Kesimpulan Cerdas */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: 14,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#15803d' }}>
                    {unitResult.cheaperOption === 'A' && `🏆 Rekomendasi: Pilih Opsi A (${nameA})`}
                    {unitResult.cheaperOption === 'B' && `🏆 Rekomendasi: Pilih Opsi B (${nameB})`}
                    {unitResult.cheaperOption === 'EQUAL' && '🤝 Kedua opsi memiliki nilai harga yang setara!'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#334155', marginTop: 2 }}>
                    {unitResult.cheaperOption !== 'EQUAL' ? (
                      <>
                        Lebih hemat <strong>{unitResult.savingsPercent}%</strong> (Selisih <strong>{formatRupiah(unitResult.savingsNominalPerUnit)}</strong> per {unitType}).
                      </>
                    ) : (
                      'Harga per satuan persis sama.'
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== MODE 2: PROMO DISKON ===================== */}
          {mode === 'promo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Nama Produk Promo</label>
                <input
                  type="text"
                  className="form-input"
                  value={promoName}
                  onChange={(e) => setPromoName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {/* Opsi A: Bertingkat */}
                <div
                  style={{
                    background: promoCheaper === 'A' ? '#f0fdf4' : '#f8fafc',
                    border: `1.5px solid ${promoCheaper === 'A' ? '#10b981' : '#e2e8f0'}`,
                    borderRadius: 14,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155' }}>PROMO A (Bertingkat)</span>
                    {promoCheaper === 'A' && (
                      <span style={{ background: '#10b981', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>
                        Lebih Murah!
                      </span>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>Harga Awal</label>
                    <input
                      type="number"
                      className="form-input"
                      style={{ height: 32, fontSize: '11.5px' }}
                      value={basePriceA || ''}
                      onChange={(e) => setBasePriceA(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-row-2">
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b' }}>Disc 1 (%)</label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ height: 32, fontSize: '11.5px' }}
                        value={disc1 || ''}
                        onChange={(e) => setDisc1(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: '#64748b' }}>Disc 2 (%)</label>
                      <input
                        type="number"
                        className="form-input"
                        style={{ height: 32, fontSize: '11.5px' }}
                        value={disc2 || ''}
                        onChange={(e) => setDisc2(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 4, paddingTop: 6, borderTop: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Bayar Bersih:</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: promoCheaper === 'A' ? '#047857' : '#0f172a' }}>
                      {formatRupiah(finalPriceA)}
                    </div>
                    <span style={{ fontSize: '9.5px', color: '#10b981' }}>Hemat {formatRupiah(savingsA)}</span>
                  </div>
                </div>

                {/* Opsi B: Potongan Tunai */}
                <div
                  style={{
                    background: promoCheaper === 'B' ? '#f0fdf4' : '#f8fafc',
                    border: `1.5px solid ${promoCheaper === 'B' ? '#10b981' : '#e2e8f0'}`,
                    borderRadius: 14,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155' }}>PROMO B (Potongan Rp)</span>
                    {promoCheaper === 'B' && (
                      <span style={{ background: '#10b981', color: '#fff', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>
                        Lebih Murah!
                      </span>
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>Harga Awal</label>
                    <input
                      type="number"
                      className="form-input"
                      style={{ height: 32, fontSize: '11.5px' }}
                      value={basePriceB || ''}
                      onChange={(e) => setBasePriceB(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: '#64748b' }}>Potongan Tunai (Rp)</label>
                    <input
                      type="number"
                      className="form-input"
                      style={{ height: 32, fontSize: '11.5px' }}
                      value={potonganB || ''}
                      onChange={(e) => setPotonganB(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div style={{ marginTop: 4, paddingTop: 6, borderTop: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>Bayar Bersih:</span>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: promoCheaper === 'B' ? '#047857' : '#0f172a' }}>
                      {formatRupiah(finalPriceB)}
                    </div>
                    <span style={{ fontSize: '9.5px', color: '#10b981' }}>Hemat {formatRupiah(savingsB)}</span>
                  </div>
                </div>
              </div>

              {/* Ringkasan Kesimpulan Cerdas */}
              <div
                style={{
                  background: '#f0fdf4',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: 14,
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#15803d' }}>
                    {promoCheaper === 'A' && `🏆 Promo Bertingkat (50%+20%) Menang Hemat!`}
                    {promoCheaper === 'B' && `🏆 Potongan Tunai Rp ${formatRupiah(potonganB)} Menang Hemat!`}
                    {promoCheaper === 'EQUAL' && '🤝 Kedua promo menghasilkan harga bersih yang sama!'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#334155', marginTop: 2 }}>
                    Selisih penghematan nyata: <strong>{formatRupiah(promoDiff)}</strong> lebih murah.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ flex: 1, height: 44, borderRadius: 12 }}
              onClick={onClose}
            >
              Tutup
            </button>
            {onAddToCart && (
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 2, height: 44, borderRadius: 12, fontWeight: 700 }}
                onClick={handleAddWinnerToCart}
              >
                <Zap size={15} />
                <span>Pilih Opsi Hemat ke Troli</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
