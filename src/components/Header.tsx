import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  LogOut, 
  RefreshCw, 
  Search, 
  Settings, 
  Share2, 
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AppConfig } from '../types';
import { formatRupiah } from '../services/api';

interface HeaderProps {
  config: AppConfig;
  isAdmin: boolean;
  onLogin: (password: string) => Promise<boolean>;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenResidentLookup: () => void;
  onOpenSettings: () => void;
  onOpenWhatsAppReport: () => void;
  onOpenPaymentInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  isAdmin,
  onLogin,
  onLogout,
  onRefresh,
  isRefreshing,
  onOpenResidentLookup,
  onOpenSettings,
  onOpenWhatsAppReport,
  onOpenPaymentInfo
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;
    setIsSubmitting(true);
    setLoginError('');
    try {
      const ok = await onLogin(passwordInput);
      if (ok) {
        setShowLoginModal(false);
        setPasswordInput('');
      } else {
        setLoginError('Password salah. Silakan coba lagi.');
      }
    } catch {
      setLoginError('Koneksi bermasalah. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="bg-emerald-950 text-white border-b border-emerald-900 shadow-sm">
        {/* Top brand & navigation bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Brand Zone */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-inner shrink-0 mt-0.5">
                MR
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    Sistem Iuran Sampah Warga
                  </h1>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 font-medium">
                    {config.periode}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-200/90 mt-0.5">
                  {config.namaPerumahan}
                </p>
                <div className="flex items-center gap-2 text-xs text-emerald-300/80 mt-1 flex-wrap">
                  <span>Bendahara: {config.bendahara}</span>
                  <span aria-hidden="true">·</span>
                  <span>Tarif: {formatRupiah(config.iuranPerBulan)} / bulan</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Online Real-time
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Zone */}
            <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
              <button
                type="button"
                onClick={onOpenResidentLookup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60 transition-colors shadow-sm"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cek Rumah Saya</span>
              </button>

              <button
                type="button"
                onClick={onOpenPaymentInfo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60 transition-colors shadow-sm"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Rekening & Kontak</span>
              </button>

              <button
                type="button"
                onClick={onOpenWhatsAppReport}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/60 transition-colors shadow-sm"
                title="Format Laporan untuk Grup WhatsApp Warga"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Format WA</span>
              </button>

              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-1.5 text-xs rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition-colors"
                title="Sinkronisasi Ulang Data Server"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {isAdmin ? (
                <div className="flex items-center gap-2 pl-1 border-l border-emerald-800">
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="p-1.5 text-xs rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white transition-colors"
                    title="Pengaturan Sistem & Data"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-700 hover:bg-rose-600 text-white transition-colors shadow-sm"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar Admin</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 transition-colors shadow-sm"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Login Pengurus</span>
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Status banner */}
        <div className={`px-4 sm:px-6 lg:px-8 py-2 text-xs border-t ${
          isAdmin 
            ? 'bg-amber-950/70 border-amber-800/60 text-amber-200 flex items-center justify-between' 
            : 'bg-emerald-900/40 border-emerald-900/80 text-emerald-200/90 flex items-center justify-between'
        }`}>
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-medium text-amber-200">
                    Mode Pengurus / Bendahara Aktif: Anda dapat mencentang iuran, mencatat kas, dan mengedit data warga.
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                  <span>
                    Mode Warga (Transparansi Publik): Akses lihat rekapitulasi pembayaran iuran & kas paguyuban warga Medina Residence.
                  </span>
                </>
              )}
            </div>
            <div className="hidden sm:block text-right shrink-0 text-[11px] opacity-75">
              Data tersimpan online dan tersinkronisasi di semua perangkat
            </div>
          </div>
        </div>
      </header>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Login Pengurus</h3>
                  <p className="text-xs text-stone-500">Bendahara Medina Residence</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setShowLoginModal(false); setLoginError(''); }}
                className="text-stone-400 hover:text-stone-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Password Admin
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan password admin..."
                  autoFocus
                  required
                  className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Default password bawaan prototype: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">adminsampah</code>
                </p>
              </div>

              {loginError && (
                <div className="flex items-center gap-1.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-3 py-2 text-xs font-medium text-stone-600 hover:text-stone-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Memeriksa...' : 'Masuk Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
