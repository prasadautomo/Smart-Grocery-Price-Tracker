import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  Tag,
  Store,
  AlertTriangle,
  PackagePlus,
  QrCode,
  Wallet,
  CreditCard,
  Banknote,
  Truck,
  Copy,
  Check,
  Clock,
  Sparkles,
  Zap,

} from 'lucide-react';
import type { GroceryItem, BudgetSettings, ShoppingTrip } from '../types/grocery';
import { formatRupiah, calculateItemPrice } from '../lib/calculations';

interface CheckoutModalProps {
  isOpen: boolean;
  items: GroceryItem[];
  budgetSettings: BudgetSettings;
  onClose: () => void;
  onConfirmCheckout: (trip: ShoppingTrip) => void;
}

type DeliveryMode = 'astro_instant' | 'physical_store';

interface AstroPaymentOption {
  id: string;
  name: string;
  category: 'qris' | 'ewallet' | 'va' | 'card' | 'cod';
  channel: string;
  description: string;
  badge?: string;
  accountNumber?: string;
}

const ASTRO_PAYMENT_METHODS: AstroPaymentOption[] = [
  {
    id: 'qris',
    name: 'QRIS Instant (Rekomendasi)',
    category: 'qris',
    channel: 'QRIS Nasional (GoPay, ShopeePay, OVO, DANA, BCA)',
    description: 'Bebas biaya admin • Scan otomatis dari semua aplikasi perbankan & e-wallet',
    badge: 'Paling Cepat',
  },
  {
    id: 'gopay',
    name: 'GoPay Direct',
    category: 'ewallet',
    channel: 'GoPay (0812-****-4321)',
    description: 'Saldo terhubung • Pembayaran 1-tap tanpa PIN',
    badge: 'Cashback 5%',
  },
  {
    id: 'shopeepay',
    name: 'ShopeePay',
    category: 'ewallet',
    channel: 'ShopeePay (0812-****-4321)',
    description: 'Bayar instan via saldo ShopeePay',
  },
  {
    id: 'dana',
    name: 'DANA E-Wallet',
    category: 'ewallet',
    channel: 'DANA Wallet',
    description: 'Konfirmasi saldo DANA instan',
  },
  {
    id: 'bca_va',
    name: 'BCA Virtual Account',
    category: 'va',
    channel: 'BCA VA 24 Jam',
    description: 'Otomatis terverifikasi via m-BCA / KlikBCA',
    accountNumber: '80777 0812 9842 1109',
  },
  {
    id: 'mandiri_va',
    name: 'Mandiri Virtual Account',
    category: 'va',
    channel: 'Mandiri VA',
    description: 'Transfer via Livin\' by Mandiri / ATM',
    accountNumber: '89022 0812 9842 1109',
  },
  {
    id: 'bri_va',
    name: 'BRI Virtual Account (BRIVA)',
    category: 'va',
    channel: 'BRIVA',
    description: 'Transfer via BRImo / ATM BRI',
    accountNumber: '12888 0812 9842 1109',
  },
  {
    id: 'credit_card',
    name: 'Kartu Kredit / Debit Online',
    category: 'card',
    channel: 'Visa / Mastercard / JCB',
    description: '3D Secure OTP terverifikasi',
  },
  {
    id: 'cod',
    name: 'Cash On Delivery (COD)',
    category: 'cod',
    channel: 'Bayar Tunai di Tempat',
    description: 'Siapkan uang pas untuk kurir Astro 15 menit',
    badge: 'Bayar Tunai',
  },
];

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  items,
  budgetSettings,
  onClose,
  onConfirmCheckout,
}) => {
  // Mode Pengiriman Astro
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('astro_instant');
  const [storeName, setStoreName] = useState('Astro Hub Sudirman (15 Menit)');
  const [notes, setNotes] = useState('Pesanan Kos via Astronauts.id');

  // Astro Payment State
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('qris');
  const [useAstroCoins, setUseAstroCoins] = useState<boolean>(true);
  const [copiedVA, setCopiedVA] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Biaya Tambahan Kasir / Kantong
  const [bagFee, setBagFee] = useState<number>(1000); // Kantong Ramah Lingkungan Astro
  const [parkingFee, setParkingFee] = useState<number>(0);
  const taxPercent = 0;


  if (!isOpen) return null;

  // Subtotal belanjaan
  let totalSpent = 0;
  let totalSavings = 0;
  items.forEach((item) => {
    const calc = calculateItemPrice(item);
    totalSpent += calc.finalTotal;
    totalSavings += calc.totalDiscountAmount;
  });

  // Ongkir Astro: Rp 9.000, Gratis jika total belanja >= Rp 50.000
  const isFreeShipping = totalSpent >= 50000;
  const shippingFee = deliveryMode === 'astro_instant' ? (isFreeShipping ? 0 : 9000) : 0;

  // Diskon Koin Astro: misal 5.000 koin = Rp 5.000
  const astroCoinsDiscount = useAstroCoins ? Math.min(5000, Math.round(totalSpent * 0.1)) : 0;

  // PPN
  const taxAmount = taxPercent > 0 ? Math.round(totalSpent * (taxPercent / 100)) : 0;

  // Grand Total
  const grandTotal = Math.max(0, totalSpent + bagFee + parkingFee + shippingFee + taxAmount - astroCoinsDiscount);
  const isOverBudget = grandTotal > budgetSettings.monthlyBudget;
  const remainingBudget = budgetSettings.monthlyBudget - grandTotal;

  const currentPayment = ASTRO_PAYMENT_METHODS.find((p) => p.id === selectedPaymentId) || ASTRO_PAYMENT_METHODS[0];

  const handleCopyVA = (va: string) => {
    navigator.clipboard.writeText(va.replace(/\s+/g, ''));
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      const astroOrderId = `ASTRO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newTrip: ShoppingTrip = {
        id: `trip-${Date.now()}`,
        date: new Date().toISOString(),
        storeName: deliveryMode === 'astro_instant' ? 'Astronauts.id (Astro 15m)' : storeName.trim(),
        totalSpent,
        totalSavings: totalSavings + astroCoinsDiscount + (deliveryMode === 'astro_instant' && isFreeShipping ? 9000 : 0),
        totalItemsCount: items.length,
        budgetLimit: budgetSettings.monthlyBudget,
        itemsSnapshot: [...items],
        extraCosts: {
          bagFee,
          parkingFee,
          taxPercent,
          taxAmount,
          shippingFee,
          astroCoinsDiscount,
        },
        grandTotal,
        notes: notes.trim(),
        paymentMethod: currentPayment.name,
        paymentChannel: currentPayment.channel,
        deliveryMode,
        astroOrderId,
      };

      onConfirmCheckout(newTrip);
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="bottom-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '92vh', overflowY: 'auto' }}
      >
        <div className="sheet-handle-bar" />
        
        {/* Header Modal */}
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '15.5px' }}>Kasir & Pembayaran Astro</h2>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Terintegrasi sistem pembayaran resmi Astronauts.id
              </span>
            </div>
          </div>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="sheet-body" onSubmit={handleCheckoutSubmit}>
          {/* Status Keamanan Anggaran */}
          {isOverBudget ? (
            <div
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <AlertTriangle size={18} color="#f87171" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '12px', color: '#fca5a5', lineHeight: 1.4 }}>
                <strong>Peringatan Dompet:</strong> Total bayar kasir melebihi jatah bulanan sebesar{' '}
                <strong>{formatRupiah(Math.abs(remainingBudget))}</strong>. Pastikan saldo mencukupi!
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <CheckCircle size={18} color="#34d399" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '12px', color: '#34d399', lineHeight: 1.4 }}>
                <strong>Dompet Aman!</strong> Sisa anggaran bulanan setelah bayar:{' '}
                <strong>{formatRupiah(remainingBudget)}</strong>.
              </div>
            </div>
          )}

          {/* 1. Opsi Layanan / Pengiriman */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Truck size={16} color="#38bdf8" />
              <span>Metode Layanan & Pengiriman</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {/* Option: Astro 15 Menit */}
              <div
                onClick={() => {
                  setDeliveryMode('astro_instant');
                  setParkingFee(0);
                }}
                style={{
                  border: deliveryMode === 'astro_instant' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: deliveryMode === 'astro_instant' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  padding: '10px',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <Truck size={15} color="#38bdf8" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Astro 15 Menit</span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#94a3b8', lineHeight: 1.3 }}>
                  Kurir kilat Astronauts.id tiba di kosan
                </div>
                <div style={{ marginTop: 6, fontSize: '11px', fontWeight: 700, color: isFreeShipping ? '#10b981' : '#38bdf8' }}>
                  {isFreeShipping ? 'GRATIS ONGKIR' : '+ Rp 9.000'}
                </div>
              </div>

              {/* Option: Belanja Toko Fisik */}
              <div
                onClick={() => setDeliveryMode('physical_store')}
                style={{
                  border: deliveryMode === 'physical_store' ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                  background: deliveryMode === 'physical_store' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '10px',
                  padding: '10px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: '15px' }}>🏪</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Belanja Mandiri</span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#94a3b8', lineHeight: 1.3 }}>
                  Dorong troli di supermarket fisik
                </div>
                <div style={{ marginTop: 6, fontSize: '11px', fontWeight: 700, color: '#10b981' }}>
                  Rp 0 (Tanpa Ongkir)
                </div>
              </div>
            </div>
          </div>

          {/* 2. Sistem Pembayaran Resmi Astro */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wallet size={16} color="#10b981" />
                <span>Sistem Pembayaran Astro (astronauts.id)</span>
              </div>
              <span
                style={{
                  fontSize: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  fontWeight: 700,
                }}
              >
                100% Aman & Terverifikasi
              </span>
            </div>

            {/* List Pilihan Metode Pembayaran */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ASTRO_PAYMENT_METHODS.map((method) => {
                const isSelected = selectedPaymentId === method.id;
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPaymentId(method.id)}
                    style={{
                      border: isSelected ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '8px',
                          background: isSelected ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                          color: isSelected ? '#fff' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {method.category === 'qris' && <QrCode size={18} />}
                        {method.category === 'ewallet' && <Wallet size={18} />}
                        {method.category === 'va' && <Banknote size={18} />}
                        {method.category === 'card' && <CreditCard size={18} />}
                        {method.category === 'cod' && <Truck size={18} />}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff' }}>
                            {method.name}
                          </span>
                          {method.badge && (
                            <span
                              style={{
                                fontSize: '9.5px',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: '#f59e0b',
                                color: '#000',
                                fontWeight: 800,
                              }}
                            >
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: 2 }}>
                          {method.description}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        border: isSelected ? '5px solid #10b981' : '2px solid #64748b',
                        background: '#fff',
                        flexShrink: 0,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Interactive Payment Detail View */}
            {currentPayment.category === 'qris' && (
              <div
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '14px' }}>QRIS</span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Standar Pembayaran Nasional</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px', color: '#d97706', fontWeight: 700 }}>
                    <Clock size={13} />
                    <span>Berlaku 15:00</span>
                  </div>
                </div>

                {/* QR Code Canvas Mockup */}
                <div
                  style={{
                    width: 170,
                    height: 170,
                    background: '#f8fafc',
                    border: '2px dashed #cbd5e1',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 8,
                    textAlign: 'center',
                  }}
                >
                  <QrCode size={110} color="#0f172a" />
                  <div style={{ fontSize: '10px', color: '#475569', fontWeight: 700, marginTop: 4 }}>
                    NMID: ID1024359281734
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Total Tagihan QRIS Astro:</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    {formatRupiah(grandTotal)}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: 600, marginTop: 2 }}>
                    ✅ Dukung GoPay, BCA, Livin, ShopeePay, OVO, DANA
                  </div>
                </div>
              </div>
            )}

            {currentPayment.category === 'va' && currentPayment.accountNumber && (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Nomor Virtual Account {currentPayment.name}:
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '1px', color: '#38bdf8' }}>
                    {currentPayment.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyVA(currentPayment.accountNumber!)}
                    style={{
                      background: copiedVA ? '#10b981' : '#246ee5',
                      border: 'none',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {copiedVA ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedVA ? 'Tersalin!' : 'Salin VA'}</span>
                  </button>
                </div>
                <div style={{ fontSize: '10.5px', color: '#cbd5e1' }}>
                  💡 Masukkan nominal persis <strong>{formatRupiah(grandTotal)}</strong> agar terverifikasi otomatis dalam 10 detik.
                </div>
              </div>
            )}

            {/* Astro Coins Toggle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="#fbbf24" />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24' }}>
                    Tukarkan Koin Astro (Tersedia 5.000)
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8' }}>
                    Potongan instan Rp 5.000 dari saldo loyalitas Astro
                  </div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={useAstroCoins}
                onChange={(e) => setUseAstroCoins(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#f59e0b' }}
              />
            </div>
          </div>

          {/* 3. Biaya Kasir Tambahan (Kantong & Parkir) */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
              <PackagePlus size={15} color="#38bdf8" />
              <span>Kantong Belanja & Tambahan:</span>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: 4 }}>
                Kantong Ramah Lingkungan Astro:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {[
                  { label: 'Bawa Sendiri', fee: 0 },
                  { label: 'Spunbond Rp 1rb', fee: 1000 },
                  { label: 'Besar Rp 3.5rb', fee: 3500 },
                ].map((opt) => (
                  <button
                    key={opt.fee}
                    type="button"
                    className={`category-pill ${bagFee === opt.fee ? 'active' : ''}`}
                    style={{ fontSize: '10.5px', padding: '6px 4px', textAlign: 'center', width: '100%' }}
                    onClick={() => setBagFee(opt.fee)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {deliveryMode === 'physical_store' && (
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: 4 }}>
                  Biaya Parkir Supermarket:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                  {[
                    { label: 'Gratis (Rp 0)', fee: 0 },
                    { label: 'Motor (Rp 2rb)', fee: 2000 },
                    { label: 'Mobil (Rp 5rb)', fee: 5000 },
                  ].map((opt) => (
                    <button
                      key={opt.fee}
                      type="button"
                      className={`category-pill ${parkingFee === opt.fee ? 'active' : ''}`}
                      style={{ fontSize: '10.5px', padding: '6px 4px', textAlign: 'center', width: '100%' }}
                      onClick={() => setParkingFee(opt.fee)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Rincian Tagihan Struk Astro */}
          <div className="card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#94a3b8', marginBottom: 6 }}>
              <span>Subtotal Belanja ({items.length} Barang):</span>
              <span style={{ color: '#fff', fontWeight: 600 }}>{formatRupiah(totalSpent)}</span>
            </div>

            {deliveryMode === 'astro_instant' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: 6 }}>
                <span>Ongkos Kirim Astro 15 Menit:</span>
                <span style={{ color: isFreeShipping ? '#10b981' : '#38bdf8', fontWeight: 600 }}>
                  {isFreeShipping ? 'GRATIS (Promo Belanja > 50rb)' : formatRupiah(shippingFee)}
                </span>
              </div>
            )}

            {bagFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: 6 }}>
                <span>Kantong Ramah Lingkungan:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>+{formatRupiah(bagFee)}</span>
              </div>
            )}

            {parkingFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: 6 }}>
                <span>Biaya Parkir Supermarket:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>+{formatRupiah(parkingFee)}</span>
              </div>
            )}

            {astroCoinsDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#fbbf24', marginBottom: 6 }}>
                <span>Diskon Koin Astro:</span>
                <span style={{ fontWeight: 700 }}>-{formatRupiah(astroCoinsDiscount)}</span>
              </div>
            )}

            {totalSavings > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#fbbf24', marginBottom: 6 }}>
                <span>Total Hemat Promo:</span>
                <span style={{ fontWeight: 700 }}>
                  <Tag size={12} style={{ display: 'inline', marginRight: 4 }} />
                  -{formatRupiah(totalSavings)}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: 8 }}>
              <span>Metode Pembayaran:</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>{currentPayment.name}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '17px',
                fontWeight: 800,
                color: isOverBudget ? '#f87171' : '#34d399',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: 10,
              }}
            >
              <span>TOTAL DIBAYAR ASTRO:</span>
              <span>{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          {/* Nama Toko & Catatan */}
          <div className="form-group">
            <label className="form-label">Nama Toko / Hub Astro</label>
            <div style={{ position: 'relative' }}>
              <Store
                size={16}
                style={{ position: 'absolute', left: 12, top: 13, color: '#64748b' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: 36 }}
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Catatan Pesanan Kos (Opsional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Titip di gerbang kosan / lantai 2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose} disabled={isProcessingPayment}>
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{
                flex: 2,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              }}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <div className="spinner-border" style={{ width: 16, height: 16 }} />
                  <span>Memproses Pembayaran...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Bayar via {currentPayment.name.split(' ')[0]}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
