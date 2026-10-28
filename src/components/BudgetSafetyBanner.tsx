import React from 'react';
import { Scissors, Flame, ShieldCheck, AlertTriangle } from 'lucide-react';
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
  const budgetLimit = budgetSettings.monthlyBudget || 350000;
  const safety = getBudgetSafetyStatus(
    totalSpent,
    budgetLimit,
    budgetSettings.warningThresholdPercent || 80
  );

  const isSafe = safety.status === 'SAFE';
  const isWarning = safety.status === 'WARNING';
  const isDanger = safety.status === 'DANGER';

  // Calculate 10-segment LED index (0-9)
  const percent = Math.min(150, Math.round((totalSpent / budgetLimit) * 100));
  const activeSegments = Math.min(10, Math.ceil(percent / 10));

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 24,
        background: '#181512',
        border: '2px solid #292524',
        padding: '16px 16px 18px',
        color: '#ffffff',
        boxShadow: '0 4px 0 #181512, 0 8px 20px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Ambient Glow Gradients */}
      <div
        style={{
          position: 'absolute',
          right: -30,
          top: -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: isDanger ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.2)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -20,
          bottom: -20,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: isSafe ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 88, 12, 0.15)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Row: Status Pill & Savings Rubber Stamp */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #292524',
          paddingBottom: 10,
          marginBottom: 12,
        }}
      >
        {/* Status Pill */}
        <div
          onClick={onEditBudget}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '3px 9px',
            borderRadius: 6,
            background: isDanger
              ? 'rgba(239, 68, 68, 0.18)'
              : isWarning
              ? 'rgba(245, 158, 11, 0.18)'
              : 'rgba(16, 185, 129, 0.18)',
            border: `1px solid ${
              isDanger
                ? 'rgba(239, 68, 68, 0.4)'
                : isWarning
                ? 'rgba(245, 158, 11, 0.4)'
                : 'rgba(16, 185, 129, 0.4)'
            }`,
            color: isDanger ? '#f87171' : isWarning ? '#fbbf24' : '#34d399',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
          title="Ketuk untuk ubah batas dompet"
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981',
              boxShadow: isDanger
                ? '0 0 6px #ef4444'
                : isWarning
                ? '0 0 6px #f59e0b'
                : '0 0 6px #10b981',
            }}
          />
          <span>{isDanger ? 'RADAR: OVERBUDGET' : isWarning ? 'RADAR: WASPADA' : 'RADAR: AMAN'}</span>
        </div>

        {/* Savings Badge (Tactile Rubber Stamp) */}
        {totalSavings > 0 ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              borderRadius: 6,
              background: '#ea580c',
              color: '#ffffff',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transform: 'rotate(1deg)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              border: '1px solid rgba(254, 215, 170, 0.4)',
            }}
          >
            <Flame size={12} />
            <span>HEMAT {formatRupiah(totalSavings)}</span>
          </div>
        ) : (
          <div
            onClick={onEditBudget}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: '10.5px',
              color: '#a8a29e',
              fontFamily: "'JetBrains Mono', monospace",
              cursor: 'pointer',
            }}
          >
            <ShieldCheck size={12} color="#10b981" />
            <span>PAGU {formatRupiah(budgetLimit)}</span>
          </div>
        )}
      </div>

      {/* Main Spending Numbers */}
      <div style={{ position: 'relative', zIndex: 2, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              color: '#a8a29e',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            Total Belanja Berjalan
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10.5px',
              color: isDanger ? '#f87171' : isWarning ? '#fbbf24' : '#34d399',
              fontWeight: 700,
            }}
          >
            {percent}% / 100%
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 8,
            marginTop: 3,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#f59e0b',
                lineHeight: 1,
              }}
            >
              Rp
            </span>
            <span
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '34px',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1,
                letterSpacing: '-0.02em',
              }}
            >
              {totalSpent.toLocaleString('id-ID')}
            </span>
          </div>

          <div
            onClick={onEditBudget}
            style={{
              textAlign: 'right',
              cursor: 'pointer',
              background: '#292524',
              padding: '4px 10px',
              borderRadius: 8,
              border: '1px solid #44403c',
            }}
          >
            <span
              style={{
                display: 'block',
                fontSize: '9px',
                color: '#a8a29e',
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase',
              }}
            >
              {safety.remaining >= 0 ? 'Sisa Aman' : 'Defisit'}
            </span>
            <strong
              style={{
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                color: isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#f59e0b',
                fontWeight: 800,
              }}
            >
              {formatRupiah(Math.abs(safety.remaining))}
            </strong>
          </div>
        </div>
      </div>

      {/* 10-Segment Discrete LED Meter (Stitch Screen 2 Style) */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: 4,
            marginBottom: 6,
          }}
        >
          {Array.from({ length: 10 }).map((_, index) => {
            const isActive = index < activeSegments;
            let blockColor = '#292524'; // inactive dark
            let glow = 'none';

            if (isActive) {
              if (index < 7) {
                blockColor = '#10b981'; // safe green
                glow = '0 0 6px rgba(16, 185, 129, 0.5)';
              } else if (index < 9) {
                blockColor = '#f59e0b'; // warning amber
                glow = '0 0 6px rgba(245, 158, 11, 0.5)';
              } else {
                blockColor = '#ef4444'; // danger red
                glow = '0 0 8px rgba(239, 68, 68, 0.7)';
              }
            }

            return (
              <div
                key={index}
                style={{
                  height: 10,
                  borderRadius: 3,
                  background: blockColor,
                  boxShadow: glow,
                  transition: 'background-color 0.25s ease, box-shadow 0.25s ease',
                }}
              />
            );
          })}
        </div>

        {/* Meter Sub-Ticks */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '9.5px',
            fontFamily: "'JetBrains Mono', monospace",
            color: '#78716c',
            padding: '0 2px',
          }}
        >
          <span>Rp 0</span>
          <span>50%</span>
          <span style={{ color: '#fbbf24', fontWeight: 700 }}>80% Waspada</span>
          <span style={{ color: isDanger ? '#f87171' : '#a8a29e', fontWeight: 700 }}>
            Cap: {formatRupiah(budgetLimit)}
          </span>
        </div>
      </div>

      {/* Danger Action Banner: Pangkas Barang Jajan Otomatis */}
      {isDanger && optionalCount > 0 && onAutoTrimOptional && (
        <button
          type="button"
          onClick={onAutoTrimOptional}
          style={{
            marginTop: 12,
            width: '100%',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            border: 'none',
            borderRadius: 12,
            padding: '10px 14px',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            boxShadow: '0 3px 0 #991b1b, 0 6px 12px rgba(220, 38, 38, 0.3)',
            transition: 'transform 0.15s ease',
          }}
        >
          <Scissors size={14} />
          <span>Pangkas {optionalCount} Barang Jajan (Hemat {formatRupiah(optionalTotal)})</span>
        </button>
      )}

      {/* Warning Alert Message */}
      {isWarning && (
        <div
          style={{
            marginTop: 10,
            padding: '7px 10px',
            borderRadius: 8,
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: '11px',
            color: '#fde68a',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          <AlertTriangle size={13} color="#f59e0b" style={{ flexShrink: 0 }} />
          <span>Waspada: Pengeluaran telah mencapai {percent}% dari uang tunai di dompet!</span>
        </div>
      )}
    </div>
  );
};
