import React, { useState, useEffect } from 'react';
import { X, Check, Sparkles, TrendingUp, TrendingDown, Minus, ShieldCheck, Heart } from 'lucide-react';
import type { GroceryItem, CategoryType, UnitType, DiscountType, ItemPriority } from '../types/grocery';
import { calculateItemPrice, compareWithLastMonth, formatRupiah } from '../lib/calculations';
import { getHistoricalBenchmarkPrice } from '../lib/storage';

interface AddEditItemModalProps {
  isOpen: boolean;
  itemToEdit: GroceryItem | null;
  onClose: () => void;
  onSave: (item: GroceryItem) => void;
}

const CATEGORIES: CategoryType[] = [
  'Bahan Pokok',
  'Bumbu & Dapur',
  'Mandi & Kebersihan',
  'Makanan & Camilan',
  'Minuman',
  'Kebutuhan Kamar',
  'Lain-lain',
];

const UNITS: UnitType[] = [
  'pcs',
  'pack',
  'kg',
  'liter',
  'botol',
  'kaleng',
  'bungkus',
  'gram',
];

export const AddEditItemModal: React.FC<AddEditItemModalProps> = ({
  isOpen,
  itemToEdit,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryType>('Bahan Pokok');
  const [unit, setUnit] = useState<UnitType>('pcs');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [lastMonthPrice, setLastMonthPrice] = useState<number | null>(null);
  const [discountType, setDiscountType] = useState<DiscountType>('none');
  const [discountPercent1, setDiscountPercent1] = useState<number>(0);
  const [discountPercent2, setDiscountPercent2] = useState<number>(0);
  const [discountNominal, setDiscountNominal] = useState<number>(0);
  const [priority, setPriority] = useState<ItemPriority>('essential');
  const [notes, setNotes] = useState('');

  // Sinkronkan state saat modal dibuka atau itemToEdit berubah
  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setUnit(itemToEdit.unit);
      setQuantity(itemToEdit.quantity);
      setUnitPrice(itemToEdit.unitPrice);
      setLastMonthPrice(itemToEdit.lastMonthPrice ?? null);
      setDiscountType(itemToEdit.discountType);
      setDiscountPercent1(itemToEdit.discountPercent1 ?? 0);
      setDiscountPercent2(itemToEdit.discountPercent2 ?? 0);
      setDiscountNominal(itemToEdit.discountNominal ?? 0);
      setPriority(itemToEdit.priority ?? 'essential');
      setNotes(itemToEdit.notes ?? '');
    } else {
      setName('');
      setCategory('Bahan Pokok');
      setUnit('pcs');
      setQuantity(1);
      setUnitPrice(0);
      setLastMonthPrice(null);
      setDiscountType('none');
      setDiscountPercent1(0);
      setDiscountPercent2(0);
      setDiscountNominal(0);
      setPriority('essential');
      setNotes('');
    }
  }, [itemToEdit, isOpen]);

  // Cek apakah ada benchmark otomatis saat user mengetik nama barang baru
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!itemToEdit && val.length > 2) {
      const benchmark = getHistoricalBenchmarkPrice(val);
      if (benchmark && (!lastMonthPrice || lastMonthPrice === 0)) {
        setLastMonthPrice(benchmark);
      }
    }
  };

  if (!isOpen) return null;

  // Item tiruan untuk live preview perhitungan
  const previewItem: GroceryItem = {
    id: itemToEdit ? itemToEdit.id : 'preview',
    name: name || 'Nama Barang',
    category,
    unit,
    quantity,
    unitPrice,
    lastMonthPrice,
    discountType,
    discountPercent1,
    discountPercent2,
    discountNominal,
    priority,
    isCheckedInCart: itemToEdit?.isCheckedInCart ?? false,
    notes,
    createdAt: new Date().toISOString(),
  };

  const calculated = calculateItemPrice(previewItem);
  const comparison = compareWithLastMonth(calculated.discountedUnitPrice, lastMonthPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama barang wajib diisi!');
      return;
    }
    if (unitPrice <= 0) {
      alert('Harga satuan harus lebih besar dari Rp 0!');
      return;
    }

    const finalItem: GroceryItem = {
      id: itemToEdit ? itemToEdit.id : `item-${Date.now()}`,
      name: name.trim(),
      category,
      unit,
      quantity: Math.max(0.1, Number(quantity) || 1),
      unitPrice: Math.max(0, Number(unitPrice) || 0),
      lastMonthPrice: lastMonthPrice && lastMonthPrice > 0 ? Number(lastMonthPrice) : null,
      discountType,
      discountPercent1: discountType === 'single' || discountType === 'stacked' ? Number(discountPercent1) || 0 : 0,
      discountPercent2: discountType === 'stacked' ? Number(discountPercent2) || 0 : 0,
      discountNominal: discountType === 'nominal' ? Number(discountNominal) || 0 : 0,
      priority,
      isCheckedInCart: itemToEdit?.isCheckedInCart ?? false,
      notes: notes.trim(),
      createdAt: itemToEdit ? itemToEdit.createdAt : new Date().toISOString(),
    };

    onSave(finalItem);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle-bar" />
        
        <div className="sheet-header">
          <h2>{itemToEdit ? 'Ubah Item Belanja' : 'Tambah Barang ke Keranjang'}</h2>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="sheet-body" onSubmit={handleSubmit}>
          {/* Nama Barang */}
          <div className="form-group">
            <label className="form-label">Nama Produk / Barang *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Beras Ramos 5kg, Minyak Goreng..."
              value={name}
              onChange={handleNameChange}
              required
              autoFocus
            />
          </div>

          {/* Kategori & Satuan */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Satuan</label>
              <select
                className="form-select"
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Prioritas Belanja (Wajib vs Jajan/Opsional) */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Prioritas Kebutuhan</span>
              <span style={{ fontSize: '11px', color: priority === 'essential' ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
                {priority === 'essential' ? 'Wajib (Kebutuhan Pokok)' : 'Jajan / Opsional'}
              </span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button
                type="button"
                className={`btn-secondary ${priority === 'essential' ? 'btn-primary' : ''}`}
                style={{
                  padding: '8px 10px',
                  fontSize: '12px',
                  borderRadius: '10px',
                  background: priority === 'essential' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: priority === 'essential' ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                  color: priority === 'essential' ? '#34d399' : '#94a3b8',
                }}
                onClick={() => setPriority('essential')}
              >
                <ShieldCheck size={14} />
                <span>Wajib (Pokok)</span>
              </button>
              <button
                type="button"
                className={`btn-secondary ${priority === 'optional' ? 'btn-primary' : ''}`}
                style={{
                  padding: '8px 10px',
                  fontSize: '12px',
                  borderRadius: '10px',
                  background: priority === 'optional' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  borderColor: priority === 'optional' ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)',
                  color: priority === 'optional' ? '#fbbf24' : '#94a3b8',
                }}
                onClick={() => setPriority('optional')}
              >
                <Heart size={14} />
                <span>Jajan (Opsional)</span>
              </button>
            </div>
          </div>

          {/* Kuantitas & Harga Satuan */}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Kuantitas (Qty) *</label>
              <input
                type="number"
                step="any"
                min="0.1"
                className="form-input"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Harga Satuan Asli (Rp) *</label>
              <input
                type="number"
                min="0"
                step="100"
                className="form-input"
                placeholder="25000"
                value={unitPrice || ''}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Harga Riwayat Bulan Lalu (F-04) */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Harga Bulan Lalu (Pembanding Struk Lama)</span>
              {lastMonthPrice && (
                <span style={{ color: '#38bdf8', fontSize: '11px' }}>
                  Tercatat: {formatRupiah(lastMonthPrice)}
                </span>
              )}
            </label>
            <input
              type="number"
              min="0"
              step="100"
              className="form-input"
              placeholder="Kosongkan jika produk baru pertama kali dibeli"
              value={lastMonthPrice !== null ? lastMonthPrice : ''}
              onChange={(e) => setLastMonthPrice(e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>

          {/* Jenis Diskon / Promo (F-03) */}
          <div className="form-group">
            <label className="form-label">Jenis Promo / Diskon Supermarket</label>
            <select
              className="form-select"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value as DiscountType)}
            >
              <option value="none">Harga Normal (Tanpa Promo)</option>
              <option value="single">Diskon Tunggal (%) (Contoh: Potongan 20%)</option>
              <option value="stacked">Diskon Bertingkat (% + %) (Contoh: 50% + 20%)</option>
              <option value="nominal">Potongan Langsung Tunai (Rp) (Contoh: Potongan Rp 15.000)</option>
            </select>
          </div>

          {/* Input Diskon Sesuai Pilihan */}
          {discountType === 'single' && (
            <div className="form-group">
              <label className="form-label">Besar Diskon (%)</label>
              <input
                type="number"
                min="1"
                max="99"
                className="form-input"
                placeholder="Contoh: 25"
                value={discountPercent1 || ''}
                onChange={(e) => setDiscountPercent1(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          {discountType === 'stacked' && (
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Diskon Pertama (%)</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  className="form-input"
                  placeholder="50"
                  value={discountPercent1 || ''}
                  onChange={(e) => setDiscountPercent1(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Diskon Ekstra 2 (%)</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  className="form-input"
                  placeholder="20"
                  value={discountPercent2 || ''}
                  onChange={(e) => setDiscountPercent2(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          )}

          {discountType === 'nominal' && (
            <div className="form-group">
              <label className="form-label">Potongan Harga Langsung (Rp)</label>
              <input
                type="number"
                min="100"
                step="500"
                className="form-input"
                placeholder="Contoh: 15000"
                value={discountNominal || ''}
                onChange={(e) => setDiscountNominal(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}

          {/* Live Calculation Preview Card (F-02, F-03, F-04) */}
          <div className="calc-preview-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, color: '#10b981', fontWeight: 700, fontSize: '13px' }}>
              <Sparkles size={15} />
              <span>Simulasi Cerdas Kasir Realtime</span>
            </div>

            <div className="calc-preview-row">
              <span>Harga Normal ({quantity} {unit}):</span>
              <span>{formatRupiah(calculated.baseTotal)}</span>
            </div>

            {calculated.totalDiscountAmount > 0 && (
              <div className="calc-preview-row" style={{ color: '#fbbf24' }}>
                <span>Total Potongan Promo:</span>
                <span>-{formatRupiah(calculated.totalDiscountAmount)} ({calculated.effectiveDiscountRate}%)</span>
              </div>
            )}

            <div className="calc-preview-row">
              <span>Harga Satuan Akhir:</span>
              <span style={{ fontWeight: 700, color: '#fff' }}>
                {formatRupiah(calculated.discountedUnitPrice)} / {unit}
              </span>
            </div>

            {/* Komparasi Bulan Lalu */}
            {lastMonthPrice && lastMonthPrice > 0 && (
              <div className="calc-preview-row" style={{ marginTop: 4, paddingTop: 4, borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                <span>Tren vs Bulan Lalu:</span>
                <span>
                  {comparison.trend === 'up' && (
                    <span style={{ color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 700 }}>
                      <TrendingUp size={13} /> Naik +{formatRupiah(comparison.difference)} (+{comparison.percentChange}%)
                    </span>
                  )}
                  {comparison.trend === 'down' && (
                    <span style={{ color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: 2, fontWeight: 700 }}>
                      <TrendingDown size={13} /> Turun {formatRupiah(Math.abs(comparison.difference))} ({comparison.percentChange}%)
                    </span>
                  )}
                  {comparison.trend === 'equal' && (
                    <span style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                      <Minus size={13} /> Sama persis
                    </span>
                  )}
                </span>
              </div>
            )}

            <div className="calc-preview-total">
              <span>Total Baris Tagihan:</span>
              <span>{formatRupiah(calculated.finalTotal)}</span>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div className="form-group">
            <label className="form-label">Catatan Barang (Opsional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Merek Indomie rasa rendang, sedia stok 2 minggu"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 2 }}>
              <Check size={18} />
              <span>{itemToEdit ? 'Simpan Perubahan' : 'Masukkan ke Troli'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
