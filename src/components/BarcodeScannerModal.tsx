import React, { useState } from 'react';
import {
  X,
  Scan,
  TrendingDown,
  TrendingUp,
  Tag,
  Plus,
  Camera,
} from 'lucide-react';
import { BARCODE_CATALOG, findProductByBarcode } from '../lib/barcodeCatalog';
import type { BarcodeProduct, GroceryItem } from '../types/grocery';
import { formatRupiah, calculateItemPrice } from '../lib/calculations';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: GroceryItem) => void;
  currentBudgetRemaining: number;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  currentBudgetRemaining,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<BarcodeProduct | null>(BARCODE_CATALOG[0]);
  const [inputCode, setInputCode] = useState('');
  const [scannerActive, setScannerActive] = useState(false);

  if (!isOpen) return null;

  const handleSelectBarcode = (code: string) => {
    const prod = findProductByBarcode(code);
    if (prod) {
      setSelectedProduct(prod);
      setInputCode(code);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const prod = findProductByBarcode(inputCode);
    if (prod) {
      setSelectedProduct(prod);
    } else {
      alert(`Barcode "${inputCode}" tidak ditemukan di database Lotte Mart.`);
    }
  };

  // Convert selected BarcodeProduct to GroceryItem
  const convertToGroceryItem = (prod: BarcodeProduct): GroceryItem => {
    return {
      id: `item-${Date.now()}`,
      name: prod.name,
      category: prod.category,
      unit: prod.unit,
      quantity: 1,
      unitPrice: prod.price,
      lastMonthPrice: prod.lastMonthPrice,
      discountType: prod.discountType,
      discountPercent1: prod.discountPercent1,
      discountPercent2: prod.discountPercent2,
      discountNominal: prod.discountNominal,
      priority: 'essential',
      isCheckedInCart: true,
      imageUrl: prod.imageUrl,
      source: 'Lotte Mart Grocery - Puri Indah',
      createdAt: new Date().toISOString(),
    };
  };

  const activeGroceryItem = selectedProduct ? convertToGroceryItem(selectedProduct) : null;
  const calc = activeGroceryItem ? calculateItemPrice(activeGroceryItem) : null;

  const priceDiff = selectedProduct && calc
    ? calc.discountedUnitPrice - selectedProduct.lastMonthPrice
    : 0;
  const isCheaper = priceDiff < 0;
  const isPricier = priceDiff > 0;
  const remainingAfter = calc ? currentBudgetRemaining - calc.finalTotal : currentBudgetRemaining;

  const handleAddCurrentToCart = () => {
    if (!activeGroceryItem) return;
    onAddToCart(activeGroceryItem);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 100 }}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 440,
          background: '#ffffff',
          borderRadius: 26,
          padding: 20,
          border: '2px solid #181512',
          boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
          maxHeight: '92vh',
          overflowY: 'auto',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: '#181512',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scan size={20} />
            </div>
            <div>
              <h3
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#181512',
                  margin: 0,
                }}
              >
                Pemindai Barcode Rak Toko
              </h3>
              <span style={{ fontSize: '11px', color: '#78716c' }}>
                Deteksi promo bertingkat &amp; komparasi bulan lalu
              </span>
            </div>
          </div>
          <button
            type="button"
            className="icon-action-btn"
            onClick={onClose}
            style={{ borderRadius: '50%', width: 32, height: 32 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Viewport Scanner Simulation */}
        <div
          style={{
            position: 'relative',
            borderRadius: 18,
            overflow: 'hidden',
            background: '#181512',
            padding: '24px 16px',
            textAlign: 'center',
            color: '#ffffff',
            border: '2px solid #292524',
            marginBottom: 14,
          }}
        >
          {/* Laser Line */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: 20,
              right: 20,
              height: 2,
              background: '#ef4444',
              boxShadow: '0 0 10px #ef4444, 0 0 4px #f87171',
              animation: 'pulse 1.5s infinite',
            }}
          />

          <div style={{ position: 'relative', zIndex: 2 }}>
            <Camera size={34} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 800 }}>
              {selectedProduct ? selectedProduct.barcode : 'Pindai Kode Batang EAN-13'}
            </div>
            <p style={{ fontSize: '11px', color: '#a8a29e', margin: '4px 0 0' }}>
              Arahkan kamera ke kemasan atau ketuk contoh produk di bawah
            </p>
          </div>
        </div>

        {/* Quick Barcode Buttons from Indonesian Supermarket */}
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              fontWeight: 800,
              color: '#78716c',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: 6,
            }}
          >
            PILIHAN PRODUK CONTOH (SIMULASI SCAN 1-KLIK):
          </span>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {BARCODE_CATALOG.map((p) => {
              const isSelected = selectedProduct?.barcode === p.barcode;
              return (
                <button
                  key={p.barcode}
                  type="button"
                  onClick={() => handleSelectBarcode(p.barcode)}
                  style={{
                    flexShrink: 0,
                    padding: '6px 10px',
                    borderRadius: 10,
                    background: isSelected ? '#181512' : '#f5f5f4',
                    color: isSelected ? '#ffffff' : '#181512',
                    border: isSelected ? '1.5px solid #181512' : '1px solid #e7e5e4',
                    fontSize: '11px',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.name.split(' (')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Manual Barcode Search Form */}
        <form onSubmit={handleManualSearch} style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ketik barcode (misal: 8991002105432)"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            style={{ height: 38, fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}
          />
          <button
            type="submit"
            className="btn-primary"
            style={{
              height: 38,
              padding: '0 14px',
              fontSize: '12px',
              fontWeight: 800,
              background: '#181512',
              whiteSpace: 'nowrap',
            }}
          >
            Cari
          </button>
        </form>

        {/* Scanned Product Deep Analysis Card */}
        {selectedProduct && calc && (
          <div
            style={{
              background: '#FAF8F5',
              border: '2px solid #e7e5e4',
              borderRadius: 18,
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}
          >
            {/* Top Product Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1px solid #dcd2c6',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '9.5px',
                      background: '#e7e5e4',
                      padding: '1px 5px',
                      borderRadius: 4,
                      fontWeight: 700,
                    }}
                  >
                    {selectedProduct.brand}
                  </span>
                  <span style={{ fontSize: '10.5px', color: '#78716c' }}>
                    {selectedProduct.unitSize}
                  </span>
                </div>
                <h4
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 800,
                    color: '#181512',
                    margin: '2px 0 0',
                    lineHeight: 1.25,
                  }}
                >
                  {selectedProduct.name}
                </h4>
              </div>
            </div>

            {/* Price & Stacked Discount Breakdown */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: 12,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '11px', color: '#78716c' }}>Harga Asli di Rak:</span>
                <span style={{ fontSize: '12px', color: '#78716c', textDecoration: calc.totalDiscountAmount > 0 ? 'line-through' : 'none' }}>
                  {formatRupiah(selectedProduct.price)}
                </span>
              </div>

              {calc.totalDiscountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Tag size={12} />
                    <span>Diskon Promo:</span>
                  </span>
                  <span style={{ fontSize: '11.5px', color: '#ea580c', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                    -{formatRupiah(calc.totalDiscountAmount)} ({calc.effectiveDiscountRate}%)
                  </span>
                </div>
              )}

              <div
                style={{
                  borderTop: '1px dashed #e7e5e4',
                  paddingTop: 6,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#181512' }}>
                  Harga Bersih Kasir (Nett):
                </span>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#10b981',
                  }}
                >
                  {formatRupiah(calc.discountedUnitPrice)}
                </span>
              </div>
            </div>

            {/* SRS F-04 Comparison vs Last Month */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                borderRadius: 10,
                background: isCheaper ? '#ecfdf5' : isPricier ? '#fee2e2' : '#f5f5f4',
                border: `1px solid ${isCheaper ? '#a7f3d0' : isPricier ? '#fca5a5' : '#e7e5e4'}`,
                fontSize: '11px',
              }}
            >
              <span style={{ color: '#57534e' }}>
                Bulan Lalu: <strong>{formatRupiah(selectedProduct.lastMonthPrice)}</strong>
              </span>

              {isCheaper && (
                <span style={{ color: '#047857', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <TrendingDown size={14} />
                  <span>Hemat {formatRupiah(Math.abs(priceDiff))}</span>
                </span>
              )}
              {isPricier && (
                <span style={{ color: '#dc2626', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <TrendingUp size={14} />
                  <span>Naik +{formatRupiah(priceDiff)}</span>
                </span>
              )}
              {!isCheaper && !isPricier && (
                <span style={{ color: '#57534e', fontWeight: 800 }}>= Harga Stabil</span>
              )}
            </div>

            {/* SRS F-05 Wallet Impact */}
            <div style={{ fontSize: '11px', color: '#78716c', display: 'flex', justifyContent: 'space-between' }}>
              <span>Dampak ke Dompet Belanja:</span>
              <strong style={{ color: remainingAfter >= 0 ? '#10b981' : '#dc2626' }}>
                {remainingAfter >= 0
                  ? `Sisa ${formatRupiah(remainingAfter)} (Aman ✅)`
                  : `Overbudget by ${formatRupiah(Math.abs(remainingAfter))} 🚨`}
              </strong>
            </div>

            {/* Add to Cart CTA */}
            <button
              type="button"
              className="btn-primary"
              onClick={handleAddCurrentToCart}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 14,
                background: '#181512',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 3px 0 #000000',
                cursor: 'pointer',
              }}
            >
              <Plus size={16} color="#f59e0b" />
              <span>Masukkan ke Troli Saya</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
