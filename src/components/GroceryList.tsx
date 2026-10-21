import React, { useState } from 'react';
import {
  Plus,
  Search,
  Zap,
  CheckCircle2,
  Circle,
  Edit2,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Scale,
  Share2
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
  onOpenComparator?: () => void;
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
  onOpenComparator,
  onOpenShare,
  onEditItem,
  onDeleteItem,
  onUpdateQuantity,
  onToggleCheckItem,
  onCheckout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'Semua'>('Semua');

  const checkedCount = items.filter((i) => i.isCheckedInCart).length;

  // Total belanja aktif
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
    return matchesSearch && matchesCategory;
  });

  // Helper emoji barang
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* 1. Clean Compact Action Bar: Search + Katalog + Tambah */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={15}
            style={{ position: 'absolute', left: 11, top: 12, color: '#94a3b8' }}
          />
          <input
            type="text"
            className="form-input"
            style={{
              paddingLeft: 34,
              paddingRight: 10,
              height: 38,
              fontSize: '12.5px',
              borderRadius: 12,
              background: '#ffffff',
            }}
            placeholder="Cari barang di troli..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={onOpenPresets}
          style={{
            height: 38,
            padding: '0 12px',
            borderRadius: 12,
            border: '1px solid #fde68a',
            background: '#fef3c7',
            color: '#b45309',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            cursor: 'pointer',
            flexShrink: 0,
          }}
          title="Buka Katalog Cepat"
        >
          <Zap size={14} />
          <span>Katalog</span>
        </button>

        <button
          type="button"
          onClick={onAddItem}
          style={{
            height: 38,
            padding: '0 12px',
            borderRadius: 12,
            border: 'none',
            background: '#10b981',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
          }}
          title="Tambah Barang Baru"
        >
          <Plus size={15} strokeWidth={2.8} />
          <span>Tambah</span>
        </button>
      </div>

      {/* 2. Category Pills + Trolley Counter Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <div className="stitch-category-row" style={{ margin: 0, flex: 1, paddingBottom: 2 }}>
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`stitch-category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              <span>{CATEGORY_ICONS[cat] || '📦'}</span>
              <span>{cat === 'Semua' ? 'Semua' : cat}</span>
            </button>
          ))}
        </div>

        {items.length > 0 && (
          <div
            style={{
              fontSize: '11px',
              color: checkedCount === items.length ? '#059669' : '#64748b',
              fontWeight: 700,
              paddingLeft: 8,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            ✓ {checkedCount}/{items.length} di troli
          </div>
        )}
      </div>

      {/* Quick Helper Tools (Bandingkan & Bagikan WhatsApp) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: -4 }}>
        {onOpenComparator && (
          <button
            type="button"
            onClick={onOpenComparator}
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              borderRadius: 8,
              padding: '3px 8px',
              fontSize: '10.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
            }}
          >
            <Scale size={12} />
            <span>Kalkulator Kemasan</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenShare}
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#047857',
            borderRadius: 8,
            padding: '3px 8px',
            fontSize: '10.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            cursor: 'pointer',
          }}
        >
          <Share2 size={12} />
          <span>Bagikan WA</span>
        </button>
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="empty-state" style={{ padding: '32px 16px', background: '#ffffff', borderRadius: 18, border: '1px solid #e2e8f0' }}>
          <div className="empty-icon-circle" style={{ width: 50, height: 50 }}>
            <ShoppingCart size={24} color="#94a3b8" />
          </div>
          <h3 style={{ fontSize: '15px', color: '#0f172a', margin: '8px 0 4px' }}>Keranjang Masih Kosong</h3>
          <p style={{ fontSize: '12px', color: '#64748b', maxWidth: 280, margin: '0 auto 14px' }}>
            {searchQuery
              ? `Tidak ada barang dengan kata "${searchQuery}".`
              : 'Pilih barang dari Katalog Cepat atau catat manual dengan satu tangan.'}
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={onOpenPresets} style={{ fontSize: '11.5px', padding: '7px 12px' }}>
              <Zap size={13} color="#f59e0b" />
              <span>Buka Katalog</span>
            </button>
            <button className="btn-primary" onClick={onAddItem} style={{ fontSize: '11.5px', padding: '7px 12px' }}>
              <Plus size={14} />
              <span>Tambah Baru</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Product Cards List: Clean, High-Contrast & Simple */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredItems.map((item) => {
          const calc = calculateItemPrice(item);
          const comp = compareWithLastMonth(calc.discountedUnitPrice, item.lastMonthPrice);
          const isChecked = !!item.isCheckedInCart;
          const emoji = getItemEmoji(item.name, item.category);

          return (
            <div
              key={item.id}
              className={`stitch-product-card ${isChecked ? 'checked' : ''}`}
              style={{
                padding: '12px',
                borderRadius: 16,
                gap: 8,
                background: isChecked ? '#f8fafc' : '#ffffff',
                border: isChecked ? '1px solid #e2e8f0' : '1px solid #e2e8f0',
                boxShadow: isChecked ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.03)',
              }}
            >
              {/* Product Top Info Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                  }}
                  title={isChecked ? 'Tandai belum diambil' : 'Tandai sudah di troli'}
                >
                  {isChecked ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                {/* Product Photo or Emoji Icon */}
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0,
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.innerText = emoji;
                        }
                      }}
                    />
                  ) : (
                    emoji
                  )}
                </div>

                {/* Name & Unit Price */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <h3
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: isChecked ? '#94a3b8' : '#0f172a',
                        textDecoration: isChecked ? 'line-through' : 'none',
                        margin: 0,
                        lineHeight: 1.25,
                      }}
                    >
                      {item.name}
                    </h3>

                    {item.priority === 'optional' && (
                      <span
                        style={{
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {formatRupiah(item.unitPrice)} / {item.unit}
                    </span>

                    {/* Trend Pill Ringkas (Hanya jika ada selisih) */}
                    {comp.trend === 'up' && (
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 700,
                          color: '#dc2626',
                          background: '#fee2e2',
                          padding: '1px 5px',
                          borderRadius: 4,
                        }}
                      >
                        ↑ +{formatRupiah(comp.difference)}
                      </span>
                    )}
                    {comp.trend === 'down' && (
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 700,
                          color: '#15803d',
                          background: '#dcfce7',
                          padding: '1px 5px',
                          borderRadius: 4,
                        }}
                      >
                        ↓ -{formatRupiah(Math.abs(comp.difference))}
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Quick Icons */}
                <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => onEditItem(item)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 6,
                      cursor: 'pointer',
                      color: '#94a3b8',
                      borderRadius: 6,
                    }}
                    title="Ubah"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 6,
                      cursor: 'pointer',
                      color: '#cbd5e1',
                      borderRadius: 6,
                    }}
                    title="Hapus"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Promo Banner if applicable (Satu baris ringkas) */}
              {calc.totalDiscountAmount > 0 && (
                <div
                  style={{
                    background: '#ecfdf5',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: '10.5px',
                    color: '#065f46',
                    fontWeight: 700,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    🏷️ Promo{' '}
                    {item.discountType === 'stacked'
                      ? `${item.discountPercent1}% + ${item.discountPercent2}%`
                      : item.discountType === 'single'
                      ? `${item.discountPercent1}%`
                      : 'Potongan Tunai'}
                  </span>
                  <span>Hemat {formatRupiah(calc.totalDiscountAmount)}</span>
                </div>
              )}

              {/* Bottom Row: Subtotal & One-Handed Touch Stepper */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 6,
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                  <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 500, marginRight: 4 }}>
                    Subtotal:
                  </span>
                  {formatRupiah(calc.finalTotal)}
                </div>

                <div className="stitch-stepper" style={{ padding: '2px 4px' }}>
                  <button
                    type="button"
                    className="stitch-stepper-btn"
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, Number(item.quantity) - 1))}
                    style={{ width: 26, height: 26, fontSize: '14px' }}
                  >
                    -
                  </button>
                  <span className="stitch-stepper-value" style={{ fontSize: '12.5px', minWidth: 20 }}>
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className="stitch-stepper-btn plus"
                    onClick={() => onUpdateQuantity(item.id, Number(item.quantity) + 1)}
                    style={{ width: 26, height: 26, fontSize: '14px' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Sticky Bottom Checkout Bar: Simple & High Contrast */}
      {items.length > 0 && (
        <div className="stitch-sticky-checkout" style={{ padding: '12px 16px', gap: 8, borderRadius: 16 }}>
          <div className="stitch-checkout-info-row">
            <div>
              <div className="stitch-checkout-label" style={{ fontSize: '10.5px' }}>
                Total Belanja ({items.length} item)
              </div>
              <div className="stitch-checkout-price" style={{ fontSize: '18px' }}>
                {formatRupiah(totalSpent)}
              </div>
            </div>

            <div
              className={`stitch-status-pill ${isOverBudget ? 'danger' : 'safe'}`}
              style={{ fontSize: '11px', padding: '3px 8px' }}
            >
              {isOverBudget ? '⚠️ Over Budget' : '✓ Aman'}
            </div>
          </div>

          <button className="stitch-checkout-btn" onClick={onCheckout} style={{ padding: '10px 16px', borderRadius: 10 }}>
            <span>Checkout & Bayar</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

