import React from 'react';
import { TrendingUp, TrendingDown, Wallet, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatRupiah } from '../services/api';
import { AppConfig, PaymentMatrix, Transaction } from '../types';

interface FinancialSummaryProps {
  config: AppConfig;
  payments: PaymentMatrix;
  transactions: Transaction[];
  onOpenNewTransaction?: () => void;
  isAdmin: boolean;
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  config,
  payments,
  transactions,
  onOpenNewTransaction,
  isAdmin
}) => {
  // 1. Calculate total collected from fees
  let totalIuranTerkumpul = 0;
  let totalSlotIuran = 0;
  let totalSlotTerbayar = 0;

  config.blokList.forEach((blok) => {
    const blokObj = payments[blok] || {};
    for (let u = 1; u <= config.totalRumahPerBlok; u++) {
      const arr = blokObj[u] || [];
      totalSlotIuran += 12;
      arr.forEach((paid) => {
        if (paid) {
          totalSlotTerbayar++;
          totalIuranTerkumpul += config.iuranPerBulan;
        }
      });
    }
  });

  // 2. Calculate manual transactions
  let totalMasukTambahan = 0;
  let totalPengeluaran = 0;

  transactions.forEach((tx) => {
    if (tx.jenis === 'masuk') {
      totalMasukTambahan += tx.jumlah;
    } else if (tx.jenis === 'keluar') {
      totalPengeluaran += tx.jumlah;
    }
  });

  const totalSemuaPemasukan = totalIuranTerkumpul + totalMasukTambahan;
  const saldoAkhir = totalSemuaPemasukan - totalPengeluaran;
  const persentaseBayar = totalSlotIuran > 0 ? (totalSlotTerbayar / totalSlotIuran) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-4 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
            Ringkasan Keuangan & Saldo Kas
          </h2>
          <p className="text-xs text-stone-500">
            Transparansi pembukuan kas iuran sampah {config.namaPerumahan} ({config.periode})
          </p>
        </div>
        {isAdmin && onOpenNewTransaction && (
          <button
            type="button"
            onClick={onOpenNewTransaction}
            className="self-start sm:self-auto px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shadow-xs"
          >
            + Catat Kas Masuk / Keluar
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Iuran Terbayar */}
        <div className="p-4 rounded-lg bg-stone-50 border border-stone-200/80">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Iuran Terkumpul</span>
            <span className="font-medium text-emerald-700">{totalSlotTerbayar} / {totalSlotIuran} bln</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-stone-900 font-mono tabular-nums">
            {formatRupiah(totalIuranTerkumpul)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-500">
            <span>Kepatuhan: {persentaseBayar.toFixed(1)}%</span>
            <div className="w-20 bg-stone-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, persentaseBayar)}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Total Pemasukan Keseluruhan */}
        <div className="p-4 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
            <span>Total Semua Pemasukan</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-900 font-mono tabular-nums">
            {formatRupiah(totalSemuaPemasukan)}
          </div>
          <p className="mt-2 text-[11px] text-emerald-700">
            Iuran + Kas Tambahan ({formatRupiah(totalMasukTambahan)})
          </p>
        </div>

        {/* Total Pengeluaran */}
        <div className="p-4 rounded-lg bg-rose-50/70 border border-rose-200/80">
          <div className="flex items-center justify-between text-xs text-rose-800 mb-1">
            <span>Total Pengeluaran Kas</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-900 font-mono tabular-nums">
            {formatRupiah(totalPengeluaran)}
          </div>
          <p className="mt-2 text-[11px] text-rose-700">
            Operasional truk sampah, honor & perlengkapan
          </p>
        </div>

        {/* Saldo Kas Bersih */}
        <div className="p-4 rounded-lg bg-sky-50/80 border border-sky-200/90 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-sky-800 mb-1">
            <span className="font-semibold">Saldo Kas Saat Ini</span>
            <Wallet className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-950 font-mono tabular-nums">
            {formatRupiah(saldoAkhir)}
          </div>
          <p className="mt-2 text-[11px] text-sky-800">
            {saldoAkhir >= 0 ? 'Kondisi Kas Sehat & Terverifikasi' : 'Defisit Anggaran - Perlu Penyesuaian'}
          </p>
        </div>
      </div>
    </div>
  );
};
