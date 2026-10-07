import React, { useState } from 'react';
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Edit2,
  Trash2,
  ShoppingCart,
  Receipt,
  HelpCircle,
  Zap,
  Share2,
  CheckCircle2,
  Circle,
  ShieldCheck,
  Heart,
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
  onAddItem: () => void;
  onOpenPresets: () => void;
  onOpenShare: () => void;
  onEditItem: (item: GroceryItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onToggleCheckItem: (id: string) => void;
  onCheckout: () => void;
}

const FILTER_CATEGORIES: (CategoryType | 'Semua')[] = [
  'Semua',
  'Bahan Pokok',
  'Bumbu & Dapur',
  'Mandi & Kebersihan',
  'Makanan & Camilan',
  'Minuman',
  'Kebutuhan Kamar',
  'Lain-lain',
];

export const GroceryList: React.FC<GroceryListProps> = ({
  items,
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

  return (
    <div className="grocery-list-section">
      {/* Top Action Bar: Search, Quick Preset, Share & Add */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 36, height: 40, fontSize: '13px' }}
            placeholder="Cari item di rak belanja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tombol Katalog Cepat 1-Tap */}
        <button
          className="btn-secondary"
          style={{
            height: 40,
            padding: '0 12px',
            fontSize: '12px',
            flexShrink: 0,
            borderColor: 'rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            background: 'rgba(245, 158, 11, 0.1)',
          }}
          onClick={onOpenPresets}
          title="Katalog Cepat 1-Tap Barang Rutin Kos"
        >
          <Zap size={16} />
          <span style={{ fontWeight: 600 }}>Cepat</span>
        </button>

        {/* Tombol Bagikan WhatsApp / Checklist */}
        <button
          className="btn-secondary"
          style={{
            height: 40,
            padding: '0 12px',
            fontSize: '12px',
            flexShrink: 0,
            borderColor: 'rgba(34, 197, 94, 0.4)',
            color: '#4ade80',
            background: 'rgba(34, 197, 94, 0.1)',
          }}
          onClick={onOpenShare}
          title="Bagikan ke WhatsApp & Salin Checklist"
        >
          <Share2 size={16} />
        </button>

        {/* Tombol Tambah Barang Manual */}
        <button
          className="btn-primary"
          style={{ height: 40, padding: '0 14px', flexShrink: 0, fontSize: '12.5px' }}
          onClick={onAddItem}
          title="Tambah barang manual"
        >
          <Plus size={16} />
          <span>Tambah</span>
        </button>
      </div>

      {/* Mode Checklist Lorong Toko Status Bar */}
      {items.length > 0 && (
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '10px 12px',
            marginBottom: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCheck size={15} color="#34d399" />
              <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 600 }}>
                Progress Troli Fisik:
              </span>
              <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 700 }}>
                {checkedCount} / {items.length} Barang ({progressPercent}%)
              </span>
            </div>

            {/* Quick Status Filter Tabs */}
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className={`category-pill ${statusFilter === 'all' ? 'active' : ''}`}
                style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '6px' }}
                onClick={() => setStatusFilter('all')}
              >
                Semua
              </button>
              <button
                className={`category-pill ${statusFilter === 'pending' ? 'active' : ''}`}
                style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '6px' }}
                onClick={() => setStatusFilter('pending')}
              >
                Belum ({items.length - checkedCount})
              </button>
              <button
                className={`category-pill ${statusFilter === 'checked' ? 'active' : ''}`}
                style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '6px' }}
                onClick={() => setStatusFilter('checked')}
              >
                Sudah ({checkedCount})
              </button>
            </div>
          </div>

          {/* Checklist Progress Bar */}
          <div style={{ height: 4, width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="filter-pills-row">
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Section Sub-header */}
      <div className="section-header">
        <div className="section-title">
          <span>Daftar Troli Belanja</span>
          <span className="item-count-badge">{items.length} Barang</span>
        </div>

        {items.length > 0 && (
          <button
            className="btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
              boxShadow: '0 3px 10px rgba(37, 99, 235, 0.3)',
            }}
            onClick={onCheckout}
          >
            <Receipt size={14} />
            <span>Selesaikan & Simpan</span>
          </button>
        )}
      </div>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon-circle">
            <ShoppingCart size={32} />
          </div>
          <h3>Keranjang Belanja Masih Kosong</h3>
          <p>
            {searchQuery
              ? `Tidak ditemukan barang dengan kata kunci "${searchQuery}".`
              : 'Belum ada barang di troli Rian. Pilih Katalog Cepat untuk 1-tap tambah barang atau ketuk tombol di bawah.'}
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button className="btn-secondary" onClick={onOpenPresets} style={{ fontSize: '12.5px' }}>
              <Zap size={15} color="#fbbf24" />
              <span>Buka Katalog Cepat</span>
            </button>
            <button className="btn-primary" onClick={onAddItem} style={{ fontSize: '12.5px' }}>
              <Plus size={16} />
              <span>Tambah Manual</span>
            </button>
          </div>
        </div>
      )}

      {/* Item Cards List */}
      <div className="items-container">
        {filteredItems.map((item) => {
          const calc = calculateItemPrice(item);
          const comp = compareWithLastMonth(calc.discountedUnitPrice, item.lastMonthPrice);
          const isChecked = !!item.isCheckedInCart;

          return (
            <div
              key={item.id}
              className={`grocery-item-card ${isChecked ? 'item-checked-card' : ''}`}
              style={{
                opacity: isChecked ? 0.78 : 1,
                borderColor: isChecked ? 'rgba(16, 185, 129, 0.4)' : undefined,
                transition: 'all 0.2s ease',
              }}
            >
              {/* Item Header / Title row */}
              <div className="item-main-row">
                {/* Touch Checkbox for in-store checklist */}
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
                    marginTop: 2,
                    color: isChecked ? '#34d399' : '#64748b',
                    flexShrink: 0,
                  }}
                  title={isChecked ? 'Tandai belum diambil' : 'Tandai sudah masuk troli'}
                >
                  {isChecked ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>

                <div className="item-info-col" style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <h3
                      className="item-name"
                      style={{
                        textDecoration: isChecked ? 'line-through' : 'none',
                        color: isChecked ? '#94a3b8' : '#fff',
                        margin: 0,
                      }}
                    >
                      {item.name}
                    </h3>

                    {/* Priority Badge */}
                    <span
                      style={{
                        fontSize: '9.5px',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        background:
                          item.priority === 'optional'
                            ? 'rgba(245, 158, 11, 0.15)'
                            : 'rgba(16, 185, 129, 0.15)',
                        color: item.priority === 'optional' ? '#fbbf24' : '#34d399',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      {item.priority === 'optional' ? (
                        <>
                          <Heart size={9} />
                          <span>Jajan</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={9} />
                          <span>Wajib</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="item-meta-row" style={{ marginTop: 4 }}>
                    <span className="category-tag">{item.category}</span>

                    {/* F-04: Komparator Harga vs Bulan Lalu */}
                    {comp.trend === 'up' && (
                      <span className="trend-indicator up" title={`Naik ${formatRupiah(comp.difference)} dibanding bulan lalu`}>
                        <TrendingUp size={12} />
                        <span>↑ +{comp.percentChange}%</span>
                      </span>
                    )}

                    {comp.trend === 'down' && (
                      <span className="trend-indicator down" title={`Turun ${formatRupiah(Math.abs(comp.difference))} dibanding bulan lalu`}>
                        <TrendingDown size={12} />
                        <span>↓ {comp.percentChange}%</span>
                      </span>
                    )}

                    {comp.trend === 'equal' && (
                      <span className="trend-indicator equal" title="Harga stabil sama seperti bulan lalu">
                        <Minus size={12} />
                        <span>= Stabil</span>
                      </span>
                    )}

                    {comp.trend === 'new' && (
                      <span className="trend-indicator new" title="Belum ada riwayat bulan lalu">
                        <HelpCircle size={11} />
                        <span>Barang Baru</span>
                      </span>
                    )}

                    {/* F-03: Promo Badge */}
                    {item.discountType === 'stacked' && (
                      <span className="promo-tag" title="Diskon bertumpuk">
                        <Sparkles size={11} />
                        <span>Promo {item.discountPercent1}% + {item.discountPercent2}%</span>
                      </span>
                    )}
                    {item.discountType === 'single' && (
                      <span className="promo-tag">
                        <Sparkles size={11} />
                        <span>Diskon {item.discountPercent1}%</span>
                      </span>
                    )}
                    {item.discountType === 'nominal' && (
                      <span className="promo-tag">
                        <Sparkles size={11} />
                        <span>Potongan {formatRupiah(item.discountNominal || 0)}</span>
                      </span>
                    )}
                  </div>

                  {item.notes && (
                    <p style={{ fontSize: '11px', color: '#64748b', marginTop: 4 }}>
                      📝 {item.notes}
                    </p>
                  )}
                </div>

                {/* Edit & Delete Buttons */}
                <div className="item-action-btns">
                  <button
                    className="icon-action-btn"
                    onClick={() => onEditItem(item)}
                    title="Ubah item"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="icon-action-btn delete"
                    onClick={() => onDeleteItem(item.id)}
                    title="Hapus dari troli"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Bottom Row: Stepper (F-02) & Subtotal */}
              <div className="item-bottom-row">
                {/* Touch-Friendly Stepper */}
                <div className="stepper-group">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, Number(item.quantity) - 1))}
                    title="Kurangi kuantitas"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    className="stepper-input"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      if (!isNaN(val) && val >= 0) {
                        onUpdateQuantity(item.id, val);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => onUpdateQuantity(item.id, Number(item.quantity) + 1)}
                    title="Tambah kuantitas"
                  >
                    +
                  </button>
                </div>

                {/* Harga dan Subtotal Realtime */}
                <div className="item-subtotal-group">
                  {calc.totalDiscountAmount > 0 && (
                    <span className="subtotal-strikethrough">
                      {formatRupiah(calc.baseTotal)}
                    </span>
                  )}
                  <span className="subtotal-final">
                    {formatRupiah(calc.finalTotal)}
                  </span>
                  <div className="unit-price-sub">
                    @{formatRupiah(calc.discountedUnitPrice)} / {item.unit}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
