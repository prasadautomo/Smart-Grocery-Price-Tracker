import React, { useState } from 'react';
import {
  Receipt,
  Download,
  X,
  FileText,
  Search,
  Camera,
  CheckCircle
} from 'lucide-react';
import type { ShoppingTrip } from '../types/grocery';
import { formatRupiah, calculateItemPrice } from '../lib/calculations';

interface ShoppingHistoryProps {
  history: ShoppingTrip[];
  onClearHistory?: () => void;
  onSetBenchmark?: (trip: ShoppingTrip) => void;
}

export const ShoppingHistory: React.FC<ShoppingHistoryProps> = ({
  history,
  onSetBenchmark,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedTrip, setSelectedTrip] = useState<ShoppingTrip | null>(null);
  const [showScannerNotice, setShowScannerNotice] = useState(false);

  // Download receipt as JSON file
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `safegrocer-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download receipt as CSV file
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Tanggal,Toko,Total_Belanja,Biaya_Kasir,Grand_Total,Hemat_Promo,Jumlah_Item\n';
    history.forEach((t) => {
      const extra = (t.extraCosts?.bagFee || 0) + (t.extraCosts?.parkingFee || 0) + (t.extraCosts?.taxAmount || 0);
      csvContent += `"${new Date(t.date).toLocaleDateString('id-ID')}","${t.storeName}",${t.totalSpent},${extra},${t.grandTotal || t.totalSpent},${t.totalSavings},${t.totalItemsCount}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `safegrocer-riwayat-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Agregasi Statistik Belanja
  let cumulativeSpent = 0;
  let cumulativeSavings = 0;
  history.forEach((trip) => {
    cumulativeSpent += trip.grandTotal || trip.totalSpent;
    cumulativeSavings += trip.totalSavings;
  });

  const lastMonthTrip = history[0];
  const lastMonthTotal = lastMonthTrip ? (lastMonthTrip.grandTotal || lastMonthTrip.totalSpent) : 312000;
  const avgSavings = history.length > 0 ? Math.round(cumulativeSavings / history.length) : 42500;

  // Filter list struk
  const filteredHistory = history.filter((trip) => {
    const matchSearch =
      trip.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.notes && trip.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      trip.itemsSnapshot.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header Riwayat (Stitch Screen 3) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Riwayat & Database Belanja
          </h2>
          <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>
            🗂️ Arsip Struk Digital & Tren Harga (F-06)
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          <button className="icon-action-btn" onClick={handleExportCSV} title="Unduh CSV">
            <FileText size={15} />
          </button>
          <button className="icon-action-btn" onClick={handleExportJSON} title="Unduh JSON">
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Search Input (Stitch Screen 3) */}
      <div style={{ position: 'relative' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: 14, top: 12, color: '#94a3b8' }}
        />
        <input
          type="text"
          className="form-input"
          style={{ paddingLeft: 38, height: 40, borderRadius: 12 }}
          placeholder="Cari struk / barang..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 3 Circular Metric Pills (Stitch Screen 3) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {/* Metric 1 */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 18,
            padding: '12px 8px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            Bulan Lalu
          </span>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '3px 0' }}>
            {formatRupiah(lastMonthTotal)}
          </div>
          <span style={{ fontSize: '9.5px', color: '#64748b' }}>
            Total Belanja Terakhir
          </span>
        </div>

        {/* Metric 2 */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 18,
            padding: '12px 8px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            Hemat Promo
          </span>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#10b981', margin: '3px 0' }}>
            {formatRupiah(avgSavings)}
          </div>
          <span style={{ fontSize: '9.5px', color: '#059669' }}>
            Rata-rata Hemat
          </span>
        </div>

        {/* Metric 3 */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 18,
            padding: '12px 8px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <span style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
            Inflasi
          </span>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#ef4444', margin: '3px 0' }}>
            +5.8%
          </div>
          <span style={{ fontSize: '9.5px', color: '#dc2626' }}>
            Beras Naik
          </span>
        </div>
      </div>

      {/* Filter Periode Pills (Stitch Screen 3) */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        {['Bulan Ini', 'Bulan Lalu', 'Lihat Semua'].map((period) => (
          <button
            key={period}
            type="button"
            className={`stitch-category-pill ${selectedPeriod === period ? 'active' : ''}`}
            onClick={() => setSelectedPeriod(period)}
            style={{ fontSize: '11px', padding: '5px 12px' }}
          >
            {period}
          </button>
        ))}
      </div>

      {/* ============================================================
          DETEKSI FLUKTUASI HARGA (LIVE MONITOR - F-04) - STITCH SCREEN 3
          ============================================================ */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Deteksi Fluktuasi Harga
            </h3>
            <p style={{ fontSize: '10.5px', color: '#64748b', margin: '2px 0 0' }}>
              Modul Cerdas Rian (F-04)
            </p>
          </div>

          <span
            style={{
              background: '#ecfdf5',
              color: '#047857',
              fontSize: '10.5px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 20,
              border: '1px solid #a7f3d0',
            }}
          >
            Live Monitor
          </span>
        </div>

        {/* Item 1: Beras Premium (Naik) */}
        <div
          style={{
            background: '#fff5f5',
            border: '1px solid #fed7d7',
            borderRadius: 14,
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                🍚 Beras Premium 5kg
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Bulan lalu: Rp 68.000
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="stitch-trend-badge up" style={{ fontSize: '10.5px' }}>
                ↑ Naik Rp 4.000
              </span>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                Rp 72.000
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', borderTop: '1px dashed #fecaca', paddingTop: 6 }}>
            <span style={{ color: '#b45309', fontWeight: 700 }}>
              💡 Saran: Beli secukupnya
            </span>
            <span style={{ color: '#dc2626', fontWeight: 700 }}>
              +5.8% inflasi
            </span>
          </div>
        </div>

        {/* Item 2: Sabun Pembersih (Turun Promo) */}
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 14,
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                🧼 Sabun Pembersih Lantai 800ml
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Bulan lalu: Rp 14.000
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="stitch-trend-badge down" style={{ fontSize: '10.5px' }}>
                ↓ Turun Rp 4.000
              </span>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#047857', marginTop: 2 }}>
                Rp 10.000
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', borderTop: '1px dashed #bbf7d0', paddingTop: 6 }}>
            <span style={{ color: '#047857', fontWeight: 700 }}>
              🏷️ Saran: Borong, harga terendah!
            </span>
            <span style={{ color: '#15803d', fontWeight: 700 }}>
              -28.5% diskon
            </span>
          </div>
        </div>

        {/* Item 3: Minyak Goreng (Stabil) */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 14,
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                🍳 Minyak Goreng 2L
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Bulan lalu: Rp 34.000
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="stitch-trend-badge equal" style={{ fontSize: '10.5px' }}>
                = Stabil
              </span>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: 2 }}>
                Rp 34.000
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', borderTop: '1px dashed #e2e8f0', paddingTop: 6 }}>
            <span style={{ color: '#64748b', fontWeight: 700 }}>
              ⚖️ Stabil di Rp 34.000
            </span>
            <span style={{ color: '#64748b', fontWeight: 700 }}>
              0% perubahan
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          DAFTAR STRUK BELANJA (STITCH SCREEN 3)
          ============================================================ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Daftar Struk Belanja
          </h3>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {filteredHistory.length} Struk Tersimpan
          </span>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="empty-state">
            <Receipt size={32} />
            <h3>Belum Ada Struk</h3>
            <p>Selesaikan belanja di tab Troli untuk menyimpan struk digital di sini.</p>
          </div>
        ) : (
          filteredHistory.map((trip) => {
            const formattedDate = new Date(trip.date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });
            const grand = trip.grandTotal || trip.totalSpent;

            return (
              <div
                key={trip.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 18,
                  padding: '16px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      {trip.storeName}
                    </h4>
                    <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: 3 }}>
                      📅 {formattedDate} • {trip.totalItemsCount} barang
                    </div>
                  </div>

                  <span
                    style={{
                      background: '#eff6ff',
                      color: '#2563eb',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 12,
                      border: '1px solid #bfdbfe',
                    }}
                  >
                    ☁️ Tersimpan di Cloud
                  </span>
                </div>

                {/* Total Belanja Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
                      TOTAL BELANJA
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#10b981' }}>
                      {formatRupiah(grand)}
                    </div>
                  </div>

                  {/* Category Avatars */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    {trip.itemsSnapshot.slice(0, 3).map((item, idx) => (
                      <span
                        key={idx}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: '#f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                        }}
                      >
                        {item.name.toLowerCase().includes('beras') ? '🍚' : item.name.toLowerCase().includes('sabun') ? '🧼' : '🛒'}
                      </span>
                    ))}
                    {trip.itemsSnapshot.length > 3 && (
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: '#dcfce7',
                          color: '#15803d',
                          fontSize: '10px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        +{trip.itemsSnapshot.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2 Buttons Side-by-Side (Stitch Screen 3) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '11.5px', padding: '8px 10px', borderRadius: 10 }}
                    onClick={() => setSelectedTrip(trip)}
                  >
                    <span>Lihat Rincian Struk</span>
                  </button>

                  <button
                    type="button"
                    className="btn-primary"
                    style={{
                      fontSize: '11.5px',
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    }}
                    onClick={() => {
                      if (onSetBenchmark) {
                        onSetBenchmark(trip);
                      }
                      alert(`Struk dari "${trip.storeName}" berhasil dijadikan acuan komparasi harga bulan depan!`);
                    }}
                  >
                    <CheckCircle size={13} />
                    <span>Jadikan Acuan</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Scanner Banner (Stitch Screen 3) */}
      <div
        style={{
          background: '#ecfdf5',
          border: '1.5px solid #a7f3d0',
          borderRadius: 18,
          padding: '14px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#047857', margin: 0 }}>
            Punya Struk Belanja Baru?
          </h4>
          <p style={{ fontSize: '11px', color: '#059669', margin: '2px 0 0' }}>
            Foto & biarkan SafeGrocer catat otomatis
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          style={{
            fontSize: '11.5px',
            padding: '8px 12px',
            borderRadius: 10,
            background: '#047857',
            whiteSpace: 'nowrap',
          }}
          onClick={() => setShowScannerNotice(true)}
        >
          <Camera size={14} />
          <span>Pindai Struk</span>
        </button>
      </div>

      {/* Modal Scanner Notice */}
      {showScannerNotice && (
        <div className="modal-backdrop" onClick={() => setShowScannerNotice(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ padding: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Camera size={28} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Simulasi Pemindai Struk OCR
              </h3>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '8px 0 16px', lineHeight: 1.5 }}>
                Fitur pemindai struk kamera AI siap mengenali nama produk dan total harga struk supermarket secara otomatis. Saat ini Anda juga dapat langsung mencatat manual atau menggunakan Katalog Cepat.
              </p>
              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%' }}
                onClick={() => setShowScannerNotice(false)}
              >
                Mengerti & Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL STRUK DIGITAL */}
      {selectedTrip && (
        <div className="modal-backdrop" onClick={() => setSelectedTrip(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Struk Belanja Digital</h3>
              <button className="icon-action-btn" onClick={() => setSelectedTrip(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="sheet-body">
              {/* Receipt Store Info */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: '14px',
                  textAlign: 'center',
                }}
              >
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {selectedTrip.storeName}
                </h4>
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: 3 }}>
                  {new Date(selectedTrip.date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
                {selectedTrip.notes && (
                  <p style={{ fontSize: '11px', color: '#10b981', marginTop: 4 }}>
                    📝 {selectedTrip.notes}
                  </p>
                )}
              </div>

              {/* Items Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                  Daftar Barang Belanjaan:
                </div>

                {selectedTrip.itemsSnapshot.map((item, idx) => {
                  const calc = calculateItemPrice(item);
                  return (
                    <div
                      key={item.id || idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        borderRadius: 10,
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {item.quantity} {item.unit} × {formatRupiah(calc.discountedUnitPrice)}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                          {formatRupiah(calc.finalTotal)}
                        </div>
                        {calc.totalDiscountAmount > 0 && (
                          <div style={{ fontSize: '10.5px', color: '#10b981' }}>
                            Hemat {formatRupiah(calc.totalDiscountAmount)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Extra Cashier Costs */}
              {selectedTrip.extraCosts && (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    fontSize: '11.5px',
                  }}
                >
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                    Biaya Tambahan Kasir:
                  </div>
                  {selectedTrip.extraCosts.bagFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Kantong Belanja:</span>
                      <span>+{formatRupiah(selectedTrip.extraCosts.bagFee)}</span>
                    </div>
                  )}
                  {selectedTrip.extraCosts.parkingFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Biaya Parkir:</span>
                      <span>+{formatRupiah(selectedTrip.extraCosts.parkingFee)}</span>
                    </div>
                  )}
                  {selectedTrip.extraCosts.taxAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>PPN ({selectedTrip.extraCosts.taxPercent}%):</span>
                      <span>+{formatRupiah(selectedTrip.extraCosts.taxAmount)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Total Card */}
              <div
                style={{
                  background: '#ecfdf5',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: 14,
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#047857' }}>Total Dibayar Kasir:</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#047857' }}>
                    {formatRupiah(selectedTrip.grandTotal || selectedTrip.totalSpent)}
                  </div>
                </div>

                {selectedTrip.totalSavings > 0 && (
                  <span
                    style={{
                      background: '#10b981',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: 12,
                    }}
                  >
                    Hemat {formatRupiah(selectedTrip.totalSavings)}
                  </span>
                )}
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%' }}
                onClick={() => setSelectedTrip(null)}
              >
                Tutup Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
