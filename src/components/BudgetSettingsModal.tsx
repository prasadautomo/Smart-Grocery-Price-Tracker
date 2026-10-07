import React, { useState } from 'react';
import { X, Check, Wallet, AlertCircle } from 'lucide-react';
import type { BudgetSettings } from '../types/grocery';
import { formatRupiah } from '../lib/calculations';

interface BudgetSettingsModalProps {
  isOpen: boolean;
  currentSettings: BudgetSettings;
  onClose: () => void;
  onSave: (settings: BudgetSettings) => void;
}

export const BudgetSettingsModal: React.FC<BudgetSettingsModalProps> = ({
  isOpen,
  currentSettings,
  onClose,
  onSave,
}) => {
  const [budget, setBudget] = useState(currentSettings.monthlyBudget);
  const [threshold, setThreshold] = useState(currentSettings.warningThresholdPercent);

  if (!isOpen) return null;

  const presets = [250000, 350000, 500000, 750000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      monthlyBudget: Math.max(10000, Number(budget) || 350000),
      warningThresholdPercent: Math.min(95, Math.max(50, Number(threshold) || 80)),
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle-bar" />
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wallet size={18} color="#34d399" />
            <h2>Batas Anggaran Dompet</h2>
          </div>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form className="sheet-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Batas Maksimal Belanja Bulanan (Rp) *</label>
            <input
              type="number"
              step="10000"
              className="form-input"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              required
            />
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>
              Pilihan Cepat Sesuai Jatah Uang Saku:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`btn-secondary ${budget === p ? 'btn-primary' : ''}`}
                  style={{ fontSize: '12px', padding: '8px' }}
                  onClick={() => setBudget(p)}
                >
                  {formatRupiah(p)}
                  {p === 350000 && ' (Rian)'}
                </button>
              ))}
            </div>
          </div>

          {/* Warning Threshold Slider */}
          <div className="form-group" style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Ambang Batas Peringatan Kuning</label>
              <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 700 }}>
                {threshold}% ({formatRupiah((budget * threshold) / 100)})
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
            />
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Aplikasi akan memberi sinyal waspada saat total belanja mencapai {threshold}% dari isi dompet.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
            <AlertCircle size={16} color="#38bdf8" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
              <strong>Prinsip Anti-Malu di Kasir:</strong> Total belanja di troli akan terus dipantau realtime. Jika mendekati batas ini, indikator akan menyala agar kamu bisa mengeliminasi barang non-pokok sebelum antre di kasir.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 2 }}>
              <Check size={18} />
              <span>Simpan Batas Anggaran</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
