import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  MessageCircle, 
  FileText, 
  X,
  CreditCard
} from 'lucide-react';
import { AppConfig, OccupantRecord, PaymentMatrix } from '../types';
import { formatRupiah } from '../services/api';

interface ResidentLookupModalProps {
  config: AppConfig;
  payments: PaymentMatrix;
  occupants: OccupantRecord;
  onClose: () => void;
  onViewReceipt: (blok: string, unit: number) => void;
}

export const ResidentLookupModal: React.FC<ResidentLookupModalProps> = ({
  config,
  payments,
  occupants,
  onClose,
  onViewReceipt
}) => {
  const [selectedBlok, setSelectedBlok] = useState('A');
  const [selectedUnit, setSelectedUnit] = useState(1);
  const [copiedBank, setCopiedBank] = useState(false);

  const unitKey = `${selectedBlok}${selectedUnit}`;
  const occupant = occupants[unitKey];
  const row = payments[selectedBlok]?.[selectedUnit] || new Array(12).fill(false);
  const paidCount = row.filter(Boolean).length;
  const unpaidCount = 12 - paidCount;
  const sisaTunggakan = unpaidCount * config.iuranPerBulan;

  const handleCopyBank = () => {
    navigator.clipboard.writeText(config.rekeningKas);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const generateWhatsAppLink = () => {
    const rawPhone = config.kontakBendahara.replace(/[^0-9]/g, '');
    const waPhone = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : rawPhone;
    
    const unpaidMonths = config.bulanList.filter((_, idx) => !row[idx]).join(', ');
    const text = encodeURIComponent(
      `Halo Pak ${config.bendahara} (Bendahara Medina Residence),\n` +
      `Saya ingin konfirmasi iuran sampah untuk:\n` +
      `*Unit: Blok ${unitKey}*\n` +
      `*Nama: ${occupant?.nama || 'Warga Blok ' + unitKey}*\n` +
      `Status pembayaran: ${paidCount}/12 bulan lunas.\n` +
      (unpaidCount > 0 ? `Bulan belum lunas: ${unpaidMonths}\nTotal tunggakan: ${formatRupiah(sisaTunggakan)}\n` : `Status: Alhamdulillah lunas 1 tahun penuh!\n`) +
      `Berikut saya lampirkan bukti transfer. Terima kasih.`
    );

    return `https://wa.me/${waPhone}?text=${text}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-lg text-emerald-200">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Cek Status Iuran Rumah Anda</h3>
              <p className="text-xs text-emerald-200/80">{config.namaPerumahan}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-emerald-300 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Unit selector */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Pilih Blok</label>
              <select
                value={selectedBlok}
                onChange={(e) => setSelectedBlok(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {config.blokList.map((b) => (
                  <option key={b} value={b}>
                    Blok {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Nomor Rumah</label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                {Array.from({ length: config.totalRumahPerBlok }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    Nomor {num} (Blok {selectedBlok}{num})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Unit Status Card */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Unit Terpilih</span>
                <h4 className="text-xl font-bold text-stone-900">
                  Blok {unitKey}
                </h4>
                <p className="text-xs text-stone-600">
                  {occupant?.nama ? `Penghuni: ${occupant.nama}` : 'Penghuni: Belum diisi nama'}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  paidCount === 12
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {paidCount === 12 ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Lunas 1 Tahun
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      {unpaidCount} Bulan Belum
                    </>
                  )}
                </span>
                <div className="text-[11px] text-stone-500 mt-1 font-mono tabular-nums">
                  Terbayar: {paidCount}/12 bulan
                </div>
              </div>
            </div>

            {/* Months Pill Grid */}
            <div>
              <p className="text-[11px] font-semibold text-stone-500 mb-1.5">Rincian per Bulan ({config.periode}):</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {config.bulanList.map((bulan, idx) => {
                  const isPaid = row[idx];
                  return (
                    <div
                      key={bulan}
                      className={`p-1.5 rounded text-center text-xs font-medium border flex flex-col items-center justify-center ${
                        isPaid
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                          : 'bg-stone-100 border-stone-200 text-stone-400'
                      }`}
                    >
                      <span className="text-[10px]">{bulan}</span>
                      <span className="font-bold text-[11px] mt-0.5">
                        {isPaid ? 'Lunas' : 'Belum'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bill summary */}
            {unpaidCount > 0 ? (
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-stone-600">Total yang perlu dibayar:</span>
                <span className="font-bold text-rose-700 font-mono text-sm tabular-nums">
                  {formatRupiah(sisaTunggakan)}
                </span>
              </div>
            ) : (
              <div className="pt-2 text-center text-xs font-medium text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                Terima kasih! Iuran sampah rumah Anda telah lunas sepenuhnya untuk periode ini.
              </div>
            )}
          </div>

          {/* Payment Account Card */}
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sky-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-sky-700" />
                Rekening Kas Paguyuban
              </span>
              <button
                type="button"
                onClick={handleCopyBank}
                className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-sky-300"
              >
                {copiedBank ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedBank ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <p className="font-mono font-bold text-stone-900 text-xs sm:text-sm">
              {config.rekeningKas}
            </p>
            <p className="text-[11px] text-sky-800">
              Bendahara: <span className="font-medium">{config.bendahara}</span> ({config.kontakBendahara})
            </p>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewReceipt(selectedBlok, selectedUnit);
              }}
              className="py-2.5 px-3 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <FileText className="w-4 h-4 text-stone-600" />
              <span>Lihat Kuitansi / Slip</span>
            </button>

            <a
              href={generateWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Konfirmasi ke WA</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
