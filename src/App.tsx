import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  BookOpen, 
  BarChart3, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle,
  Building2,
  Calendar,
  Wallet
} from 'lucide-react';

import { AppConfig, AppDataResponse, OccupantInfo, OccupantRecord, PaymentMatrix, Transaction } from './types';
import { api, formatRupiah } from './services/api';

import { Header } from './components/Header';
import { FinancialSummary } from './components/FinancialSummary';
import { IuranTable } from './components/IuranTable';
import { CashLedger } from './components/CashLedger';
import { ResidentLookupModal } from './components/ResidentLookupModal';
import { ReceiptModal } from './components/ReceiptModal';
import { OccupantEditModal } from './components/OccupantEditModal';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { WhatsAppReportModal } from './components/WhatsAppReportModal';
import { PaymentInfoModal } from './components/PaymentInfoModal';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // App data state
  const [config, setConfig] = useState<AppConfig>({
    namaPerumahan: 'Perumahan Medina Residence Bantargedang',
    bendahara: 'Bp Aziz Maryansyah',
    kontakBendahara: '0812-3456-7890',
    rekeningKas: 'BCA 8105-0982-11 a.n. Aziz Maryansyah',
    iuranPerBulan: 20000,
    periode: 'Nov 2026 – Okt 2027',
    bulanList: ['Nov 26', 'Des 26', 'Jan 27', 'Feb 27', 'Mar 27', 'Apr 27', 'Mei 27', 'Jun 27', 'Jul 27', 'Agu 27', 'Sep 27', 'Okt 27'],
    blokList: ['A', 'B', 'C', 'D'],
    totalRumahPerBlok: 40
  });
  const [payments, setPayments] = useState<PaymentMatrix>({});
  const [occupants, setOccupants] = useState<OccupantRecord>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Auth & UI state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('medina_is_admin') === 'true';
    } catch {
      return false;
    }
  });
  const [activeTab, setActiveTab] = useState<'tabel' | 'kas' | 'rekap'>('tabel');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showResidentLookup, setShowResidentLookup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWhatsAppReport, setShowWhatsAppReport] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [receiptUnit, setReceiptUnit] = useState<{ blok: string; unit: number } | null>(null);
  const [editOccupantKey, setEditOccupantKey] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch all initial data
  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const data = await api.fetchAllData();
      if (data && data.success) {
        setConfig(data.config);
        setPayments(data.payments);
        setOccupants(data.occupants || {});
        setTransactions(data.transactions || []);
        setError(null);
      }
    } catch (err: any) {
      if (!isSilent) {
        setError(err?.message || 'Gagal tersambung ke server');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-poll every 30 seconds for live updates from other devices
    const interval = setInterval(() => {
      loadData(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Handle Login
  const handleLogin = async (password: string): Promise<boolean> => {
    try {
      const res = await api.login(password);
      if (res.success) {
        setIsAdmin(true);
        localStorage.setItem('medina_is_admin', 'true');
        showToast('Berhasil login sebagai Pengurus / Bendahara');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('medina_is_admin');
    showToast('Mode Warga aktif');
  };

  // Toggle single payment checkbox (optimistic update)
  const handleTogglePayment = async (
    blok: string,
    unit: number,
    monthIndex: number,
    currentVal: boolean
  ) => {
    if (!isAdmin) return;

    const newVal = !currentVal;

    // Optimistic update
    setPayments((prev) => {
      const clone = { ...prev };
      if (!clone[blok]) clone[blok] = {};
      const unitArr = [...(clone[blok][unit] || new Array(12).fill(false))];
      unitArr[monthIndex] = newVal;
      clone[blok] = { ...clone[blok], [unit]: unitArr };
      return clone;
    });

    try {
      await api.togglePayment(blok, unit, monthIndex, newVal);
    } catch (err: any) {
      // Rollback on error
      setPayments((prev) => {
        const clone = { ...prev };
        if (!clone[blok]) clone[blok] = {};
        const unitArr = [...(clone[blok][unit] || new Array(12).fill(false))];
        unitArr[monthIndex] = currentVal;
        clone[blok] = { ...clone[blok], [unit]: unitArr };
        return clone;
      });
      showToast('Gagal menyimpan perubahan ke server: ' + err.message);
    }
  };

  // Batch toggle all 12 months for a unit
  const handleBatchUpdateUnit = async (blok: string, unit: number, value: boolean) => {
    if (!isAdmin) return;

    // Optimistic update
    setPayments((prev) => {
      const clone = { ...prev };
      if (!clone[blok]) clone[blok] = {};
      clone[blok] = { ...clone[blok], [unit]: new Array(12).fill(value) };
      return clone;
    });

    const updates = Array.from({ length: 12 }, (_, i) => ({
      blok,
      unit,
      monthIndex: i,
      value
    }));

    try {
      await api.batchUpdatePayments(updates);
      showToast(value ? `Blok ${blok}${unit} ditandai Lunas 1 Tahun` : `Iuran Blok ${blok}${unit} direset`);
    } catch (err: any) {
      loadData(true);
      showToast('Gagal update batch: ' + err.message);
    }
  };

  // Save occupant details
  const handleSaveOccupant = async (unitKey: string, data: OccupantInfo) => {
    try {
      await api.updateOccupant(unitKey, data);
      setOccupants((prev) => ({ ...prev, [unitKey]: data }));
      showToast(`Data penghuni Blok ${unitKey} berhasil diperbarui`);
    } catch (err: any) {
      showToast('Gagal menyimpan data penghuni: ' + err.message);
    }
  };

  // Add transaction
  const handleAddTransaction = async (tx: {
    jenis: 'masuk' | 'keluar';
    kategori: string;
    keterangan: string;
    jumlah: number;
    tanggal: string;
  }) => {
    const res = await api.addTransaction(tx);
    if (res.success) {
      setTransactions((prev) => [res.transaction, ...prev]);
      showToast('Transaksi kas berhasil ditambahkan');
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (id: string) => {
    await api.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaksi berhasil dihapus');
  };

  // Update config
  const handleUpdateConfig = async (newCfg: Partial<AppConfig>) => {
    const res = await api.updateConfig(newCfg);
    if (res.success) {
      setConfig(res.config);
      showToast('Pengaturan sistem berhasil diperbarui');
    }
  };

  // Reset seed
  const handleResetSeed = async () => {
    const res = await api.resetSeed();
    if (res.success) {
      setConfig(res.config);
      await loadData();
      showToast('Data berhasil direset ke nilai awal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl mb-4 shadow-md animate-pulse">
          MR
        </div>
        <h2 className="text-base font-bold text-stone-800">Memuat Sistem Iuran Medina Residence...</h2>
        <p className="text-xs text-stone-500 mt-1">Mengambil data pembukuan kas online real-time</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col text-stone-900">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-stone-800 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        config={config}
        isAdmin={isAdmin}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onRefresh={() => loadData(false)}
        isRefreshing={isRefreshing}
        onOpenResidentLookup={() => setShowResidentLookup(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenWhatsAppReport={() => setShowWhatsAppReport(true)}
        onOpenPaymentInfo={() => setShowPaymentInfo(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Connection Error Banner */}
        {error && (
          <div className="p-3 mb-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadData(false)}
              className="text-xs font-bold underline hover:text-rose-950"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Financial KPI Cards */}
        <FinancialSummary
          config={config}
          payments={payments}
          transactions={transactions}
          isAdmin={isAdmin}
          onOpenNewTransaction={() => setActiveTab('kas')}
        />

        {/* Navigation Tabs between Table, Cash Ledger & Block Recap */}
        <div className="flex items-center justify-between border-b border-stone-200 mb-5">
          <div className="flex space-x-1 sm:space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('tabel')}
              className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'tabel'
                  ? 'border-emerald-700 text-emerald-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Ceklis Iuran Per Blok</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('kas')}
              className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'kas'
                  ? 'border-emerald-700 text-emerald-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Buku Kas & Transaksi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('rekap')}
              className={`py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'rekap'
                  ? 'border-emerald-700 text-emerald-900'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Rekapitulasi Blok</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-stone-500">
            <span>Total 160 Rumah (Blok A, B, C, D)</span>
          </div>
        </div>

        {/* Tab 1: Checklist Matrix */}
        {activeTab === 'tabel' && (
          <IuranTable
            config={config}
            payments={payments}
            occupants={occupants}
            isAdmin={isAdmin}
            onTogglePayment={handleTogglePayment}
            onBatchUpdateUnit={handleBatchUpdateUnit}
            onEditOccupant={(unitKey) => setEditOccupantKey(unitKey)}
            onViewReceipt={(blok, unit) => setReceiptUnit({ blok, unit })}
          />
        )}

        {/* Tab 2: Cash Ledger & In/Out Notes */}
        {activeTab === 'kas' && (
          <CashLedger
            transactions={transactions}
            isAdmin={isAdmin}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {/* Tab 3: Comparative Block Recap */}
        {activeTab === 'rekap' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5">
              <h3 className="text-base font-bold text-stone-900 mb-1">
                Perbandingan Kepatuhan Iuran Antar Blok
              </h3>
              <p className="text-xs text-stone-500 mb-4">
                Statistik rekapitulasi pembayaran iuran sampah periode {config.periode}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {config.blokList.map((blok) => {
                  let paidCount = 0;
                  const blokObj = payments[blok] || {};
                  for (let u = 1; u <= config.totalRumahPerBlok; u++) {
                    const row = blokObj[u] || [];
                    paidCount += row.filter(Boolean).length;
                  }
                  const totalSlots = config.totalRumahPerBlok * 12;
                  const pct = totalSlots > 0 ? (paidCount / totalSlots) * 100 : 0;
                  const nominal = paidCount * config.iuranPerBulan;

                  return (
                    <div key={blok} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-base text-stone-900">Blok {blok}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden mb-3">
                        <div 
                          className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="space-y-1 text-xs text-stone-600">
                        <div className="flex justify-between">
                          <span>Unit Terdaftar:</span>
                          <span className="font-semibold">{config.totalRumahPerBlok} Rumah</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Iuran Terbayar:</span>
                          <span className="font-mono font-semibold text-stone-900">{paidCount} / {totalSlots} bln</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-stone-200">
                          <span>Total Dana Terkumpul:</span>
                          <span className="font-mono font-bold text-emerald-900">{formatRupiah(nominal)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="p-5 rounded-xl bg-emerald-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-base">Butuh Laporan untuk Rapat Paguyuban?</h4>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Gunakan format laporan instan untuk disalin ke grup WhatsApp atau dicetak sebagai arsip bendahara.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowWhatsAppReport(true)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Salin Laporan WA
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 text-xs font-semibold transition-colors border border-emerald-700"
                >
                  Cetak Rekap
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-6 border-t border-stone-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-stone-200 font-bold">{config.namaPerumahan}</span>
            <span className="mx-2">·</span>
            <span>Sistem Informasi Kas & Iuran Sampah Warga</span>
          </div>
          <div className="text-stone-400 text-center sm:text-right">
            <span>Bendahara: {config.bendahara} ({config.kontakBendahara})</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showResidentLookup && (
        <ResidentLookupModal
          config={config}
          payments={payments}
          occupants={occupants}
          onClose={() => setShowResidentLookup(false)}
          onViewReceipt={(blok, unit) => setReceiptUnit({ blok, unit })}
        />
      )}

      {showPaymentInfo && (
        <PaymentInfoModal
          config={config}
          onClose={() => setShowPaymentInfo(false)}
        />
      )}

      {showSettings && (
        <AdminSettingsModal
          config={config}
          onUpdateConfig={handleUpdateConfig}
          onResetSeed={handleResetSeed}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showWhatsAppReport && (
        <WhatsAppReportModal
          config={config}
          payments={payments}
          transactions={transactions}
          onClose={() => setShowWhatsAppReport(false)}
        />
      )}

      {receiptUnit && (
        <ReceiptModal
          blok={receiptUnit.blok}
          unit={receiptUnit.unit}
          config={config}
          payments={payments}
          occupants={occupants}
          onClose={() => setReceiptUnit(null)}
        />
      )}

      {editOccupantKey && (
        <OccupantEditModal
          unitKey={editOccupantKey}
          occupant={occupants[editOccupantKey]}
          onSave={handleSaveOccupant}
          onClose={() => setEditOccupantKey(null)}
        />
      )}
    </div>
  );
}
