import React, { useState } from 'react';
import {
  Receipt,
  Calendar,
  ShoppingBag,
  Tag,
  Download,
  ChevronRight,
  X,
  FileText,
  BarChart3,
  TrendingUp,
  PieChart
} from 'lucide-react';
import type { ShoppingTrip } from '../types/grocery';
import { formatRupiah, calculateItemPrice } from '../lib/calculations';

interface ShoppingHistoryProps {
  history: ShoppingTrip[];
  onClearHistory?: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Bahan Pokok': '#3b82f6',
  'Makanan & Camilan': '#ec4899',
  'Mandi & Kebersihan': '#10b981',
  'Bumbu & Dapur': '#f59e0b',
  'Minuman': '#06b6d4',
  'Kebutuhan Kamar': '#8b5cf6',
  'Lain-lain': '#64748b',
};

export const ShoppingHistory: React.FC<ShoppingHistoryProps> = ({
  history,
}) => {
  const [selectedTrip, setSelectedTrip] = useState<ShoppingTrip | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Download receipt as JSON file
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `smart-grocery-history-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download receipt as CSV file
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,Tanggal,Toko,Total_Belanja,Biaya_Kasir_Ekstra,Grand_Total,Hemat_Promo,Jumlah_Item,Batas_Anggaran\n';
    history.forEach((t) => {
      const extra = (t.extraCosts?.bagFee || 0) + (t.extraCosts?.parkingFee || 0) + (t.extraCosts?.taxAmount || 0);
      csvContent += `"${new Date(t.date).toLocaleDateString('id-ID')}","${t.storeName}",${t.totalSpent},${extra},${t.grandTotal || t.totalSpent},${t.totalSavings},${t.totalItemsCount},${t.budgetLimit}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat-belanja-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Agregasi Statistik Belanja
  let cumulativeSpent = 0;
  let cumulativeSavings = 0;
  const categorySpending: Record<string, number> = {};

  history.forEach((trip) => {
    cumulativeSpent += trip.grandTotal || trip.totalSpent;
    cumulativeSavings += trip.totalSavings;
    trip.itemsSnapshot.forEach((item) => {
      const calc = calculateItemPrice(item);
      categorySpending[item.category] = (categorySpending[item.category] || 0) + calc.finalTotal;
    });
  });

  const averagePerTrip = history.length > 0 ? Math.round(cumulativeSpent / history.length) : 0;
  const sortedCategories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1]);
  const totalItemSpend = Object.values(categorySpending).reduce((a, b) => a + b, 0);

  // Cari nilai trip maksimum untuk skala tinggi grafik batang
  const maxTripSpend = Math.max(...history.map((t) => t.grandTotal || t.totalSpent), 1);

  return (
    <div className="shopping-history-section">
      <div className="section-header">
        <div className="section-title">
          <Receipt size={18} />
          <span>Riwayat & Struk Digital</span>
          <span className="item-count-badge">{history.length} Belanja</span>
        </div>

        {history.length > 0 && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              className={`icon-action-btn ${showAnalytics ? 'active' : ''}`}
              onClick={() => setShowAnalytics(!showAnalytics)}
              title={showAnalytics ? 'Sembunyikan Grafik' : 'Lihat Grafik'}
              style={{ color: showAnalytics ? '#38bdf8' : undefined }}
            >
              <BarChart3 size={15} />
            </button>
            <button
              className="icon-action-btn"
              onClick={handleExportCSV}
              title="Unduh Laporan CSV"
            >
              <FileText size={15} />
            </button>
            <button
              className="icon-action-btn"
              onClick={handleExportJSON}
              title="Unduh Backup JSON"
            >
              <Download size={15} />
            </button>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-circle">
            <Receipt size={32} />
          </div>
          <h3>Belum Ada Riwayat Belanja</h3>
          <p>
            Setelah selesai berbelanja di supermarket, ketuk "Selesaikan & Simpan Struk" pada tab Belanja untuk menyimpan struk digital permanen di sini.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* STATISTIK & GRAFIK VISUAL PENGELUARAN */}
          {showAnalytics && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              {/* Stat Cards 3 Kolom */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '10px 8px',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Total Belanja</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#34d399', display: 'block', marginTop: 2 }}>
                    {formatRupiah(cumulativeSpent)}
                  </span>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '10px 8px',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Hemat Promo</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24', display: 'block', marginTop: 2 }}>
                    {formatRupiah(cumulativeSavings)}
                  </span>
                </div>

                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '10px 8px',
                    borderRadius: '10px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Rata-Rata/Trip</span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8', display: 'block', marginTop: 2 }}>
                    {formatRupiah(averagePerTrip)}
                  </span>
                </div>
              </div>

              {/* Grafik Batang Perbandingan Antar Kunjungan */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <TrendingUp size={13} color="#38bdf8" />
                    Tren Belanja Antar Kunjungan
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 8,
                    height: 80,
                    padding: '6px 4px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  {history.slice(0, 6).reverse().map((trip, idx) => {
                    const tripSpend = trip.grandTotal || trip.totalSpent;
                    const heightPercent = Math.max(15, Math.round((tripSpend / maxTripSpend) * 100));
                    const isOver = tripSpend > trip.budgetLimit;
                    const dateLabel = new Date(trip.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

                    return (
                      <div
                        key={trip.id || idx}
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end',
                          cursor: 'pointer',
                        }}
                        onClick={() => setSelectedTrip(trip)}
                        title={`${trip.storeName} (${dateLabel}): ${formatRupiah(tripSpend)}`}
                      >
                        <div
                          style={{
                            width: '100%',
                            maxWidth: 32,
                            height: `${heightPercent}%`,
                            borderRadius: '6px 6px 0 0',
                            background: isOver
                              ? 'linear-gradient(180deg, #f87171 0%, #dc2626 100%)'
                              : 'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)',
                            transition: 'height 0.3s ease',
                          }}
                        />
                        <span style={{ fontSize: '9px', color: '#64748b', marginTop: 4, whiteSpace: 'nowrap' }}>
                          {dateLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Visual Breakdown Pengeluaran per Kategori */}
              {sortedCategories.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <PieChart size={13} color="#ec4899" />
                      Komposisi Pengeluaran per Kategori
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                      {sortedCategories.length} Kategori
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sortedCategories.map(([category, amount]) => {
                      const percent = totalItemSpend > 0 ? Math.round((amount / totalItemSpend) * 100) : 0;
                      const catColor = CATEGORY_COLORS[category] || '#94a3b8';

                      return (
                        <div key={category} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span
                                style={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  background: catColor,
                                  display: 'inline-block',
                                }}
                              />
                              <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{category}</span>
                            </div>
                            <span style={{ color: '#94a3b8' }}>
                              <strong style={{ color: '#fff' }}>{formatRupiah(amount)}</strong> ({percent}%)
                            </span>
                          </div>

                          <div style={{ height: 6, width: '100%', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 3, overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${percent}%`,
                                background: catColor,
                                borderRadius: 3,
                                transition: 'width 0.3s ease',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LIST STRUK BELANJA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {history.map((trip) => {
              const formattedDate = new Date(trip.date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              const grand = trip.grandTotal || trip.totalSpent;

              return (
                <div
                  key={trip.id}
                  className="card"
                  style={{ cursor: 'pointer', padding: '14px' }}
                  onClick={() => setSelectedTrip(trip)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: '#94a3b8' }}>
                        <Calendar size={13} />
                        <span>{formattedDate}</span>
                      </div>
                      <h4 style={{ fontSize: '15px', color: '#fff', fontWeight: 700, marginTop: 2 }}>
                        {trip.storeName}
                      </h4>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#34d399' }}>
                        {formatRupiah(grand)}
                      </div>
                      {trip.totalSavings > 0 && (
                        <span style={{ fontSize: '11px', color: '#fbbf24' }}>
                          Hemat {formatRupiah(trip.totalSavings)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 8 }}>
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <ShoppingBag size={13} />
                      {trip.totalItemsCount} item tercatat
                    </span>

                    <span style={{ fontSize: '12px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 2, fontWeight: 600 }}>
                      Lihat Struk <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DETAIL STRUK DIGITAL ANTI PUDAR */}
      {selectedTrip && (
        <div className="modal-overlay" onClick={() => setSelectedTrip(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="sheet-handle-bar" />
            <div className="sheet-header">
              <h2>Struk Belanja Digital</h2>
              <button className="icon-action-btn" onClick={() => setSelectedTrip(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="sheet-body">
              {/* Receipt Header Badge */}
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                <h3 style={{ fontSize: '16px', color: '#fff', fontWeight: 800 }}>
                  {selectedTrip.storeName}
                </h3>
                <p style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: 2 }}>
                  {new Date(selectedTrip.date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                </p>
                {selectedTrip.notes && (
                  <p style={{ fontSize: '11.5px', color: '#38bdf8', marginTop: 4 }}>
                    {selectedTrip.notes}
                  </p>
                )}
              </div>

              {/* Items List Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Rincian Barang Belanjaan
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
                        background: 'var(--bg-card)',
                        borderRadius: '10px',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {item.quantity} {item.unit} × {formatRupiah(calc.discountedUnitPrice)}
                          {item.discountType !== 'none' && (
                            <span style={{ color: '#fbbf24', marginLeft: 4 }}>
                              (Promo Aktif)
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff' }}>
                          {formatRupiah(calc.finalTotal)}
                        </div>
                        {calc.totalDiscountAmount > 0 && (
                          <div style={{ fontSize: '10.5px', color: '#34d399' }}>
                            Hemat {formatRupiah(calc.totalDiscountAmount)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rincian Biaya Tambahan Kasir jika ada */}
              {selectedTrip.extraCosts && (
                <div
                  style={{
                    background: 'rgba(56, 189, 248, 0.05)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#38bdf8' }}>
                    Biaya Tambahan Kasir Supermarket:
                  </div>
                  {selectedTrip.extraCosts.bagFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#cbd5e1' }}>
                      <span>Kantong Belanja:</span>
                      <span>+{formatRupiah(selectedTrip.extraCosts.bagFee)}</span>
                    </div>
                  )}
                  {selectedTrip.extraCosts.parkingFee > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#cbd5e1' }}>
                      <span>Biaya Parkir:</span>
                      <span>+{formatRupiah(selectedTrip.extraCosts.parkingFee)}</span>
                    </div>
                  )}
                  {selectedTrip.extraCosts.taxAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#cbd5e1' }}>
                      <span>Pajak PPN ({selectedTrip.extraCosts.taxPercent}%):</span>
                      <span>+{formatRupiah(selectedTrip.extraCosts.taxAmount)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Receipt Summary Footer */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                {selectedTrip.totalSavings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#cbd5e1', marginBottom: 6 }}>
                    <span>Total Penghematan Promo:</span>
                    <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                      <Tag size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {formatRupiah(selectedTrip.totalSavings)}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#34d399', borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: 8 }}>
                  <span>TOTAL DIBAYAR KASIR:</span>
                  <span>{formatRupiah(selectedTrip.grandTotal || selectedTrip.totalSpent)}</span>
                </div>
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
