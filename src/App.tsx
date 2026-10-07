import React, { useState, useEffect } from 'react';
import type { GroceryItem, ShoppingTrip, BudgetSettings } from './types/grocery';
import {
  loadGroceryItems,
  saveGroceryItems,
  loadShoppingHistory,
  saveShoppingHistory,
  loadBudgetSettings,
  saveBudgetSettings,
  INITIAL_ITEMS,
  INITIAL_HISTORY,
  INITIAL_BUDGET,
} from './lib/storage';
import { getSupabaseClient } from './lib/supabase';
import { calculateItemPrice, formatRupiah, getTrimRecommendations } from './lib/calculations';

// Components
import { Header } from './components/Header';
import { BudgetSafetyBanner } from './components/BudgetSafetyBanner';
import { GroceryList } from './components/GroceryList';
import { SmartPromoCalculator } from './components/SmartPromoCalculator';
import { ShoppingHistory } from './components/ShoppingHistory';
import { SettingsView } from './components/SettingsView';
import { BottomNav, type ActiveTab } from './components/BottomNav';

// Modals
import { AddEditItemModal } from './components/AddEditItemModal';
import { BudgetSettingsModal } from './components/BudgetSettingsModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { CheckoutModal } from './components/CheckoutModal';
import { QuickPresetModal } from './components/QuickPresetModal';
import { ShareChecklistModal } from './components/ShareChecklistModal';

export const App: React.FC = () => {
  // State Data Belanja
  const [items, setItems] = useState<GroceryItem[]>(() => loadGroceryItems());
  const [history, setHistory] = useState<ShoppingTrip[]>(() => loadShoppingHistory());
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>(() => loadBudgetSettings());

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('cart');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<GroceryItem | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Cloud & PWA State
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Inisialisasi status koneksi Supabase & PWA listener
  useEffect(() => {
    const client = getSupabaseClient();
    if (client) {
      setIsSupabaseConnected(true);
    }

    // PWA install prompt handler
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Kalkulasi total keranjang aktif
  let totalSpent = 0;
  let totalSavings = 0;
  items.forEach((item) => {
    const calc = calculateItemPrice(item);
    totalSpent += calc.finalTotal;
    totalSavings += calc.totalDiscountAmount;
  });

  // Hitung barang jajan/opsional untuk rekomendasi auto-trim
  const trimRec = getTrimRecommendations(items, totalSpent, budgetSettings.monthlyBudget);

  // Handler: Tambah / Ubah Item
  const handleSaveItem = (savedItem: GroceryItem) => {
    let updated: GroceryItem[];
    const exists = items.some((i) => i.id === savedItem.id);

    if (exists) {
      updated = items.map((i) => (i.id === savedItem.id ? savedItem : i));
      showToast(`Item "${savedItem.name}" berhasil diubah!`);
    } else {
      updated = [savedItem, ...items];
      showToast(`"${savedItem.name}" ditambahkan ke troli!`);
    }

    setItems(updated);
    saveGroceryItems(updated);
  };

  // Handler: Tambah dari Preset Cepat
  const handleAddPresetItem = (presetItem: GroceryItem) => {
    const exists = items.some((i) => i.name.toLowerCase() === presetItem.name.toLowerCase());
    if (exists) {
      showToast(`Item "${presetItem.name}" sudah ada di troli.`);
      return;
    }
    const updated = [presetItem, ...items];
    setItems(updated);
    saveGroceryItems(updated);
    showToast(`⚡ "${presetItem.name}" ditambahkan dari Katalog Cepat!`);
  };

  // Handler: Checklist Lorong Toko (Centang barang di troli fisik)
  const handleToggleCheckItem = (id: string) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const nextState = !item.isCheckedInCart;
        return { ...item, isCheckedInCart: nextState };
      }
      return item;
    });
    setItems(updated);
    saveGroceryItems(updated);
  };

  // Handler: Pangkas Otomatis Barang Jajan jika Over-Budget
  const handleAutoTrimOptional = () => {
    if (trimRec.optionalItems.length === 0) {
      alert('Tidak ada barang kategori Jajan / Opsional yang dapat dipangkas.');
      return;
    }

    const confirmMsg = `Pangkas ${trimRec.optionalItems.length} barang jajan/opsional senilai ${formatRupiah(trimRec.totalOptionalAmount)} agar anggaran belanja kembali aman?`;
    if (confirm(confirmMsg)) {
      const updated = items.filter((i) => i.priority !== 'optional');
      setItems(updated);
      saveGroceryItems(updated);
      showToast(`⚡ Berhasil pangkas barang jajan! Hemat ${formatRupiah(trimRec.totalOptionalAmount)}.`);
    }
  };

  // Handler: Update Quantity Realtime (F-02)
  const handleUpdateQuantity = (id: string, newQty: number) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0.1, newQty) };
      }
      return item;
    });
    setItems(updated);
    saveGroceryItems(updated);
  };

  // Handler: Hapus Item
  const handleDeleteItem = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (confirm(`Hapus "${item?.name || 'barang'}" dari troli belanja?`)) {
      const updated = items.filter((i) => i.id !== id);
      setItems(updated);
      saveGroceryItems(updated);
      showToast('Barang dihapus dari troli.');
    }
  };

  // Handler: Ubah Item
  const handleEditItem = (item: GroceryItem) => {
    setItemToEdit(item);
    setIsAddModalOpen(true);
  };

  // Handler: Selesaikan Belanja di Kasir (F-06)
  const handleConfirmCheckout = (trip: ShoppingTrip) => {
    // 1. Simpan trip ke Riwayat
    const updatedHistory = [trip, ...history];
    setHistory(updatedHistory);
    saveShoppingHistory(updatedHistory);

    // 2. Kosongkan keranjang
    setItems([]);
    saveGroceryItems([]);

    setIsCheckoutModalOpen(false);
    setActiveTab('history');
    showToast('🎉 Belanja selesai! Struk kasir tersimpan rapi di Riwayat.');
  };

  // Handler: Simpan Anggaran
  const handleSaveBudget = (newSettings: BudgetSettings) => {
    setBudgetSettings(newSettings);
    saveBudgetSettings(newSettings);
    showToast('Batas anggaran berhasil diperbarui!');
  };

  // Handler: Reset ke Data Kasus Rian
  const handleResetDemoData = () => {
    setItems(INITIAL_ITEMS);
    saveGroceryItems(INITIAL_ITEMS);
    setHistory(INITIAL_HISTORY);
    saveShoppingHistory(INITIAL_HISTORY);
    setBudgetSettings(INITIAL_BUDGET);
    saveBudgetSettings(INITIAL_BUDGET);
    showToast('Data kasus Rian berhasil dipulihkan.');
  };

  // Handler: Pasang PWA
  const handleInstallPwa = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    } else {
      alert('Untuk memasang PWA: Buka menu browser kamu (titik tiga di kanan atas) lalu pilih "Tambahkan ke Layar Utama" (Add to Home Screen).');
    }
  };

  return (
    <div className="app-viewport-wrapper">
      <div className="mobile-app-container">
        {/* Toast Notifikasi */}
        {toastMessage && (
          <div className="toast-banner">
            <span style={{ fontSize: '12.5px', color: '#fff', fontWeight: 600 }}>
              {toastMessage}
            </span>
          </div>
        )}

        {/* Header Mobile */}
        <Header
          isSupabaseConnected={isSupabaseConnected}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* Scrollable Main Content */}
        <main className="app-content-scroll">
          {/* TAB 1: BELANJA & TROLI AKTIF */}
          {activeTab === 'cart' && (
            <>
              {/* Pengendali Anggaran (F-05) + Auto-Trim Jajan */}
              <BudgetSafetyBanner
                totalSpent={totalSpent}
                totalSavings={totalSavings}
                budgetSettings={budgetSettings}
                onEditBudget={() => setIsBudgetModalOpen(true)}
                onAutoTrimOptional={handleAutoTrimOptional}
                optionalCount={trimRec.optionalItems.length}
                optionalTotal={trimRec.totalOptionalAmount}
              />

              {/* Daftar Barang Belanjaan (F-01 s/d F-04 + Checklist + Presets + Share) */}
              <GroceryList
                items={items}
                budgetLimit={budgetSettings.monthlyBudget}
                onAddItem={() => {
                  setItemToEdit(null);
                  setIsAddModalOpen(true);
                }}
                onOpenPresets={() => setIsPresetModalOpen(true)}
                onOpenShare={() => setIsShareModalOpen(true)}
                onEditItem={handleEditItem}
                onDeleteItem={handleDeleteItem}
                onUpdateQuantity={handleUpdateQuantity}
                onToggleCheckItem={handleToggleCheckItem}
                onCheckout={() => {
                  if (items.length === 0) {
                    alert('Troli belanja masih kosong!');
                    return;
                  }
                  setIsCheckoutModalOpen(true);
                }}
              />
            </>
          )}

          {/* TAB 2: KALKULATOR CERDAS (PROMO & KEMASAN) */}
          {activeTab === 'calculator' && (
            <SmartPromoCalculator
              budgetSettings={budgetSettings}
              totalSpent={totalSpent}
              items={items}
              onEditBudget={() => setIsBudgetModalOpen(true)}
              onApplyToCart={handleSaveItem}
            />
          )}

          {/* TAB 3: RIWAYAT & STRUK DIGITAL (F-06 + VISUAL ANALYTICS) */}
          {activeTab === 'history' && <ShoppingHistory history={history} />}

          {/* TAB 4: PENGATURAN & INTEGRASI CLOUD */}
          {activeTab === 'settings' && (
            <SettingsView
              budgetSettings={budgetSettings}
              isSupabaseConnected={isSupabaseConnected}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
              onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
              onResetDemoData={handleResetDemoData}
              onInstallPwa={handleInstallPwa}
              isInstallable={!!installPrompt}
            />
          )}
        </main>

        {/* Floating Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          itemCount={items.length}
          onTabChange={setActiveTab}
        />

        {/* Modals & Sheets */}
        <AddEditItemModal
          isOpen={isAddModalOpen}
          itemToEdit={itemToEdit}
          onClose={() => {
            setIsAddModalOpen(false);
            setItemToEdit(null);
          }}
          onSave={handleSaveItem}
        />

        <QuickPresetModal
          isOpen={isPresetModalOpen}
          cartItems={items}
          onClose={() => setIsPresetModalOpen(false)}
          onAddPreset={handleAddPresetItem}
        />

        <ShareChecklistModal
          isOpen={isShareModalOpen}
          items={items}
          totalSpent={totalSpent}
          budgetLimit={budgetSettings.monthlyBudget}
          onClose={() => setIsShareModalOpen(false)}
          onShowToast={showToast}
        />

        <BudgetSettingsModal
          isOpen={isBudgetModalOpen}
          currentSettings={budgetSettings}
          onClose={() => setIsBudgetModalOpen(false)}
          onSave={handleSaveBudget}
        />

        <SupabaseConfigModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          onConnectionChange={setIsSupabaseConnected}
          onRefreshData={() => {
            setItems(loadGroceryItems());
            setHistory(loadShoppingHistory());
            setBudgetSettings(loadBudgetSettings());
          }}
          onResetDemoData={handleResetDemoData}
        />

        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          items={items}
          budgetSettings={budgetSettings}
          onClose={() => setIsCheckoutModalOpen(false)}
          onConfirmCheckout={handleConfirmCheckout}
        />
      </div>
    </div>
  );
};

export default App;
