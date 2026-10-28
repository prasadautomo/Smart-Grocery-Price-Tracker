import React, { useState } from 'react';
import {
  Receipt,
  Download,
  X,
  FileText,
  Search,
  CheckCircle,
  Copy,
  Plus,
  BookOpen,
  Store,
} from 'lucide-react';
import type { ShoppingTrip, MasterProduct, CategoryType } from '../types/grocery';
import { formatRupiah } from '../lib/calculations';
import { loadMasterProducts, saveMasterProducts } from '../lib/storage';

interface ShoppingHistoryProps {
  history: ShoppingTrip[];
  onClearHistory?: () => void;
  onSetBenchmark?: (trip: ShoppingTrip) => void;
}

export const ShoppingHistory: React.FC<ShoppingHistoryProps> = ({
  history,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'receipts' | 'benchmarks'>('receipts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Lihat Semua');
  const [selectedTrip, setSelectedTrip] = useState<ShoppingTrip | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Master benchmark products
  const [masterProducts, setMasterProducts] = useState<MasterProduct[]>(() => loadMasterProducts());
  const [searchBenchmark, setSearchBenchmark] = useState('');
  const [showAddMasterModal, setShowAddMasterModal] = useState(false);
  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterCategory, setNewMasterCategory] = useState<CategoryType>('Bahan Pokok');
  const [newMasterUnit, setNewMasterUnit] = useState('pack');
  const [newMasterPrice, setNewMasterPrice] = useState<number>(0);

  // Download receipt as JSON file
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `keranjangpintar-history-${new Date().toISOString().slice(0, 10)}.json`);
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
    link.setAttribute('download', `keranjangpintar-riwayat-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Copy receipt text to clipboard
  const handleCopyReceiptText = (trip: ShoppingTrip) => {
    let text = `LOTTE MART GROCERY - PURI INDAH\n`;
    text += `Puri Indah Mall Lt. LG, Kembangan, Jakarta Barat\n`;
    text += `Tanggal: ${new Date(trip.date).toLocaleDateString('id-ID')}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    trip.itemsSnapshot.forEach((item) => {
      text += `${item.name} x${item.quantity} = ${formatRupiah(item.quantity * item.unitPrice)}\n`;
    });
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `TOTAL: ${formatRupiah(trip.grandTotal || trip.totalSpent)}\n`;
    text += `HEMAT: ${formatRupiah(trip.totalSavings)}\n`;
    text += `Bukti Pembayaran Sah KeranjangPintar PRO`;

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleSaveNewMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterName.trim() || newMasterPrice <= 0) return;

    const item: MasterProduct = {
      id: `master-${Date.now()}`,
      name: newMasterName.trim(),
      category: newMasterCategory,
      unit: newMasterUnit,
      lastMonthPrice: newMasterPrice,
      storeName: 'Lotte Mart Grocery - Puri Indah',
      updatedAt: new Date().toISOString(),
    };

    const updated = [item, ...masterProducts];
    setMasterProducts(updated);
    saveMasterProducts(updated);
    setShowAddMasterModal(false);
    setNewMasterName('');
    setNewMasterPrice(0);
  };

  // Agregasi Statistik Belanja
  let cumulativeSpent = 0;
  let cumulativeSavings = 0;
  history.forEach((trip) => {
    cumulativeSpent += trip.grandTotal || trip.totalSpent;
    cumulativeSavings += trip.totalSavings;
  });

  const lastMonthTrip = history[0];
  const lastMonthTotal = lastMonthTrip ? (lastMonthTrip.grandTotal || lastMonthTrip.totalSpent) : 0;
  const avgSavings = history.length > 0 ? Math.round(cumulativeSavings / history.length) : 0;

  // Filter list struk
  const filteredHistory = history.filter((trip) => {
    const matchSearch =
      trip.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.notes && trip.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      trip.itemsSnapshot.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;

    if (selectedPeriod === 'Bulan Ini') {
      const now = new Date();
      const tripDate = new Date(trip.date);
      return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
    }
    if (selectedPeriod === 'Bulan Lalu') {
      const now = new Date();
      const tripDate = new Date(trip.date);
      const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      return tripDate.getMonth() === lastMonth && tripDate.getFullYear() === lastMonthYear;
    }
    return true;
  });

  const filteredMaster = masterProducts.filter((m) =>
    m.name.toLowerCase().includes(searchBenchmark.toLowerCase()) ||
    m.category.toLowerCase().includes(searchBenchmark.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header Riwayat (Stitch Style) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '18px', fontWeight: 800, color: '#181512', margin: 0 }}>
            Riwayat &amp; Struk Belanja
          </h2>
          <p style={{ fontSize: '11px', color: '#78716c', margin: '2px 0 0' }}>
            Arsip Struk Digital Kasir &amp; Database Acuan Harga Toko
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

      {/* Sub Tab Switcher: Struk Pembelian vs Acuan Harga */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: 3,
          borderRadius: 14,
          background: '#ede5dc',
          gap: 4,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSubTab('receipts')}
          style={{
            padding: '8px 12px',
            borderRadius: 11,
            border: 'none',
            background: activeSubTab === 'receipts' ? '#181512' : 'transparent',
            color: activeSubTab === 'receipts' ? '#ffffff' : '#57534e',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s',
          }}
        >
          <Receipt size={14} color={activeSubTab === 'receipts' ? '#f59e0b' : '#78716c'} />
          <span>Struk Pembelian</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('benchmarks')}
          style={{
            padding: '8px 12px',
            borderRadius: 11,
            border: 'none',
            background: activeSubTab === 'benchmarks' ? '#181512' : 'transparent',
            color: activeSubTab === 'benchmarks' ? '#ffffff' : '#57534e',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            transition: 'all 0.2s',
          }}
        >
          <BookOpen size={14} color={activeSubTab === 'benchmarks' ? '#f59e0b' : '#78716c'} />
          <span>Acuan Harga Toko</span>
        </button>
      </div>

      {/* VIEW 1: STRUK PEMBELIAN */}
      {activeSubTab === 'receipts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 36, height: 38, borderRadius: 12, fontSize: '12px', background: '#ffffff' }}
              placeholder="Cari struk / nama toko / barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* 3 Metric Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: 16,
                padding: '10px 8px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ fontSize: '9.5px', color: '#78716c', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textTransform: 'uppercase' }}>
                Bulan Lalu
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#181512', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                {formatRupiah(lastMonthTotal)}
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: 16,
                padding: '10px 8px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ fontSize: '9.5px', color: '#78716c', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textTransform: 'uppercase' }}>
                Total Belanja
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#047857', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                {formatRupiah(cumulativeSpent)}
              </div>
            </div>

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e7e5e4',
                borderRadius: 16,
                padding: '10px 8px',
                textAlign: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ fontSize: '9.5px', color: '#78716c', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textTransform: 'uppercase' }}>
                Rata-rata Hemat
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#d97706', marginTop: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                {formatRupiah(avgSavings)}
              </div>
            </div>
          </div>

          {/* Period Filter Pills */}
          <div style={{ display: 'flex', gap: 6 }}>
            {['Bulan Ini', 'Bulan Lalu', 'Lihat Semua'].map((period) => (
              <button
                key={period}
                type="button"
                className={`stitch-category-pill ${selectedPeriod === period ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(period)}
                style={{ fontSize: '11px', padding: '5px 12px', fontWeight: 700 }}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Receipts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                    onClick={() => setSelectedTrip(trip)}
                    style={{
                      background: '#ffffff',
                      borderRadius: 18,
                      border: '1.5px solid #e7e5e4',
                      padding: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      transition: 'transform 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: '#FAF8F5',
                          border: '1px solid #dcd2c6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#059669',
                          flexShrink: 0,
                        }}
                      >
                        <Receipt size={20} />
                      </div>

                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#181512' }}>
                          {trip.storeName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#78716c', marginTop: 1 }}>
                          {formattedDate} • {trip.totalItemsCount || trip.itemsSnapshot.length} barang
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: '14.5px',
                          fontWeight: 800,
                          color: '#181512',
                        }}
                      >
                        {formatRupiah(grand)}
                      </div>
                      {trip.totalSavings > 0 && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            color: '#059669',
                            background: '#ecfdf5',
                            padding: '1px 6px',
                            borderRadius: 4,
                          }}
                        >
                          Hemat {formatRupiah(trip.totalSavings)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: ACUAN HARGA TOKO (MASTER BENCHMARK DATABASE) */}
      {activeSubTab === 'benchmarks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Top Actions: Search & Add */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search
                size={15}
                style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 36, height: 38, borderRadius: 12, fontSize: '12px', background: '#ffffff' }}
                placeholder="Cari acuan harga barang..."
                value={searchBenchmark}
                onChange={(e) => setSearchBenchmark(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowAddMasterModal(true)}
              style={{
                height: 38,
                padding: '0 12px',
                borderRadius: 12,
                background: '#181512',
                color: '#ffffff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Plus size={15} color="#f59e0b" />
              <span>Tambah</span>
            </button>
          </div>

          <div style={{ fontSize: '11px', color: '#78716c', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Store size={12} color="#059669" />
            <span>
              Patokan harga resmi bulan lalu di <strong>Lotte Mart Grocery - Puri Indah</strong>.
            </span>
          </div>

          {/* Benchmark Products List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredMaster.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid #e7e5e4',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#181512' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#78716c', marginTop: 2, display: 'flex', gap: 6 }}>
                    <span style={{ background: '#f5f5f4', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                      {item.category}
                    </span>
                    <span>Satuan: {item.unit}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', color: '#78716c', display: 'block' }}>
                    Harga Bulan Lalu:
                  </span>
                  <strong
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '14.5px',
                      color: '#059669',
                      fontWeight: 800,
                    }}
                  >
                    {formatRupiah(item.lastMonthPrice)}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL: STRUK DIGITAL THERMAL ROLLOUT
          ============================================================ */}
      {selectedTrip && (
        <div className="modal-backdrop" onClick={() => setSelectedTrip(null)} style={{ zIndex: 100 }}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 420,
              background: '#FAF8F5',
              borderRadius: 24,
              padding: 16,
              border: '2px solid #181512',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#047857', fontWeight: 800, fontSize: '13px' }}>
                <CheckCircle size={18} />
                <span>Bukti Pembayaran Kasir</span>
              </div>
              <button
                type="button"
                className="icon-action-btn"
                onClick={() => setSelectedTrip(null)}
                style={{ borderRadius: '50%', width: 30, height: 30 }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Thermal Receipt Paper Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 16,
                padding: '20px 18px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11.5px',
                color: '#1f2937',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* Receipt Header */}
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #cbd5e1', paddingBottom: 10 }}>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#181512' }}>
                  {selectedTrip.storeName.toUpperCase()}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: 2 }}>
                  Puri Indah Mall Lt. LG • Kembangan, Jakarta Barat
                </div>
                <div style={{ fontSize: '9.5px', color: '#94a3b8', marginTop: 4 }}>
                  {new Date(selectedTrip.date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#181512', marginTop: 2 }}>
                  TRX: LOTTE-PURI-{selectedTrip.id.slice(-6).toUpperCase()}
                </div>
              </div>

              {/* Items List */}
              <div style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {selectedTrip.itemsSnapshot.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
                      <div style={{ fontWeight: 700, color: '#181512', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        {item.quantity} {item.unit} @ {formatRupiah(item.unitPrice)}
                      </div>
                    </div>
                    <strong style={{ color: '#181512' }}>
                      {formatRupiah(item.quantity * item.unitPrice)}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Totals Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Subtotal Belanja:</span>
                  <span>{formatRupiah(selectedTrip.totalSpent)}</span>
                </div>

                {selectedTrip.totalSavings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669', fontWeight: 700 }}>
                    <span>Hemat Promo:</span>
                    <span>-{formatRupiah(selectedTrip.totalSavings)}</span>
                  </div>
                )}

                {selectedTrip.extraCosts && (
                  <>
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
                  </>
                )}

                <div
                  style={{
                    borderTop: '2px dashed #94a3b8',
                    paddingTop: 8,
                    marginTop: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    fontWeight: 800,
                    fontSize: '13px',
                    color: '#181512',
                  }}
                >
                  <span>TOTAL AKHIR:</span>
                  <span style={{ fontSize: '16px', color: '#059669' }}>
                    {formatRupiah(selectedTrip.grandTotal || selectedTrip.totalSpent)}
                  </span>
                </div>
              </div>

              {/* Barcode & Footer */}
              <div style={{ textAlign: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: 10 }}>
                <div style={{ letterSpacing: '4px', fontSize: '10px', color: '#64748b', fontWeight: 700 }}>
                  ||| |||| || ||||| |||| || |||
                </div>
                <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: 4 }}>
                  Terima kasih telah berbelanja cerdas di {selectedTrip.storeName}!
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button
                type="button"
                onClick={() => handleCopyReceiptText(selectedTrip)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 12,
                  background: '#ffffff',
                  border: '1.5px solid #dcd2c6',
                  color: '#181512',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  cursor: 'pointer',
                }}
              >
                <Copy size={14} />
                <span>{copySuccess ? 'Tersalin!' : 'Salin Teks'}</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTrip(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 12,
                  background: '#181512',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Tutup Struk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH ACUAN HARGA BARU */}
      {showAddMasterModal && (
        <div className="modal-backdrop" onClick={() => setShowAddMasterModal(false)} style={{ zIndex: 100 }}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 400, borderRadius: 24, padding: 18 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0 }}>Tambah Acuan Harga Bulan Lalu</h3>
              <button type="button" className="icon-action-btn" onClick={() => setShowAddMasterModal(false)}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveNewMaster} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <label className="form-label">Nama Produk *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Contoh: Beras Ramos Super 5kg"
                  value={newMasterName}
                  onChange={(e) => setNewMasterName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div>
                  <label className="form-label">Kategori</label>
                  <select
                    className="form-select"
                    value={newMasterCategory}
                    onChange={(e) => setNewMasterCategory(e.target.value as CategoryType)}
                  >
                    <option value="Bahan Pokok">Bahan Pokok</option>
                    <option value="Mandi & Kebersihan">Mandi &amp; Kebersihan</option>
                    <option value="Makanan & Camilan">Makanan &amp; Camilan</option>
                    <option value="Bumbu & Dapur">Bumbu &amp; Dapur</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Satuan</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="kg / liter / pack"
                    value={newMasterUnit}
                    onChange={(e) => setNewMasterUnit(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Harga Patokan Bulan Lalu (Rp) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  className="form-input"
                  placeholder="72000"
                  value={newMasterPrice || ''}
                  onChange={(e) => setNewMasterPrice(Number(e.target.value))}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: 6, padding: '11px' }}>
                Simpan ke Database Acuan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
