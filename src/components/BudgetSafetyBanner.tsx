import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle, Edit3, Tag } from 'lucide-react';
import { formatRupiah, getBudgetSafetyStatus } from '../lib/calculations';
import type { BudgetSettings } from '../types/grocery';

interface BudgetSafetyBannerProps {
  totalSpent: number;
  totalSavings: number;
  budgetSettings: BudgetSettings;
  onEditBudget: () => void;
}

export const BudgetSafetyBanner: React.FC<BudgetSafetyBannerProps> = ({
  totalSpent,
  totalSavings,
  budgetSettings,
  onEditBudget,
}) => {
  const safety = getBudgetSafetyStatus(
    totalSpent,
    budgetSettings.monthlyBudget,
    budgetSettings.warningThresholdPercent
  );

  const statusClass = safety.status.toLowerCase();

  return (
    <div className={`budget-banner ${statusClass}`}>
      {/* Top row: Label badge & edit button */}
      <div className="budget-top-row">
        <div className="budget-label-group">
          <span className={`budget-badge ${statusClass}`}>
            {safety.status === 'SAFE' && <ShieldCheck size={13} />}
            {safety.status === 'WARNING' && <AlertTriangle size={13} />}
            {safety.status === 'DANGER' && <ShieldAlert size={13} />}
            {safety.label}
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            ({safety.percentage}% terpakai)
          </span>
        </div>

        <button
          className="budget-edit-btn"
          onClick={onEditBudget}
          title="Ubah batas anggaran"
        >
          <Edit3 size={13} />
          <span>Batas: {formatRupiah(budgetSettings.monthlyBudget)}</span>
        </button>
      </div>

      {/* Main Numbers: Total Keranjang & Sisa Dompet */}
      <div className="budget-numbers-grid">
        <div className="budget-col">
          <span className="budget-col-label">Total Belanja Keranjang</span>
          <span className="budget-col-value spent">
            {formatRupiah(totalSpent)}
          </span>
        </div>

        <div className="budget-col" style={{ textAlign: 'right' }}>
          <span className="budget-col-label">
            {safety.remaining >= 0 ? 'Sisa Uang Saku' : 'Kelebihan (Boncos)'}
          </span>
          <span className={`budget-col-value remaining ${statusClass}`}>
            {formatRupiah(Math.abs(safety.remaining))}
          </span>
        </div>
      </div>

      {/* Progress Bar Visual */}
      <div className="budget-progress-track">
        <div
          className={`budget-progress-fill ${statusClass}`}
          style={{ width: `${Math.min(100, safety.percentage)}%` }}
        />
      </div>

      {/* Safety Advice Box */}
      <div className="budget-advice-box">
        {safety.status === 'SAFE' && <ShieldCheck size={16} color="#34d399" />}
        {safety.status === 'WARNING' && <AlertTriangle size={16} color="#fbbf24" />}
        {safety.status === 'DANGER' && <ShieldAlert size={16} color="#f87171" />}
        <span style={{ color: safety.status === 'DANGER' ? '#fca5a5' : '#cbd5e1' }}>
          {safety.advice}
        </span>
      </div>

      {/* Total Promo Savings */}
      {totalSavings > 0 && (
        <div className="budget-savings-pill">
          <Tag size={12} />
          <span>Kamu hemat {formatRupiah(totalSavings)} dari promo supermarket!</span>
        </div>
      )}
    </div>
  );
};
