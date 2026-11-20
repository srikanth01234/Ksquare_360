import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <AlertCircle size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Something went wrong</h2>
              <p className="text-xs text-slate-500 mt-1">
                An unexpected interface error occurred. You can reload the page or return to dashboard.
              </p>
            </div>
            {this.state.error && (
              <div className="p-3 bg-slate-50 rounded-xl text-left font-mono text-[11px] text-rose-700 border border-slate-200 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#008744] hover:bg-[#00743a] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-800/20"
              >
                <RefreshCw size={14} />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
