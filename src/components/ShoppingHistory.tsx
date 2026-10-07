import React, { useState } from 'react';
import {
  Receipt,
  Calendar,
  ShoppingBag,
  Tag,
  Download,
  ChevronRight,
  X,
  FileText
} from 'lucide-react';
import type { ShoppingTrip } from '../types/grocery';
import { formatRupiah, calculateItemPrice } from '../lib/calculations';

interface ShoppingHistoryProps {
  history: ShoppingTrip[];
  onClearHistory?: () => void;
}

export const ShoppingHistory: React.FC<ShoppingHistoryProps> = ({
  history,
}) => {
  const [selectedTrip, setSelectedTrip] = useState<ShoppingTrip | null>(null);

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
    let csvContent = 'data:text/csv;charset=utf-8,Tanggal,Toko,Total_Belanja,Hemat_Promo,Jumlah_Item,Batas_Anggaran\n';
    history.forEach((t) => {
      csvContent += `"${new Date(t.date).toLocaleDateString('id-ID')}","${t.storeName}",${t.totalSpent},${t.totalSavings},${t.totalItemsCount},${t.budgetLimit}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `riwayat-belanja-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map((trip) => {
            const formattedDate = new Date(trip.date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

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
                      {formatRupiah(trip.totalSpent)}
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
      )}

      {/* MODAL DETAIL STRUK DIGITAL ANTI PUDAR */}
      {selectedTrip && (
        <div className="modal-overlay" onClick={() => setSelectedTrip(null)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
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

              {/* Receipt Summary Footer */}
              <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#cbd5e1', marginBottom: 6 }}>
                  <span>Total Penghematan Promo:</span>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>
                    <Tag size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {formatRupiah(selectedTrip.totalSavings)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: '#34d399', borderTop: '1px solid rgba(16, 185, 129, 0.2)', paddingTop: 8 }}>
                  <span>TOTAL DIBAYAR KASIR:</span>
                  <span>{formatRupiah(selectedTrip.totalSpent)}</span>
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
