import React, { useState } from 'react';
import { X, CheckCircle, Tag, ShoppingBag, Store, AlertTriangle } from 'lucide-react';
import type { GroceryItem, BudgetSettings, ShoppingTrip } from '../types/grocery';
import { formatRupiah, calculateItemPrice } from '../lib/calculations';

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

  if (!isOpen) return null;

  // Total perhitungan
  let totalSpent = 0;
  let totalSavings = 0;
  items.forEach((item) => {
    const calc = calculateItemPrice(item);
    totalSpent += calc.finalTotal;
    totalSavings += calc.totalDiscountAmount;
  });

  const isOverBudget = totalSpent > budgetSettings.monthlyBudget;
  const remainingBudget = budgetSettings.monthlyBudget - totalSpent;

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
      notes: notes.trim(),
    };

    onConfirmCheckout(newTrip);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
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
                <strong>Peringatan Dompet:</strong> Total belanja melebihi batas jatah bulanan sebesar{' '}
                <strong>{formatRupiah(Math.abs(remainingBudget))}</strong>. Pastikan uang tunai atau saldo rekening mencukupi!
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
                <strong>Dompet Aman!</strong> Total belanjaan terkontrol. Sisa uang saku setelah belanja ini:{' '}
                <strong>{formatRupiah(remainingBudget)}</strong>.
              </div>
            </div>
          )}

          {/* Rincian Kasir Ringkas */}
          <div className="card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: 6 }}>
              <span>Jumlah Barang:</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{items.length} Macam Barang</span>
            </div>

            {totalSavings > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fbbf24', marginBottom: 6 }}>
                <span>Total Hemat Promo:</span>
                <span style={{ fontWeight: 700 }}>
                  <Tag size={12} style={{ display: 'inline', marginRight: 4 }} />
                  -{formatRupiah(totalSavings)}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: 8 }}>
              <span>Batas Anggaran Saku:</span>
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
              <span>{formatRupiah(totalSpent)}</span>
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

          <p style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.4 }}>
            💡 Menekan tombol di bawah akan menyimpan struk ini ke tab <strong>Riwayat</strong> dan memperbarui patokan harga barang untuk perbandingan bulan depan secara otomatis.
          </p>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Kembali
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 2 }}>
              <CheckCircle size={18} />
              <span>Simpan Struk & Selesai</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
