import React from 'react';
import { ShoppingCart, Calculator, Receipt, Sliders } from 'lucide-react';

export type ActiveTab = 'cart' | 'calculator' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: ActiveTab;
  itemCount: number;
  onTabChange: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  itemCount,
  onTabChange,
}) => {
  return (
    <nav className="bottom-nav-bar" aria-label="Navigasi Utama">
      {/* Tab 1: Belanja / Troli */}
      <button
        className={`nav-item-btn ${activeTab === 'cart' ? 'active' : ''}`}
        onClick={() => onTabChange('cart')}
      >
        <div style={{ position: 'relative' }}>
          <ShoppingCart size={20} strokeWidth={activeTab === 'cart' ? 2.5 : 2} />
          {itemCount > 0 && <span className="nav-badge">{itemCount}</span>}
        </div>
        <span className="nav-label">Belanja</span>
      </button>

      {/* Tab 2: Cek Promo & Cerdas */}
      <button
        className={`nav-item-btn ${activeTab === 'calculator' ? 'active' : ''}`}
        onClick={() => onTabChange('calculator')}
      >
        <Calculator size={20} strokeWidth={activeTab === 'calculator' ? 2.5 : 2} />
        <span className="nav-label">Cek Promo</span>
      </button>

      {/* Tab 3: Riwayat & Struk */}
      <button
        className={`nav-item-btn ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => onTabChange('history')}
      >
        <Receipt size={20} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
        <span className="nav-label">Riwayat</span>
      </button>

      {/* Tab 4: Pengaturan / Cloud */}
      <button
        className={`nav-item-btn ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onTabChange('settings')}
      >
        <Sliders size={20} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
        <span className="nav-label">Pengaturan</span>
      </button>
    </nav>
  );
};
