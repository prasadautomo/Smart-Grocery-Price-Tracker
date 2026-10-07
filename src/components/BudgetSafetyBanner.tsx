import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Scissors } from 'lucide-react';
import { formatRupiah, getBudgetSafetyStatus } from '../lib/calculations';
import type { BudgetSettings } from '../types/grocery';

interface BudgetSafetyBannerProps {
  totalSpent: number;
  totalSavings: number;
  budgetSettings: BudgetSettings;
  onEditBudget: () => void;
  onAutoTrimOptional?: () => void;
  optionalCount?: number;
  optionalTotal?: number;
}

export const BudgetSafetyBanner: React.FC<BudgetSafetyBannerProps> = ({
  totalSpent,
  totalSavings,
  budgetSettings,
  onEditBudget,
  onAutoTrimOptional,
  optionalCount = 0,
  optionalTotal = 0,
}) => {
  const safety = getBudgetSafetyStatus(
    totalSpent,
    budgetSettings.monthlyBudget,
    budgetSettings.warningThresholdPercent
  );

  const statusClass = safety.status.toLowerCase();

  return (
    <div className={`stitch-budget-card ${statusClass}`}>
      {/* Top Header */}
      <div className="stitch-budget-header">
        <div className="stitch-budget-title" onClick={onEditBudget} style={{ cursor: 'pointer' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '10px',
              background: safety.status === 'SAFE' ? '#ecfdf5' : safety.status === 'WARNING' ? '#fef3c7' : '#fee2e2',
              color: safety.status === 'SAFE' ? '#059669' : safety.status === 'WARNING' ? '#d97706' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {safety.status === 'SAFE' && <ShieldCheck size={18} />}
            {safety.status === 'WARNING' && <AlertTriangle size={18} />}
            {safety.status === 'DANGER' && <ShieldAlert size={18} />}
          </div>
          <div>
            <h3>F-05 Pengendali Anggaran</h3>
            <p>Dompet Bulanan: {formatRupiah(budgetSettings.monthlyBudget)}</p>
          </div>
        </div>

        <span className={`stitch-status-pill ${statusClass}`}>
          {safety.status === 'SAFE' && 'Aman'}
          {safety.status === 'WARNING' && 'Waspada'}
          {safety.status === 'DANGER' && 'Bahaya'}
        </span>
      </div>

      {/* Numbers */}
      <div className="stitch-budget-stats">
        <span>
          Terpakai: <strong>{formatRupiah(totalSpent)}</strong> ({safety.percentage}%)
        </span>
        <span style={{ textAlign: 'right' }}>
          {safety.remaining >= 0 ? 'Sisa: ' : 'Boncos: '}
          <strong style={{ color: safety.remaining >= 0 ? '#10b981' : '#ef4444' }}>
            {formatRupiah(Math.abs(safety.remaining))}
          </strong>
        </span>
      </div>

      {/* Progress Bar */}
      <div className="stitch-progress-bar-wrap">
        <div
          className={`stitch-progress-bar-fill ${statusClass}`}
          style={{ width: `${Math.min(100, safety.percentage)}%` }}
        />
      </div>

      {/* Auto-Trim button if Over Budget */}
      {safety.status === 'DANGER' && optionalCount > 0 && onAutoTrimOptional && (
        <button
          type="button"
          onClick={onAutoTrimOptional}
          style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
            width: '100%',
          }}
        >
          <Scissors size={14} />
          <span>⚡ Pangkas {optionalCount} Barang Jajan ({formatRupiah(optionalTotal)})</span>
        </button>
      )}

      {/* Total Promo Savings */}
      {totalSavings > 0 && (
        <div style={{ fontSize: '11px', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>🏷️ Hemat {formatRupiah(totalSavings)} dari promo supermarket</span>
        </div>
      )}
    </div>
  );
};
