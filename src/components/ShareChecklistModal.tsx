import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare } from 'lucide-react';
import type { GroceryItem } from '../types/grocery';
import { formatGroceryListForSharing } from '../lib/calculations';

interface ShareChecklistModalProps {
  isOpen: boolean;
  items: GroceryItem[];
  totalSpent: number;
  budgetLimit: number;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ShareChecklistModal: React.FC<ShareChecklistModalProps> = ({
  isOpen,
  items,
  totalSpent,
  budgetLimit,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formattedText = formatGroceryListForSharing(items, totalSpent, budgetLimit);

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedText);
      setCopied(true);
      onShowToast('📋 Daftar belanja berhasil disalin ke papan klip!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      onShowToast('Gagal menyalin teks secara otomatis.');
    }
  };

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(formattedText);
    const waUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onShowToast('🚀 Membuka WhatsApp...');
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Share2 size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', color: '#fff', margin: 0, fontWeight: 700 }}>
                Bagikan Daftar Belanja
              </h3>
              <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                Kirim catatan ke teman kos atau simpan sebagai checklist
              </p>
            </div>
          </div>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ padding: '14px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            className="btn-primary"
            style={{
              background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
              fontSize: '12.5px',
              padding: '10px 14px',
            }}
            onClick={handleSendWhatsApp}
          >
            <MessageSquare size={16} />
            <span>Kirim WhatsApp</span>
          </button>

          <button
            className="btn-secondary"
            style={{
              borderColor: copied ? '#10b981' : 'var(--border-subtle)',
              color: copied ? '#34d399' : '#fff',
              fontSize: '12.5px',
              padding: '10px 14px',
            }}
            onClick={handleCopyClipboard}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>
        </div>

        {/* Text Preview Box */}
        <div style={{ padding: '14px 18px', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '11.5px', color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>
            Pratinjau Format Pesan WhatsApp:
          </div>
          <pre
            style={{
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '11.5px',
              lineHeight: 1.5,
              color: '#e2e8f0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'monospace',
              margin: 0,
            }}
          >
            {formattedText}
          </pre>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button className="btn-secondary" style={{ width: '100%', fontSize: '12.5px' }} onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
