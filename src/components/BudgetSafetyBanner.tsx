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
              width: 34,
              height: 34,
              borderRadius: '10px',
              background: safety.status === 'SAFE' ? '#ecfdf5' : safety.status === 'WARNING' ? '#fef3c7' : '#fee2e2',
              color: safety.status === 'SAFE' ? '#059669' : safety.status === 'WARNING' ? '#d97706' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {safety.status === 'SAFE' && <ShieldCheck size={19} />}
            {safety.status === 'WARNING' && <AlertTriangle size={19} />}
            {safety.status === 'DANGER' && <ShieldAlert size={19} />}
          </div>
          <div>
            <h3>F-05 Pengendali Anggaran</h3>
            <p>Dompet Bulanan: {formatRupiah(budgetSettings.monthlyBudget)}</p>
          </div>
        </div>

        <span className={`stitch-status-pill ${statusClass}`}>
          {safety.status === 'SAFE' && 'Aman'}
          {safety.status === 'WARNING' && `Waspada (${safety.percentage}%)`}
          {safety.status === 'DANGER' && `Bahaya (${safety.percentage}%)`}
        </span>
      </div>

      {/* Numbers */}
      <div className="stitch-budget-stats">
        <span>
          Terpakai: <strong>{formatRupiah(totalSpent)}</strong>{' '}
          <span style={{ fontSize: '11px', color: safety.status === 'DANGER' ? '#dc2626' : '#64748b', fontWeight: 600 }}>
            ({safety.percentage}%)
          </span>
        </span>
        <span style={{ textAlign: 'right' }}>
          {safety.remaining >= 0 ? 'Sisa: ' : 'Boncos: '}
          <strong style={{ color: safety.remaining >= 0 ? '#10b981' : '#dc2626' }}>
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
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            color: '#b91c1c',
            borderRadius: 12,
            padding: '9px 12px',
            fontSize: '11.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fee2e2';
            e.currentTarget.style.borderColor = '#fca5a5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fef2f2';
            e.currentTarget.style.borderColor = '#fecaca';
          }}
        >
          <Scissors size={14} color="#dc2626" />
          <span>⚡ Pangkas {optionalCount} Barang Jajan (Hemat {formatRupiah(optionalTotal)})</span>
        </button>
      )}

      {/* Total Promo Savings */}
      {totalSavings > 0 && (
        <div
          style={{
            fontSize: '11px',
            color: '#047857',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            background: '#ecfdf5',
            padding: '5px 10px',
            borderRadius: 8,
            border: '1px solid #a7f3d0',
          }}
        >
          <span>🏷️ Hemat {formatRupiah(totalSavings)} dari promo supermarket</span>
        </div>
      )}
    </div>
  );
};
