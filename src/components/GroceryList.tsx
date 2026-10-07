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
  HelpCircle
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
  onEditItem: (item: GroceryItem) => void;
  onDeleteItem: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
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
  onEditItem,
  onDeleteItem,
  onUpdateQuantity,
  onCheckout,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'Semua'>('Semua');

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="grocery-list-section">
      {/* Search Bar & Add Button */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: 12, top: 13, color: '#64748b' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 36, height: 42 }}
            placeholder="Cari item di rak belanja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          className="btn-primary"
          style={{ height: 42, padding: '0 16px', flexShrink: 0 }}
          onClick={onAddItem}
          title="Tambah barang baru"
        >
          <Plus size={18} />
          <span>Tambah</span>
        </button>
      </div>

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
              : 'Belum ada barang di troli Rian. Ketuk tombol di bawah untuk mulai mencatat belanjaan supermarket.'}
          </p>
          <button className="btn-primary" onClick={onAddItem}>
            <Plus size={18} />
            <span>Catat Barang Pertama</span>
          </button>
        </div>
      )}

      {/* Item Cards List */}
      <div className="items-container">
        {filteredItems.map((item) => {
          const calc = calculateItemPrice(item);
          const comp = compareWithLastMonth(calc.discountedUnitPrice, item.lastMonthPrice);

          return (
            <div key={item.id} className="grocery-item-card">
              {/* Item Header / Title row */}
              <div className="item-main-row">
                <div className="item-info-col">
                  <h3 className="item-name">{item.name}</h3>
                  
                  <div className="item-meta-row">
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
