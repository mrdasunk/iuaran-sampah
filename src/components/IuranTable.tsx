import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  UserCheck, 
  FileText, 
  Check, 
  CheckCheck, 
  Edit3, 
  X, 
  ChevronRight,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { AppConfig, OccupantRecord, PaymentMatrix } from '../types';
import { formatRupiah } from '../services/api';

interface IuranTableProps {
  config: AppConfig;
  payments: PaymentMatrix;
  occupants: OccupantRecord;
  isAdmin: boolean;
  onTogglePayment: (blok: string, unit: number, monthIndex: number, currentVal: boolean) => void;
  onBatchUpdateUnit: (blok: string, unit: number, value: boolean) => void;
  onEditOccupant: (unitKey: string) => void;
  onViewReceipt: (blok: string, unit: number) => void;
}

export const IuranTable: React.FC<IuranTableProps> = ({
  config,
  payments,
  occupants,
  isAdmin,
  onTogglePayment,
  onBatchUpdateUnit,
  onEditOccupant,
  onViewReceipt
}) => {
  const [selectedBlok, setSelectedBlok] = useState<string>('A');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const { bulanList, totalRumahPerBlok } = config;

  // Calculate current block statistics
  const currentBlokPayments = payments[selectedBlok] || {};
  let terbayarBlok = 0;
  const totalSlotsBlok = totalRumahPerBlok * 12;

  for (let u = 1; u <= totalRumahPerBlok; u++) {
    const row = currentBlokPayments[u] || [];
    terbayarBlok += row.filter(Boolean).length;
  }

  const persenBlok = totalSlotsBlok > 0 ? (terbayarBlok / totalSlotsBlok) * 100 : 0;

  // Filtered unit rows for selected block
  const unitRows = useMemo(() => {
    const rows = [];
    const q = searchQuery.toLowerCase().trim();

    for (let u = 1; u <= totalRumahPerBlok; u++) {
      const unitKey = `${selectedBlok}${u}`;
      const occupant = occupants[unitKey];
      const occupantName = occupant?.nama || '';
      const row = currentBlokPayments[u] || new Array(12).fill(false);
      const paidCount = row.filter(Boolean).length;

      // Filter by search
      if (q) {
        const matchUnit = unitKey.toLowerCase().includes(q) || `blok ${selectedBlok.toLowerCase()} ${u}`.includes(q);
        const matchName = occupantName.toLowerCase().includes(q);
        const matchNote = (occupant?.catatan || '').toLowerCase().includes(q);
        if (!matchUnit && !matchName && !matchNote) {
          continue;
        }
      }

      // Filter by status
      if (statusFilter === 'unpaid' && paidCount === 12) continue;
      if (statusFilter === 'paid' && paidCount < 12) continue;

      rows.push({
        unit: u,
        unitKey,
        occupant,
        row,
        paidCount
      });
    }

    return rows;
  }, [selectedBlok, currentBlokPayments, occupants, totalRumahPerBlok, searchQuery, statusFilter]);

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden mb-6">
      {/* Block Selector Tabs */}
      <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50/60 px-4 pt-3 flex-wrap gap-2">
        <div className="flex space-x-1 overflow-x-auto pb-px">
          {config.blokList.map((blok) => {
            const isSelected = blok === selectedBlok;
            return (
              <button
                key={blok}
                type="button"
                onClick={() => setSelectedBlok(blok)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
                  isSelected
                    ? 'bg-white border-emerald-700 text-emerald-800 shadow-xs'
                    : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                Blok {blok}
              </button>
            );
          })}
        </div>

        {/* Live Block Progress Metric */}
        <div className="text-xs text-stone-600 flex items-center gap-3 py-1">
          <span className="font-medium">
            Blok {selectedBlok}: <span className="font-mono tabular-nums text-emerald-800 font-bold">{terbayarBlok}</span> dari {totalSlotsBlok} iuran ({formatRupiah(terbayarBlok * config.iuranPerBulan)})
          </span>
          <div className="w-24 bg-stone-200 h-2 rounded-full overflow-hidden hidden sm:block">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${persenBlok}%` }}
            />
          </div>
          <span className="font-mono text-[11px] text-stone-500 hidden sm:inline">{persenBlok.toFixed(0)}%</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 bg-stone-50/40 border-b border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari di Blok ${selectedBlok} (contoh: ${selectedBlok}1, nama warga)...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <span className="text-xs text-stone-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-stone-800 text-white font-medium'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Semua ({totalRumahPerBlok})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('unpaid')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'unpaid'
                  ? 'bg-rose-700 text-white font-medium'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Ada Tunggakan
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('paid')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'paid'
                  ? 'bg-emerald-700 text-white font-medium'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Lunas Penuh (12/12)
            </button>
          </div>
        </div>
      </div>

      {/* Main Matrix Table */}
      <div className="overflow-x-auto max-h-[620px] relative">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-emerald-950 text-white sticky top-0 z-20">
              <th scope="col" className="p-3 sticky left-0 z-30 bg-emerald-950 font-bold min-w-[130px] border-r border-emerald-900">
                Unit Rumah
              </th>
              {bulanList.map((bulan, idx) => (
                <th 
                  key={bulan} 
                  scope="col" 
                  className="py-3 px-2 text-center font-semibold whitespace-nowrap border-r border-emerald-900/60 min-w-[58px]"
                  title={`Bulan ke-${idx + 1}: ${bulan}`}
                >
                  {bulan}
                </th>
              ))}
              <th scope="col" className="py-3 px-3 text-center font-bold min-w-[70px] border-r border-emerald-900">
                Lunas
              </th>
              <th scope="col" className="py-3 px-3 text-center font-semibold min-w-[90px]">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {unitRows.length === 0 ? (
              <tr>
                <td colSpan={bulanList.length + 3} className="py-12 text-center text-stone-500">
                  Tidak ada rumah yang sesuai dengan pencarian atau filter di Blok {selectedBlok}.
                </td>
              </tr>
            ) : (
              unitRows.map(({ unit, unitKey, occupant, row, paidCount }, index) => {
                const isEven = index % 2 === 0;
                const isFullPaid = paidCount === 12;

                return (
                  <tr 
                    key={unitKey} 
                    className={`${isEven ? 'bg-white' : 'bg-stone-50/60'} hover:bg-emerald-50/50 transition-colors group`}
                  >
                    {/* Sticky Unit Column */}
                    <td className={`p-2.5 sticky left-0 z-10 border-r border-stone-200 font-medium ${
                      isEven ? 'bg-white group-hover:bg-emerald-50/50' : 'bg-stone-50 group-hover:bg-emerald-50/50'
                    }`}>
                      <div className="flex items-center justify-between gap-1">
                        <div>
                          <div className="font-bold text-stone-900 flex items-center gap-1.5">
                            <span>Blok {unitKey}</span>
                            {isFullPaid && (
                              <span className="inline-block w-2 h-2 rounded-full bg-emerald-600" title="Lunas Penuh 12 Bulan" />
                            )}
                          </div>
                          {occupant?.nama ? (
                            <div className="text-[11px] text-stone-600 truncate max-w-[105px]" title={occupant.nama}>
                              {occupant.nama}
                            </div>
                          ) : (
                            <div className="text-[10px] text-stone-400 italic">
                              Warga Blok {unitKey}
                            </div>
                          )}
                        </div>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => onEditOccupant(unitKey)}
                            className="p-1 text-stone-400 hover:text-emerald-700 rounded transition-colors"
                            title="Edit data penghuni rumah"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* 12 Months Checkboxes */}
                    {bulanList.map((bulan, bIdx) => {
                      const isPaid = Boolean(row[bIdx]);
                      return (
                        <td 
                          key={bIdx} 
                          className="p-2 text-center border-r border-stone-100 min-w-[58px]"
                        >
                          <label className="inline-flex items-center justify-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isPaid}
                              disabled={!isAdmin}
                              onChange={() => onTogglePayment(selectedBlok, unit, bIdx, isPaid)}
                              className={`w-4 h-4 rounded text-emerald-600 border-stone-300 focus:ring-emerald-500 transition-colors ${
                                !isAdmin ? 'cursor-default opacity-85' : 'cursor-pointer hover:border-emerald-600'
                              }`}
                              aria-label={`Blok ${unitKey} bulan ${bulan}`}
                            />
                          </label>
                        </td>
                      );
                    })}

                    {/* Paid Count Badge */}
                    <td className="p-2 text-center border-r border-stone-200 font-mono tabular-nums whitespace-nowrap">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        isFullPaid 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : paidCount > 0 
                            ? 'bg-stone-100 text-stone-700' 
                            : 'bg-rose-50 text-rose-700'
                      }`}>
                        {paidCount}/12
                      </span>
                    </td>

                    {/* Action Column */}
                    <td className="p-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onViewReceipt(selectedBlok, unit)}
                          className="p-1 px-2 text-[11px] font-medium rounded bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-800 border border-stone-200 transition-colors inline-flex items-center gap-1"
                          title="Lihat kuitansi dan status pembayaran unit ini"
                        >
                          <FileText className="w-3 h-3 text-stone-500" />
                          <span>Slip</span>
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => onBatchUpdateUnit(selectedBlok, unit, !isFullPaid)}
                            className={`p-1 rounded text-[11px] font-medium transition-colors ${
                              isFullPaid
                                ? 'text-stone-400 hover:text-rose-600'
                                : 'text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title={isFullPaid ? 'Batalkan semua bulan' : 'Tandai 1 tahun penuh lunas'}
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Instructions */}
      <div className="p-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-600 inline-block"></span>
          <span>Centang = Iuran terbayar ({formatRupiah(config.iuranPerBulan)} / bulan)</span>
        </div>
        <div>
          {isAdmin ? (
            <span className="text-amber-800 font-medium">Klik kotak untuk mengubah status pembayaran langsung.</span>
          ) : (
            <span>Mode Warga: Tabel dalam mode baca (hanya lihat). Hubungi bendahara jika ada iuran yang belum tercatat.</span>
          )}
        </div>
      </div>
    </div>
  );
};
