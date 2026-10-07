import React, { useState } from 'react';
import { X, CheckCircle, Tag, ShoppingBag, Store, AlertTriangle, PackagePlus } from 'lucide-react';
import type { GroceryItem, BudgetSettings, ShoppingTrip } from '../types/grocery';
import { formatRupiah, calculateItemPrice, calculateCashierGrandTotal } from '../lib/calculations';

interface CheckoutModalProps {
  isOpen: boolean;
  items: GroceryItem[];
  budgetSettings: BudgetSettings;
  onClose: () => void;
  onConfirmCheckout: (trip: ShoppingTrip) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  items,
  budgetSettings,
  onClose,
  onConfirmCheckout,
}) => {
  const [storeName, setStoreName] = useState('Supermarket Grosir');
  const [notes, setNotes] = useState('Belanja Bulanan Anak Rantau');

  // Biaya Tambahan Kasir
  const [bagFee, setBagFee] = useState<number>(0); // 0, 500, 1000, 3500
  const [parkingFee, setParkingFee] = useState<number>(2000); // 0, 2000, 5000
  const [taxPercent, setTaxPercent] = useState<number>(0); // 0, 11

  if (!isOpen) return null;

  // Subtotal belanjaan
  let totalSpent = 0;
  let totalSavings = 0;
  items.forEach((item) => {
    const calc = calculateItemPrice(item);
    totalSpent += calc.finalTotal;
    totalSavings += calc.totalDiscountAmount;
  });

  // Kalkulasi total biaya kasir realtime
  const cashierCalc = calculateCashierGrandTotal(totalSpent, bagFee, parkingFee, taxPercent);

  const isOverBudget = cashierCalc.grandTotal > budgetSettings.monthlyBudget;
  const remainingBudget = budgetSettings.monthlyBudget - cashierCalc.grandTotal;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTrip: ShoppingTrip = {
      id: `trip-${Date.now()}`,
      date: new Date().toISOString(),
      storeName: storeName.trim() || 'Supermarket Grosir',
      totalSpent,
      totalSavings,
      totalItemsCount: items.length,
      budgetLimit: budgetSettings.monthlyBudget,
      itemsSnapshot: [...items],
      extraCosts: {
        bagFee: cashierCalc.bagFee,
        parkingFee: cashierCalc.parkingFee,
        taxPercent: cashierCalc.taxPercent,
        taxAmount: cashierCalc.taxAmount,
      },
      grandTotal: cashierCalc.grandTotal,
      notes: notes.trim(),
    };

    onConfirmCheckout(newTrip);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="sheet-handle-bar" />
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingBag size={20} color="#10b981" />
            <h2>Konfirmasi Pembayaran Kasir</h2>
          </div>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="sheet-body" onSubmit={handleCheckoutSubmit}>
          {/* Status Keamanan Anggaran */}
          {isOverBudget ? (
            <div
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '12px', color: '#fca5a5', lineHeight: 1.4 }}>
                <strong>Peringatan Dompet:</strong> Total bayar kasir melebihi jatah bulanan sebesar{' '}
                <strong>{formatRupiah(Math.abs(remainingBudget))}</strong>. Pastikan uang tunai atau saldo QRIS mencukupi!
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle size={18} color="#34d399" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '12px', color: '#34d399', lineHeight: 1.4 }}>
                <strong>Dompet Aman!</strong> Sisa uang saku setelah bayar kasir:{' '}
                <strong>{formatRupiah(remainingBudget)}</strong>.
              </div>
            </div>
          )}

          {/* Biaya Tambahan Kasir (F-Tambahan Kasir) */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <PackagePlus size={15} color="#38bdf8" />
              <span>Biaya Tambahan Kasir & Supermarket:</span>
            </div>

            {/* Kantong Belanja */}
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: 4 }}>
                Kantong Belanja:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {[
                  { label: 'Bawa Sendiri', fee: 0 },
                  { label: 'Kresek Rp 500', fee: 500 },
                  { label: 'Besar Rp 1rb', fee: 1000 },
                  { label: 'Kain Rp 3.5rb', fee: 3500 },
                ].map((opt) => (
                  <button
                    key={opt.fee}
                    type="button"
                    className={`category-pill ${bagFee === opt.fee ? 'active' : ''}`}
                    style={{ fontSize: '10.5px', padding: '6px 4px', textAlign: 'center', width: '100%' }}
                    onClick={() => setBagFee(opt.fee)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Parkir */}
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: 4 }}>
                Biaya Parkir:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {[
                  { label: 'Gratis (Rp 0)', fee: 0 },
                  { label: 'Motor (Rp 2rb)', fee: 2000 },
                  { label: 'Mobil (Rp 5rb)', fee: 5000 },
                ].map((opt) => (
                  <button
                    key={opt.fee}
                    type="button"
                    className={`category-pill ${parkingFee === opt.fee ? 'active' : ''}`}
                    style={{ fontSize: '10.5px', padding: '6px 4px', textAlign: 'center', width: '100%' }}
                    onClick={() => setParkingFee(opt.fee)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pajak PPN */}
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: 4 }}>
                Pajak PPN Supermarket:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { label: 'Tanpa PPN (0%)', pct: 0 },
                  { label: 'PPN 11% (+ ' + formatRupiah(Math.round(totalSpent * 0.11)) + ')', pct: 11 },
                ].map((opt) => (
                  <button
                    key={opt.pct}
                    type="button"
                    className={`category-pill ${taxPercent === opt.pct ? 'active' : ''}`}
                    style={{ fontSize: '10.5px', padding: '6px 4px', textAlign: 'center', width: '100%' }}
                    onClick={() => setTaxPercent(opt.pct)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rincian Kasir Ringkas */}
          <div className="card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#94a3b8', marginBottom: 6 }}>
              <span>Subtotal Belanja ({items.length} Barang):</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{formatRupiah(totalSpent)}</span>
            </div>

            {cashierCalc.extraTotal > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: 6 }}>
                <span>Biaya Kasir (Kantong, Parkir, PPN):</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>+{formatRupiah(cashierCalc.extraTotal)}</span>
              </div>
            )}

            {totalSavings > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#fbbf24', marginBottom: 6 }}>
                <span>Total Hemat Promo:</span>
                <span style={{ fontWeight: 700 }}>
                  <Tag size={12} style={{ display: 'inline', marginRight: 4 }} />
                  -{formatRupiah(totalSavings)}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#94a3b8', marginBottom: 8 }}>
              <span>Batas Anggaran Dompet:</span>
              <span style={{ color: '#fff' }}>{formatRupiah(budgetSettings.monthlyBudget)}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '17px',
                fontWeight: 800,
                color: isOverBudget ? '#f87171' : '#34d399',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 10,
              }}
            >
              <span>TOTAL DIBAYAR KASIR:</span>
              <span>{formatRupiah(cashierCalc.grandTotal)}</span>
            </div>
          </div>

          {/* Toko & Catatan */}
          <div className="form-group">
            <label className="form-label">Nama Supermarket / Toko</label>
            <div style={{ position: 'relative' }}>
              <Store
                size={16}
                style={{ position: 'absolute', left: 12, top: 13, color: '#64748b' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 36 }}
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Catatan Struk (Opsional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Belanja awal bulan di Grosir Indojaya"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4, margin: '2px 0 6px' }}>
            💡 Menekan tombol di bawah akan menyimpan struk ini ke tab <strong>Riwayat</strong> dan memperbarui patokan harga barang untuk perbandingan bulan depan secara otomatis.
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Kembali
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 2 }}>
              <CheckCircle size={18} />
              <span>Simpan Struk Kasir</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
