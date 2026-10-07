import React, { useState } from 'react';
import {
  Plus,
  Search,
  Zap,
  Share2,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  ShoppingCart,
  ArrowRight,
  CheckCheck
} from 'lucide-react';
import type { GroceryItem, CategoryType } from '../types/grocery';
import {
  calculateItemPrice,
  compareWithLastMonth,
  formatRupiah,
} from '../lib/calculations';

interface GroceryListProps {
  items: GroceryItem[];
  budgetLimit: number;
  onAddItem: () => void;
  onOpenPresets: () => void;
  onOpenShare: () => void;
  onEditItem: (item: GroceryItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onToggleCheckItem: (id: string) => void;
  onCheckout: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'Semua': '🛒',
  'Bahan Pokok': '🌾',
  'Bumbu & Dapur': '🍳',
  'Mandi & Kebersihan': '🧼',
  'Makanan & Camilan': '🍜',
  'Minuman': '🚰',
  'Kebutuhan Kamar': '🛏️',
  'Lain-lain': '📦',
};

const FILTER_CATEGORIES: (CategoryType | 'Semua')[] = [
  'Semua',
  'Bahan Pokok',
  'Mandi & Kebersihan',
  'Bumbu & Dapur',
  'Makanan & Camilan',
  'Minuman',
  'Kebutuhan Kamar',
  'Lain-lain',
];

export const GroceryList: React.FC<GroceryListProps> = ({
  items,
  budgetLimit,
  onAddItem,
  onOpenPresets,
  onOpenShare,
  onEditItem,
  onDeleteItem,
  onUpdateQuantity,
  onToggleCheckItem,
  onCheckout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'Semua'>('Semua');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'checked'>('all');

  const checkedCount = items.filter((i) => i.isCheckedInCart).length;
  const progressPercent = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  // Total perhitungan aktif
  let totalSpent = 0;
  items.forEach((item) => {
    const calc = calculateItemPrice(item);
    totalSpent += calc.finalTotal;
  });
  const isOverBudget = totalSpent > budgetLimit;

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'checked' && item.isCheckedInCart) ||
      (statusFilter === 'pending' && !item.isCheckedInCart);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Helper untuk emoji barang
  const getItemEmoji = (name: string, category: string): string => {
    const n = name.toLowerCase();
    if (n.includes('beras')) return '🍚';
    if (n.includes('minyak')) return '🍳';
    if (n.includes('telur')) return '🥚';
    if (n.includes('sabun') || n.includes('lantai')) return '🧼';
    if (n.includes('mie') || n.includes('indomie')) return '🍜';
    if (n.includes('kopi')) return '☕';
    if (n.includes('teh')) return '🍵';
    if (n.includes('gula')) return '🧂';
    if (n.includes('shampoo')) return '🧴';
    if (n.includes('pasta') || n.includes('gigi')) return '🪥';
    if (n.includes('keripik') || n.includes('biskuit')) return '🍪';
    if (n.includes('air') || n.includes('galon')) return '🚰';
    return CATEGORY_ICONS[category] || '📦';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Primary Action Button: + Catat Barang Baru ke Troli (Stitch Screen 2) */}
      <button className="btn-primary-stitch" onClick={onAddItem}>
        <div className="stitch-plus-circle">
          <Plus size={16} strokeWidth={3} />
        </div>
        <span>Catat Barang Baru ke Troli</span>
      </button>

      {/* Action Toolbar: Search + Quick Presets + Share WA */}
      <div className="stitch-toolbar">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={15}
            style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 34, height: 38, fontSize: '12.5px', borderRadius: 10 }}
            placeholder="Cari barang di troli..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="stitch-tool-btn"
          onClick={onOpenPresets}
          title="Katalog Cepat 1-Tap Kebutuhan Kos"
          style={{ background: '#fef3c7', borderColor: '#fde68a', color: '#b45309' }}
        >
          <Zap size={15} />
          <span>Katalog Cepat</span>
        </button>

        <button
          type="button"
          className="stitch-tool-btn"
          onClick={onOpenShare}
          title="Bagikan Checklist ke WhatsApp"
          style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' }}
        >
          <Share2 size={15} />
        </button>
      </div>

      {/* Mode Checklist Lorong Toko Status Bar */}
      {items.length > 0 && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '12px' }}>
              <CheckCheck size={16} color="#10b981" />
              <span style={{ fontWeight: 600, color: '#475569' }}>Progress Troli Fisik:</span>
              <strong style={{ color: '#10b981' }}>
                {checkedCount} / {items.length} ({progressPercent}%)
              </strong>
            </div>

            <div style={{ display: 'flex', gap: 4 }}>
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                style={{
                  fontSize: '10.5px',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: statusFilter === 'all' ? '1px solid #10b981' : '1px solid #e2e8f0',
                  background: statusFilter === 'all' ? '#ecfdf5' : '#fff',
                  color: statusFilter === 'all' ? '#047857' : '#64748b',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                style={{
                  fontSize: '10.5px',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: statusFilter === 'pending' ? '1px solid #10b981' : '1px solid #e2e8f0',
                  background: statusFilter === 'pending' ? '#ecfdf5' : '#fff',
                  color: statusFilter === 'pending' ? '#047857' : '#64748b',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Belum ({items.length - checkedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('checked')}
                style={{
                  fontSize: '10.5px',
                  padding: '2px 8px',
                  borderRadius: 6,
                  border: statusFilter === 'checked' ? '1px solid #10b981' : '1px solid #e2e8f0',
                  background: statusFilter === 'checked' ? '#ecfdf5' : '#fff',
                  color: statusFilter === 'checked' ? '#047857' : '#64748b',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sudah ({checkedCount})
              </button>
            </div>
          </div>

          <div className="stitch-progress-bar-wrap" style={{ height: 5 }}>
            <div
              className="stitch-progress-bar-fill safe"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Category Filter Pills (Stitch Screen 2 Style) */}
      <div className="stitch-category-row">
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`stitch-category-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            <span>{CATEGORY_ICONS[cat] || '📦'}</span>
            <span>
              {cat === 'Semua' ? `Semua (${items.length})` : cat}
            </span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-circle">
            <ShoppingCart size={30} />
          </div>
          <h3>Keranjang Masih Kosong</h3>
          <p>
            {searchQuery
              ? `Tidak ada barang dengan kata kunci "${searchQuery}".`
              : 'Belum ada barang di troli belanja Rian. Buka Katalog Cepat atau catat barang baru di atas.'}
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={onOpenPresets} style={{ fontSize: '12px' }}>
              <Zap size={14} color="#f59e0b" />
              <span>Buka Katalog Cepat</span>
            </button>
            <button className="btn-primary" onClick={onAddItem} style={{ fontSize: '12px' }}>
              <Plus size={15} />
              <span>Tambah Manual</span>
            </button>
          </div>
        </div>
      )}

      {/* Product Cards List (Stitch Screen 2 Style) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filteredItems.map((item) => {
          const calc = calculateItemPrice(item);
          const comp = compareWithLastMonth(calc.discountedUnitPrice, item.lastMonthPrice);
          const isChecked = !!item.isCheckedInCart;
          const emoji = getItemEmoji(item.name, item.category);

          return (
            <div
              key={item.id}
              className={`stitch-product-card ${isChecked ? 'checked' : ''}`}
            >
              <div className="stitch-product-top">
                {/* Touch Checkbox */}
                <button
                  type="button"
                  onClick={() => onToggleCheckItem(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isChecked ? '#10b981' : '#cbd5e1',
                    flexShrink: 0,
                    marginTop: 10,
                  }}
                  title={isChecked ? 'Tandai belum diambil' : 'Tandai sudah masuk troli'}
                >
                  {isChecked ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>

                {/* Product Emoji Icon Wrap */}
                <div className="stitch-product-icon-wrap">
                  {emoji}
                </div>

                {/* Info Col */}
                <div className="stitch-product-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                    <div>
                      <h3 className="stitch-product-name">{item.name}</h3>
                      <div className="stitch-product-meta">
                        Satuan: {item.unit} • {formatRupiah(item.unitPrice)}
                        {item.priority === 'optional' && (
                          <span
                            style={{
                              marginLeft: 6,
                              fontSize: '9.5px',
                              background: '#fef3c7',
                              color: '#b45309',
                              padding: '1px 5px',
                              borderRadius: 4,
                              fontWeight: 700,
                            }}
                          >
                            Jajan
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Trend Badge (Stitch Style) */}
                    <div>
                      {comp.trend === 'up' && (
                        <span className="stitch-trend-badge up">
                          {formatRupiah(item.lastMonthPrice || 0)} | Naik (+{formatRupiah(comp.difference)})
                        </span>
                      )}
                      {comp.trend === 'down' && (
                        <span className="stitch-trend-badge down">
                          {formatRupiah(item.lastMonthPrice || 0)} | Turun (-{formatRupiah(Math.abs(comp.difference))})
                        </span>
                      )}
                      {comp.trend === 'equal' && (
                        <span className="stitch-trend-badge equal">
                          {formatRupiah(item.lastMonthPrice || 0)} = Stabil
                        </span>
                      )}
                      {comp.trend === 'new' && (
                        <span className="stitch-trend-badge new">
                          Barang Baru
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Promo Banner if applicable */}
                  {item.discountType === 'stacked' && (
                    <div className="stitch-promo-banner" style={{ marginTop: 8 }}>
                      <span>🏷️ Promo {item.discountPercent1}% + {item.discountPercent2}%</span>
                      <span>Hemat {formatRupiah(calc.totalDiscountAmount)}</span>
                    </div>
                  )}
                  {item.discountType === 'single' && (
                    <div className="stitch-promo-banner" style={{ marginTop: 8 }}>
                      <span>🏷️ Diskon {item.discountPercent1}%</span>
                      <span>Hemat {formatRupiah(calc.totalDiscountAmount)}</span>
                    </div>
                  )}
                  {item.discountType === 'nominal' && (
                    <div className="stitch-promo-banner" style={{ marginTop: 8 }}>
                      <span>🏷️ Potongan Tunai {formatRupiah(item.discountNominal || 0)}</span>
                      <span>Hemat {formatRupiah(calc.totalDiscountAmount)}</span>
                    </div>
                  )}

                  {item.notes && (
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '6px 0 0' }}>
                      📝 {item.notes}
                    </p>
                  )}
                </div>

                {/* Edit & Delete Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <button
                    className="icon-action-btn"
                    onClick={() => onEditItem(item)}
                    title="Ubah barang"
                    style={{ width: 28, height: 28 }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    className="icon-action-btn delete"
                    onClick={() => onDeleteItem(item.id)}
                    title="Hapus barang"
                    style={{ width: 28, height: 28 }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Bottom Row: Subtotal & Touch Stepper (Stitch Screen 2) */}
              <div className="stitch-product-bottom">
                <div className="stitch-product-subtotal">
                  <span>Subtotal:</span>
                  {formatRupiah(calc.finalTotal)}
                </div>

                <div className="stitch-stepper">
                  <button
                    type="button"
                    className="stitch-stepper-btn"
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, Number(item.quantity) - 1))}
                  >
                    -
                  </button>
                  <span className="stitch-stepper-value">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="stitch-stepper-btn plus"
                    onClick={() => onUpdateQuantity(item.id, Number(item.quantity) + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky Bottom Floating Checkout Bar (Stitch Screen 2) */}
      {items.length > 0 && (
        <div className="stitch-sticky-checkout">
          <div className="stitch-checkout-info-row">
            <div>
              <div className="stitch-checkout-label">Total Estimasi ({items.length} pcs)</div>
              <div className="stitch-checkout-price">{formatRupiah(totalSpent)}</div>
            </div>

            <div
              className={`stitch-status-pill ${isOverBudget ? 'danger' : 'safe'}`}
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
            >
              {isOverBudget ? '⚠️ Over Budget' : '✓ Sesuai Anggaran'}
            </div>
          </div>

          <button className="stitch-checkout-btn" onClick={onCheckout}>
            <span>Checkout & Simpan ke Riwayat</span>
            <ArrowRight size={17} />
          </button>
        </div>
      )}
    </div>
  );
};
