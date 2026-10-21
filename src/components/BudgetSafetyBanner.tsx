import React from 'react';
import { Scissors, Tag } from 'lucide-react';
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
  const isSafe = safety.status === 'SAFE';
  const isWarning = safety.status === 'WARNING';
  const isDanger = safety.status === 'DANGER';

  return (
    <div className={`stitch-budget-card ${statusClass}`} style={{ padding: '14px 16px', gap: 10 }}>
      {/* Top Header: Sisa Uang & Status Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div onClick={onEditBudget} style={{ cursor: 'pointer' }}>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>{safety.remaining >= 0 ? 'Sisa Anggaran' : 'Kelebihan Belanja'}</span>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>• Limit {formatRupiah(budgetSettings.monthlyBudget)}</span>
          </div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: isDanger ? '#dc2626' : isWarning ? '#d97706' : '#047857',
              letterSpacing: '-0.5px',
              marginTop: 2,
            }}
          >
            {formatRupiah(Math.abs(safety.remaining))}
          </div>
        </div>

        <button
          type="button"
          onClick={onEditBudget}
          className={`stitch-status-pill ${statusClass}`}
          style={{ border: 'none', cursor: 'pointer', fontSize: '11px', padding: '4px 10px' }}
        >
          {isSafe && 'Aman'}
          {isWarning && `Waspada (${safety.percentage}%)`}
          {isDanger && `Over Budget`}
        </button>
      </div>

      {/* Progress Bar Dinamis */}
      <div className="stitch-progress-bar-wrap" style={{ height: 6, margin: '2px 0' }}>
        <div
          className={`stitch-progress-bar-fill ${statusClass}`}
          style={{ width: `${Math.min(100, safety.percentage)}%` }}
        />
      </div>

      {/* Bottom Info Row: Terpakai & Hemat Promo */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: '#64748b' }}>
        <div>
          Terpakai: <strong style={{ color: '#0f172a' }}>{formatRupiah(totalSpent)}</strong>{' '}
          <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>({safety.percentage}%)</span>
        </div>

        {totalSavings > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: '#059669',
              fontWeight: 700,
              fontSize: '11px',
              background: '#ecfdf5',
              padding: '2px 8px',
              borderRadius: 6,
            }}
          >
            <Tag size={11} />
            <span>Hemat {formatRupiah(totalSavings)}</span>
          </div>
        )}
      </div>

      {/* Action Button: Pangkas Barang Jajan HANYA jika Over Budget */}
      {isDanger && optionalCount > 0 && onAutoTrimOptional && (
        <button
          type="button"
          onClick={onAutoTrimOptional}
          style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            color: '#dc2626',
            borderRadius: 10,
            padding: '8px 12px',
            fontSize: '11.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            width: '100%',
            marginTop: 4,
          }}
        >
          <Scissors size={13} />
          <span>Pangkas {optionalCount} Barang Jajan (Hemat {formatRupiah(optionalTotal)})</span>
        </button>
      )}
    </div>
  );
};

