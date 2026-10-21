import React, { useState } from 'react';
import { X, Search, Plus, Check, Zap, Package } from 'lucide-react';
import { POPULAR_PRESETS, convertPresetToGroceryItem } from '../lib/quickPresets';
import { ASTRO_CATALOG_PRESETS } from '../lib/astroPresets';
import type { GroceryItem, QuickPresetItem } from '../types/grocery';
import { formatRupiah } from '../lib/calculations';


interface QuickPresetModalProps {
  isOpen: boolean;
  cartItems: GroceryItem[];
  onClose: () => void;
  onAddPreset: (item: GroceryItem) => void;
}

type CatalogSource = 'astro' | 'regular';

const ALL_CATEGORIES: string[] = [
  'Semua',
  'Bahan Pokok',
  'Telur, Tahu & Tempe',
  'Ayam & Daging',
  'Makanan & Camilan',
  'Minuman',
  'Astro Cafe',
  'Bumbu & Dapur',
  'Mandi & Kebersihan',
  'Makanan Beku',
  'Buah Segar',
];

export const QuickPresetModal: React.FC<QuickPresetModalProps> = ({
  isOpen,
  cartItems,
  onClose,
  onAddPreset,
}) => {
  const [catalogSource, setCatalogSource] = useState<CatalogSource>('astro');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const currentDataset = catalogSource === 'astro' ? ASTRO_CATALOG_PRESETS : POPULAR_PRESETS;

  const filteredPresets = currentDataset.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.popularReason && p.popularReason.toLowerCase().includes(search.toLowerCase())) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleSelectPreset = (preset: QuickPresetItem) => {
    const newItem = convertPresetToGroceryItem(preset);
    onAddPreset(newItem);
    setAddedIds((prev) => new Set([...prev, preset.id]));
  };

  return (
    <div className="modal-backdrop">
      <div
        className="modal-card"
        style={{
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#0f172a',
          border: '1px solid #334155',
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              }}
            >
              <Zap size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ fontSize: '16px', color: '#fff', margin: 0, fontWeight: 800 }}>
                  Katalog Resmi Astronauts.id
                </h3>
                <span
                  style={{
                    fontSize: '10px',
                    background: '#10b981',
                    color: '#064e3b',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 800,
                  }}
                >
                  LIVE
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 0' }}>
                Harga & foto produk real-time dari <strong>www.astronauts.id</strong>
              </p>
            </div>
          </div>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher: Astro vs Reguler */}
        <div style={{ padding: '10px 18px 0', display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => setCatalogSource('astro')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              border: catalogSource === 'astro' ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
              background: catalogSource === 'astro' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
              color: catalogSource === 'astro' ? '#34d399' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span>Astro Live ({ASTRO_CATALOG_PRESETS.length} Produk)</span>
          </button>

          <button
            type="button"
            onClick={() => setCatalogSource('regular')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '10px',
              border: catalogSource === 'regular' ? '1.5px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
              background: catalogSource === 'regular' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
              color: catalogSource === 'regular' ? '#fbbf24' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span>⭐</span>
            <span>Kebutuhan Kos ({POPULAR_PRESETS.length})</span>
          </button>
        </div>

        {/* Search & Categories */}
        <div style={{ padding: '12px 18px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 36, height: 38, fontSize: '12.5px' }}
              placeholder={
                catalogSource === 'astro'
                  ? 'Cari produk Astro (Beras, Telur Omega, Ayam, Indomie, Cafe...)'
                  : 'Cari barang pokok anak kos...'
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div
            className="filter-pills-row"
            style={{
              margin: 0,
              overflowX: 'auto',
              paddingBottom: 4,
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none',
            }}
          >
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px', flexShrink: 0 }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Preset List Scrollable */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '14px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {filteredPresets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b' }}>
              <p style={{ margin: 0, fontSize: '13px' }}>Tidak ada produk Astro yang cocok.</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('Semua');
                }}
                style={{
                  marginTop: 8,
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Reset Pencarian
              </button>
            </div>
          ) : (
            filteredPresets.map((preset) => {
              const alreadyInCart = cartItems.some(
                (item) => item.name.toLowerCase() === preset.name.toLowerCase()
              );
              const isJustAdded = addedIds.has(preset.id);

              return (
                <div
                  key={preset.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: isJustAdded
                      ? '1.5px solid #10b981'
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    {/* Product Photo Thumbnail from Astronauts.cloud */}
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        background: '#ffffff',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {preset.imageUrl ? (
                        <img
                          src={preset.imageUrl}
                          alt={preset.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package size={22} color="#94a3b8" />
                      )}
                    </div>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#fff',
                            lineHeight: 1.3,
                          }}
                        >
                          {preset.name}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
                        {preset.source && (
                          <span
                            style={{
                              fontSize: '9.5px',
                              background: 'rgba(37, 99, 235, 0.2)',
                              color: '#60a5fa',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              fontWeight: 700,
                            }}
                          >
                            {preset.source}
                          </span>
                        )}
                        <span
                          style={{
                            fontSize: '9.5px',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            background:
                              preset.priority === 'essential'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(245, 158, 11, 0.15)',
                            color: preset.priority === 'essential' ? '#34d399' : '#fbbf24',
                          }}
                        >
                          {preset.priority === 'essential' ? 'Wajib' : 'Jajan'}
                        </span>
                        {preset.discountPercent && (
                          <span
                            style={{
                              fontSize: '9.5px',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              fontWeight: 800,
                              background: '#dc2626',
                              color: '#fff',
                            }}
                          >
                            Diskon {preset.discountPercent}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#38bdf8' }}>
                          {formatRupiah(preset.estimatedPrice)}
                        </span>
                        {preset.originalPrice && preset.originalPrice > preset.estimatedPrice && (
                          <span style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>
                            {formatRupiah(preset.originalPrice)}
                          </span>
                        )}
                        <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                          / {preset.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={isJustAdded || alreadyInCart ? 'btn-secondary' : 'btn-primary'}
                    style={{
                      height: 36,
                      padding: '0 12px',
                      fontSize: '11.5px',
                      flexShrink: 0,
                      borderRadius: '8px',
                      background:
                        isJustAdded || alreadyInCart
                          ? 'rgba(16, 185, 129, 0.2)'
                          : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: isJustAdded || alreadyInCart ? '#34d399' : '#fff',
                      border: isJustAdded || alreadyInCart ? '1px solid #10b981' : 'none',
                    }}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    {isJustAdded || alreadyInCart ? (
                      <>
                        <Check size={14} />
                        <span>Di Troli</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>+ Troli</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: '#94a3b8',
          }}
        >
          <span>Menampilkan {filteredPresets.length} produk</span>
          <button
            type="button"
            className="btn-secondary"
            style={{ height: 32, padding: '0 12px', fontSize: '11.5px' }}
            onClick={onClose}
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
