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
  Share2,
  Package,
  Tag,
  Check,
  Store,
  Calendar,
  Clock,
  MapPin,
} from 'lucide-react';
import type { GroceryItem, CategoryType } from '../types/grocery';
import {
  calculateItemPrice,
  compareWithLastMonth,
  formatRupiah,
} from '../lib/calculations';
import { resolveProductImageUrl } from '../lib/productImages';

interface GroceryListProps {
  items: GroceryItem[];
  budgetLimit: number;
  selectedStore?: string;
  sessionDate?: string;
  onStoreChange?: (store: string) => void;
  onDateChange?: (date: string) => void;
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

const STORE_OPTIONS = [
  'Lotte Mart Grocery - Puri Indah',
  'Super Indo - Puri Pesanggrahan',
  'Hypermart - Puri Indah Mall',
  'Indomaret Fresh - Kos Rian',
  'Pasar Tradisional Puri',
];

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
  selectedStore = 'Lotte Mart Grocery - Puri Indah',
  sessionDate = new Date().toISOString().slice(0, 10),
  onStoreChange,
  onDateChange,
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* 0. METADATA SESI BELANJA (SRS F-01: LOKASI TOKO & TANGGAL TRANSAKSI) */}
      <div
        className="card"
        style={{
          padding: '11px 14px',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: '1.5px solid #cbd5e1',
          borderRadius: 16,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#059669',
              }}
            >
              <Store size={13} />
            </div>
            <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.2px' }}>
              Sesi Belanja Aktif (SRS F-01)
            </span>
          </div>

          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              background: '#ecfdf5',
              color: '#059669',
              padding: '2px 7px',
              borderRadius: 6,
              border: '1px solid #a7f3d0',
            }}
          >
            Multi-Toko
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: 8 }}>
          {/* Selector Lokasi Toko */}
          <div>
            <label
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                marginBottom: 3,
              }}
            >
              <MapPin size={10} color="#059669" />
              <span>Lokasi Toko (Default):</span>
            </label>
            <select
              value={selectedStore}
              onChange={(e) => onStoreChange && onStoreChange(e.target.value)}
              className="form-select"
              style={{
                height: 34,
                fontSize: '11.5px',
                padding: '4px 8px',
                fontWeight: 700,
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                background: '#ffffff',
                width: '100%',
              }}
            >
              {STORE_OPTIONS.map((store) => (
                <option key={store} value={store}>
                  {store}
                </option>
              ))}
            </select>
          </div>

          {/* Selector Tanggal Belanja */}
          <div>
            <label
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                marginBottom: 3,
              }}
            >
              <Calendar size={10} color="#059669" />
              <span>Tanggal Belanja:</span>
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => onDateChange && onDateChange(e.target.value)}
              className="form-input"
              style={{
                height: 34,
                fontSize: '11px',
                padding: '4px 8px',
                fontWeight: 600,
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                background: '#ffffff',
                width: '100%',
              }}
            />
          </div>
        </div>

        <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} color="#10b981" />
          <span>
            Membandingkan patokan harga otomatis terhadap riwayat bulan lalu di{' '}
            <strong style={{ color: '#065f46' }}>{selectedStore.split(' - ')[0]}</strong>.
          </span>
        </div>
      </div>

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
              style={{ fontSize: '11px', padding: '5px 12px', fontWeight: 600 }}
            >
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
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Check size={13} strokeWidth={2.5} color={checkedCount === items.length ? '#059669' : '#64748b'} />
            <span>{checkedCount}/{items.length} di troli</span>
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

                {/* Product Photo with Auto-Resolve & Fallback */}
                {(() => {
                  const itemImg = item.imageUrl || resolveProductImageUrl(item.name, item.category);
                  return (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        position: 'relative',
                      }}
                    >
                      {itemImg ? (
                        <img
                          src={itemImg}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.fallback-pkg');
                            if (fallback) (fallback as HTMLElement).style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span
                        className="fallback-pkg"
                        style={{
                          display: itemImg ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
                          background: '#f8fafc',
                        }}
                      >
                        <Package size={20} color="#64748b" />
                      </span>
                    </div>
                  );
                })()}

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

                    {/* Trend Pill Ringkas (SRS F-04: Komparator Harga Realtime vs Riwayat Toko) */}
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
                        title={`Harga naik dibanding riwayat bulan lalu di ${selectedStore.split(' - ')[0]}`}
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
                        title={`Harga lebih hemat dibanding riwayat bulan lalu di ${selectedStore.split(' - ')[0]}`}
                      >
                        ↓ -{formatRupiah(Math.abs(comp.difference))}
                      </span>
                    )}
                    {comp.trend === 'equal' && item.lastMonthPrice !== undefined && item.lastMonthPrice !== null && (
                      <span
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 700,
                          color: '#475569',
                          background: '#f1f5f9',
                          padding: '1px 5px',
                          borderRadius: 4,
                        }}
                        title={`Harga stabil sama dengan riwayat bulan lalu di ${selectedStore.split(' - ')[0]}`}
                      >
                        = Tetap
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

              {/* Promo Banner on Item if any */}
              {item.discountType !== 'none' && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 8,
                    padding: '3px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '10.5px',
                    color: '#15803d',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Tag size={11} />
                    <span>
                      {item.discountType === 'stacked' && `Diskon Bertingkat (${item.discountPercent1}% + ${item.discountPercent2}%)`}
                      {item.discountType === 'single' && `Diskon ${item.discountPercent1}%`}
                      {item.discountType === 'nominal' && `Potongan Langsung ${formatRupiah(item.discountNominal || 0)}`}
                    </span>
                  </div>
                  <strong>Hemat {formatRupiah(calc.totalDiscountAmount)}</strong>
                </div>
              )}

              {/* Bottom Quantity Stepper & Price Calculation (F-02) */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 2,
                  paddingTop: 6,
                  borderTop: '1px solid #f1f5f9',
                }}
              >
                {/* Stepper Ramah Jempol (Touch-Friendly F-02) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f1f5f9',
                    borderRadius: 10,
                    padding: '2px',
                    gap: 4,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, Math.max(0.1, item.quantity - 1))}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: 'none',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                    title="Kurangi"
                  >
                    -
                  </button>

                  <span
                    style={{
                      minWidth: 32,
                      textAlign: 'center',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      color: '#0f172a',
                    }}
                  >
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: 'none',
                      background: '#ffffff',
                      color: '#0f172a',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                    title="Tambah"
                  >
                    +
                  </button>
                </div>

                {/* Total Per Item (Otomatis Dihitung Detik Itu Juga F-02) */}
                <div style={{ textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: isChecked ? '#94a3b8' : '#0f172a',
                      letterSpacing: '-0.3px',
                    }}
                  >
                    {formatRupiah(calc.finalTotal)}
                  </div>
                  {item.quantity > 1 && (
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                      @{formatRupiah(calc.discountedUnitPrice)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Checkout Floating Trigger Button */}
      {items.length > 0 && (
        <div style={{ marginTop: 8, marginBottom: 12 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onCheckout}
            style={{
              width: '100%',
              padding: '13px 16px',
              fontSize: '14px',
              fontWeight: 800,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
              background: isOverBudget
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShoppingCart size={18} />
              <span>Selesai Belanja di Kasir</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{formatRupiah(totalSpent)}</span>
              <ArrowRight size={16} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
