import React, { useRef } from 'react';
import { Printer, Share2, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AppConfig, OccupantRecord, PaymentMatrix } from '../types';
import { formatRupiah } from '../services/api';

interface ReceiptModalProps {
  blok: string;
  unit: number;
  config: AppConfig;
  payments: PaymentMatrix;
  occupants: OccupantRecord;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  blok,
  unit,
  config,
  payments,
  occupants,
  onClose
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const unitKey = `${blok}${unit}`;
  const occupant = occupants[unitKey];
  const row = payments[blok]?.[unit] || new Array(12).fill(false);
  const paidMonths = config.bulanList.filter((_, idx) => row[idx]);
  const totalPaid = paidMonths.length * config.iuranPerBulan;
  const currentDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*BUKTI PEMBAYARAN IURAN SAMPAH*\n` +
      `*${config.namaPerumahan}*\n` +
      `Periode: ${config.periode}\n` +
      `---------------------------------\n` +
      `Unit Rumah: *Blok ${unitKey}*\n` +
      `Nama Warga: *${occupant?.nama || 'Warga Blok ' + unitKey}*\n` +
      `Bulan Lunas (${paidMonths.length} bln): ${paidMonths.join(', ') || 'Belum ada'}\n` +
      `Total Terbayar: *${formatRupiah(totalPaid)}*\n` +
      `Status: Terverifikasi oleh Bendahara (${config.bendahara})\n` +
      `Tanggal Cetak: ${currentDate}\n` +
      `---------------------------------\n` +
      `Terima kasih atas partisipasi aktif menjaga kebersihan lingkungan bersama!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200 my-8">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden bg-stone-900 text-white p-3.5 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-300">Slip Pembayaran Resmi</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-800 text-emerald-200">
              Blok {unitKey}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 px-2.5 rounded bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="p-1.5 px-2.5 rounded bg-emerald-700 hover:bg-emerald-600 text-xs font-medium text-white flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagi WA</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div ref={receiptRef} className="p-6 sm:p-8 bg-white text-stone-900 print:p-0">
          {/* Header */}
          <div className="text-center pb-4 border-b-2 border-stone-800">
            <h2 className="text-lg font-extrabold uppercase tracking-wide text-emerald-950">
              Kuitansi Iuran Kebersihan Sampah
            </h2>
            <p className="text-sm font-semibold text-stone-700 mt-0.5">
              {config.namaPerumahan}
            </p>
            <p className="text-xs text-stone-500">
              Kec. Kawalu, Kota Tasikmalaya · Periode {config.periode}
            </p>
          </div>

          {/* Details */}
          <div className="py-4 space-y-2 text-xs border-b border-stone-200">
            <div className="flex justify-between">
              <span className="text-stone-500">Nomor Bukti:</span>
              <span className="font-mono font-semibold text-stone-900">
                KWT-{unitKey}-{Date.now().toString().slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Unit Rumah:</span>
              <span className="font-bold text-stone-900 text-sm">Blok {unitKey}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Nama Penghuni:</span>
              <span className="font-semibold text-stone-900">{occupant?.nama || 'Warga Blok ' + unitKey}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Tarif Iuran:</span>
              <span className="font-medium text-stone-800">{formatRupiah(config.iuranPerBulan)} / bulan</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Tanggal Rekap:</span>
              <span className="text-stone-800">{currentDate}</span>
            </div>
          </div>

          {/* Table of Months */}
          <div className="py-4">
            <p className="text-xs font-bold text-stone-800 mb-2">Status Pembayaran 12 Bulan:</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-xs">
              {config.bulanList.map((bulan, idx) => {
                const isPaid = row[idx];
                return (
                  <div
                    key={bulan}
                    className={`p-2 rounded border text-center flex flex-col justify-between ${
                      isPaid 
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-900' 
                        : 'border-stone-200 bg-stone-50 text-stone-400'
                    }`}
                  >
                    <span className="font-semibold text-[11px]">{bulan}</span>
                    <span className="text-[10px] font-bold mt-1">
                      {isPaid ? '✓ Lunas' : 'Belum'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Total */}
          <div className="p-3 bg-stone-100 rounded-lg flex items-center justify-between font-mono my-2 border border-stone-200">
            <span className="text-xs font-bold text-stone-700">Total Iuran Terbayar:</span>
            <span className="text-base sm:text-lg font-bold text-emerald-900 tabular-nums">
              {formatRupiah(totalPaid)}
            </span>
          </div>

          {/* Signatures */}
          <div className="pt-6 grid grid-cols-2 text-center text-xs text-stone-700">
            <div>
              <p className="text-[11px] text-stone-500">Warga / Pembayar,</p>
              <div className="h-14"></div>
              <p className="font-semibold underline">{occupant?.nama || `Warga Blok ${unitKey}`}</p>
            </div>
            <div>
              <p className="text-[11px] text-stone-500">Bendahara Paguyuban,</p>
              <div className="h-10 flex items-center justify-center">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  LUNAS / VERIFIED
                </span>
              </div>
              <p className="font-bold underline">{config.bendahara}</p>
              <p className="text-[10px] text-stone-500">Medina Residence</p>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-6 pt-3 border-t border-stone-200 text-center text-[10px] text-stone-400">
            Dokumen ini dihasilkan secara otomatis oleh Sistem Informasi Iuran Sampah Online Medina Residence.
          </div>
        </div>
      </div>
    </div>
  );
};
