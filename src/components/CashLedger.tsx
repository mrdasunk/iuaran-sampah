import React, { useState } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar, 
  Tag, 
  FileText,
  AlertTriangle,
  Receipt
} from 'lucide-react';
import { Transaction } from '../types';
import { formatRupiah } from '../services/api';

interface CashLedgerProps {
  transactions: Transaction[];
  isAdmin: boolean;
  onAddTransaction: (tx: {
    jenis: 'masuk' | 'keluar';
    kategori: string;
    keterangan: string;
    jumlah: number;
    tanggal: string;
  }) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
}

export const CashLedger: React.FC<CashLedgerProps> = ({
  transactions,
  isAdmin,
  onAddTransaction,
  onDeleteTransaction
}) => {
  const [jenis, setJenis] = useState<'masuk' | 'keluar'>('keluar');
  const [kategori, setKategori] = useState('Operasional Angkut');
  const [keterangan, setKeterangan] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [armedDeleteId, setArmedDeleteId] = useState<string | null>(null);
  const [filterJenis, setFilterJenis] = useState<'all' | 'masuk' | 'keluar'>('all');

  const kategoriPresets = {
    keluar: [
      'Operasional Angkut',
      'Honor Petugas',
      'Perlengkapan',
      'Pemeliharaan Bak/Tong',
      'Lain-lain'
    ],
    masuk: [
      'Sumbangan Warga',
      'Sponsor / Donasi',
      'Kas Awal',
      'Penjualan Sampah Daur Ulang',
      'Pemasukan Lainnya'
    ]
  };

  const handleJenisChange = (newJenis: 'masuk' | 'keluar') => {
    setJenis(newJenis);
    setKategori(kategoriPresets[newJenis][0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const num = parseInt(jumlah, 10);
    if (!keterangan.trim() || isNaN(num) || num <= 0) {
      setErrorMsg('Harap isi keterangan dan nominal jumlah dengan benar.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await onAddTransaction({
        jenis,
        kategori,
        keterangan: keterangan.trim(),
        jumlah: num,
        tanggal
      });
      setKeterangan('');
      setJumlah('');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (filterJenis === 'all') return true;
    return tx.jenis === filterJenis;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Form Input Transaksi (Admin only) */}
      <div className="lg:col-span-1 bg-white rounded-xl border border-stone-200 shadow-xs p-5">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-stone-100">
          <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Input Catatan Kas Manual</h3>
            <p className="text-[11px] text-stone-500">Pemasukan tambahan / pengeluaran operasional</p>
          </div>
        </div>

        {!isAdmin ? (
          <div className="p-4 rounded-lg bg-stone-50 border border-dashed border-stone-200 text-center text-xs text-stone-500">
            <p className="font-medium text-stone-700 mb-1">Khusus Pengurus / Bendahara</p>
            <p>Silakan login admin di bilah atas untuk mencatat kas masuk atau pengeluaran lingkungan.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Segmented Jenis */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Jenis Transaksi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleJenisChange('keluar')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    jenis === 'keluar'
                      ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <ArrowDownCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Pengeluaran</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleJenisChange('masuk')}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 ${
                    jenis === 'masuk'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kas Masuk</span>
                </button>
              </div>
            </div>

            {/* Tanggal */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Tanggal</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {kategoriPresets[jenis].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Uraian Keterangan</label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder={jenis === 'keluar' ? 'Contoh: Iuran truk dinas DLH Des 2026' : 'Contoh: Sumbangan warga peduli lingkungan'}
                required
                className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Nominal */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Nominal (Rupiah)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400">
                  Rp
                </span>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  value={jumlah}
                  onChange={(e) => setJumlah(e.target.value)}
                  placeholder="Contoh: 150000"
                  required
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi Kas'}
            </button>
          </form>
        )}
      </div>

      {/* Daftar Riwayat Transaksi Kas */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-xs p-5 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-2 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Buku Kas & Uraian Transaksi</h3>
            <p className="text-[11px] text-stone-500">
              Total {transactions.length} transaksi tercatat secara transparan
            </p>
          </div>

          {/* Filter Jenis */}
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterJenis('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterJenis === 'all'
                  ? 'bg-white text-stone-900 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterJenis('keluar')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterJenis === 'keluar'
                  ? 'bg-white text-rose-800 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setFilterJenis('masuk')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                filterJenis === 'masuk'
                  ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Kas Masuk
            </button>
          </div>
        </div>

        {/* Transactions list */}
        <div className="overflow-y-auto max-h-[380px] divide-y divide-stone-100 pr-1">
          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              Belum ada catatan transaksi pada filter ini.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const isMasuk = tx.jenis === 'masuk';
              const isArmed = armedDeleteId === tx.id;

              return (
                <div
                  key={tx.id}
                  className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-stone-50/70 rounded-lg transition-colors group"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                      isMasuk ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isMasuk ? <ArrowUpCircle className="w-4 h-4" /> : <ArrowDownCircle className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-stone-900 text-xs truncate">
                        {tx.keterangan}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5 flex-wrap">
                        <span>{tx.tanggal}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-stone-600 font-medium">{tx.kategori}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 self-end sm:self-center">
                    <span className={`font-mono tabular-nums font-bold text-xs sm:text-sm ${
                      isMasuk ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {isMasuk ? '+' : '−'} {formatRupiah(tx.jumlah)}
                    </span>

                    {isAdmin && (
                      <div>
                        {isArmed ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                onDeleteTransaction(tx.id);
                                setArmedDeleteId(null);
                              }}
                              className="px-2 py-0.5 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
                            >
                              Yakin?
                            </button>
                            <button
                              type="button"
                              onClick={() => setArmedDeleteId(null)}
                              className="px-1.5 py-0.5 text-[10px] bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setArmedDeleteId(tx.id)}
                            className="p-1 text-stone-300 hover:text-rose-600 rounded transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                            title="Hapus transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
