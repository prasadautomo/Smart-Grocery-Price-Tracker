import React, { useState } from 'react';
import { X, Search, Plus, Check, Zap } from 'lucide-react';
import { POPULAR_PRESETS, convertPresetToGroceryItem } from '../lib/quickPresets';
import type { GroceryItem, QuickPresetItem, CategoryType } from '../types/grocery';
import { formatRupiah } from '../lib/calculations';

interface QuickPresetModalProps {
  isOpen: boolean;
  cartItems: GroceryItem[];
  onClose: () => void;
  onAddPreset: (item: GroceryItem) => void;
}

const PRESET_CATEGORIES: (CategoryType | 'Semua')[] = [
  'Semua',
  'Bahan Pokok',
  'Makanan & Camilan',
  'Bumbu & Dapur',
  'Mandi & Kebersihan',
  'Minuman',
];

export const QuickPresetModal: React.FC<QuickPresetModalProps> = ({
  isOpen,
  cartItems,
  onClose,
  onAddPreset,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'Semua'>('Semua');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const filteredPresets = POPULAR_PRESETS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.popularReason && p.popularReason.toLowerCase().includes(search.toLowerCase()));
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
      <div className="modal-card" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Zap size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', color: '#fff', margin: 0, fontWeight: 700 }}>
                Katalog Cepat Anak Kos
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                1-Tap langsung masukkan kebutuhan rutin supermarket
              </p>
            </div>
          </div>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={18} />
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
              placeholder="Cari beras, minyak, telur, indomie, sabun..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-pills-row" style={{ margin: 0 }}>
            {PRESET_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                style={{ fontSize: '11px', padding: '4px 10px' }}
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
          {filteredPresets.map((preset) => {
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
                    ? '1px solid rgba(16, 185, 129, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '24px',
                      width: 42,
                      height: 42,
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {preset.emoji}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: '#fff',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {preset.name}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 6px',
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
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#38bdf8' }}>
                        {formatRupiah(preset.estimatedPrice)}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        / {preset.defaultQty} {preset.unit}
                      </span>
                    </div>

                    {preset.popularReason && (
                      <p style={{ fontSize: '10.5px', color: '#94a3b8', margin: '3px 0 0' }}>
                        {preset.popularReason}
                      </p>
                    )}
                  </div>
                </div>

                <button
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
                        : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                    borderColor: isJustAdded || alreadyInCart ? '#10b981' : 'transparent',
                    color: isJustAdded || alreadyInCart ? '#34d399' : '#fff',
                  }}
                  onClick={() => handleSelectPreset(preset)}
                >
                  {isJustAdded || alreadyInCart ? (
                    <>
                      <Check size={14} />
                      <span>{isJustAdded ? 'Masuk!' : '+ Tambah'}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      <span>Masuk</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}

          {filteredPresets.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748b' }}>
              <p style={{ fontSize: '13px' }}>Tidak ada barang yang cocok dengan pencarian.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button className="btn-secondary" style={{ width: '100%', fontSize: '12.5px' }} onClick={onClose}>
            Selesai Menambahkan
          </button>
        </div>
      </div>
    </div>
  );
};
