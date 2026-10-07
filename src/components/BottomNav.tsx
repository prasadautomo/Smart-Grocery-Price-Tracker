import React from 'react';
import { ShoppingCart, BarChart3, Receipt, Sliders } from 'lucide-react';

export type ActiveTab = 'cart' | 'history' | 'calculator' | 'settings';

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
      {/* Tab 1: Belanja */}
      <button
        type="button"
        className={`nav-item-btn ${activeTab === 'cart' ? 'active' : ''}`}
        onClick={() => onTabChange('cart')}
      >
        <div style={{ position: 'relative' }} className="nav-icon-wrap">
          <ShoppingCart size={20} strokeWidth={activeTab === 'cart' ? 2.5 : 2} />
          {itemCount > 0 && <span className="nav-badge">{itemCount}</span>}
        </div>
        <span className="nav-label">Belanja</span>
      </button>

      {/* Tab 2: Riwayat */}
      <button
        type="button"
        className={`nav-item-btn ${activeTab === 'history' ? 'active' : ''}`}
        onClick={() => onTabChange('history')}
      >
        <div className="nav-icon-wrap">
          <Receipt size={20} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
        </div>
        <span className="nav-label">Riwayat</span>
      </button>

      {/* Tab 3: Anggaran */}
      <button
        type="button"
        className={`nav-item-btn ${activeTab === 'calculator' ? 'active' : ''}`}
        onClick={() => onTabChange('calculator')}
      >
        <div className="nav-icon-wrap">
          <BarChart3 size={20} strokeWidth={activeTab === 'calculator' ? 2.5 : 2} />
        </div>
        <span className="nav-label">Anggaran</span>
      </button>

      {/* Tab 4: Pengaturan */}
      <button
        type="button"
        className={`nav-item-btn ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => onTabChange('settings')}
      >
        <div className="nav-icon-wrap">
          <Sliders size={20} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
        </div>
        <span className="nav-label">Pengaturan</span>
      </button>
    </nav>
  );
};
