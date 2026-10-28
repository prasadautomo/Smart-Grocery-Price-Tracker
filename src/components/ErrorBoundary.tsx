import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in KeranjangPintar PRO:', error, errorInfo);
  }

  private handleResetData = () => {
    try {
      localStorage.clear();
      window.location.href = '/';
    } catch {
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#181512',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 20px',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: 20,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '2px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              color: '#ef4444',
            }}
          >
            <AlertTriangle size={34} />
          </div>

          <span
            style={{
              padding: '2px 8px',
              borderRadius: 6,
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 10,
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            KeranjangPintar PRO • Recovery Mode
          </span>

          <h1
            style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 8px',
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Aplikasi Mengalami Kendala Tampilan
          </h1>

          <p
            style={{
              fontSize: '13px',
              color: '#a8a29e',
              maxWidth: 360,
              lineHeight: 1.5,
              margin: '0 0 20px',
            }}
          >
            Terjadi kesalahan sementara saat memuat data sesi atau komponen troli. Anda dapat memuat ulang atau memulihkan data awal kasus Rian.
          </p>

          {this.state.error && (
            <div
              style={{
                width: '100%',
                maxWidth: 420,
                background: '#292524',
                border: '1px solid #44403c',
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 20,
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  color: '#f87171',
                  fontFamily: "'JetBrains Mono', monospace",
                  wordBreak: 'break-word',
                  fontWeight: 600,
                }}
              >
                {this.state.error.message || String(this.state.error)}
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              width: '100%',
              maxWidth: 320,
            }}
          >
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 14,
                padding: '13px 18px',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              }}
            >
              <RotateCcw size={16} />
              <span>Muat Ulang Halaman</span>
            </button>

            <button
              type="button"
              onClick={this.handleResetData}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#292524',
                color: '#e7e5e4',
                border: '1px solid #44403c',
                borderRadius: 14,
                padding: '12px 18px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Home size={16} />
              <span>Reset & Pulihkan Data Kasus Rian</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

