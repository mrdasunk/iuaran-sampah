import React, { useState } from 'react';
import { Copy, Check, Share2, X, MessageSquare } from 'lucide-react';
import { AppConfig, PaymentMatrix, Transaction } from '../types';
import { formatRupiah } from '../services/api';

interface WhatsAppReportModalProps {
  config: AppConfig;
  payments: PaymentMatrix;
  transactions: Transaction[];
  onClose: () => void;
}

export const WhatsAppReportModal: React.FC<WhatsAppReportModalProps> = ({
  config,
  payments,
  transactions,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  // Calculate stats
  let totalIuran = 0;
  let totalSlotTerbayar = 0;
  const blokStats = config.blokList.map((blok) => {
    let paidInBlok = 0;
    const blokObj = payments[blok] || {};
    for (let u = 1; u <= config.totalRumahPerBlok; u++) {
      const arr = blokObj[u] || [];
      const c = arr.filter(Boolean).length;
      paidInBlok += c;
    }
    totalSlotTerbayar += paidInBlok;
    totalIuran += paidInBlok * config.iuranPerBulan;
    const totalBlokSlots = config.totalRumahPerBlok * 12;
    const pct = totalBlokSlots > 0 ? ((paidInBlok / totalBlokSlots) * 100).toFixed(1) : '0';
    return { blok, paid: paidInBlok, total: totalBlokSlots, pct };
  });

  let totalMasukLain = 0;
  let totalKeluar = 0;
  transactions.forEach((t) => {
    if (t.jenis === 'masuk') totalMasukLain += t.jumlah;
    if (t.jenis === 'keluar') totalKeluar += t.jumlah;
  });

  const totalMasuk = totalIuran + totalMasukLain;
  const saldoAkhir = totalMasuk - totalKeluar;
  const today = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const reportText = 
`📢 *LAPORAN KAS IURAN SAMPAH WARGA*
*${config.namaPerumahan}*
Periode: ${config.periode}
Tanggal Rekap: ${today}
---------------------------------------------
👤 *Bendahara:* ${config.bendahara}
💰 *Tarif Iuran:* ${formatRupiah(config.iuranPerBulan)} / bulan

📊 *RINGKASAN KEUANGAN:*
• Total Iuran Warga: *${formatRupiah(totalIuran)}*
• Pemasukan Tambahan: *${formatRupiah(totalMasukLain)}*
• *Total Semua Pemasukan: ${formatRupiah(totalMasuk)}*
• *Total Pengeluaran Kas: ${formatRupiah(totalKeluar)}*
---------------------------------------------
💵 *SALDO KAS SAAT INI: ${formatRupiah(saldoAkhir)}*
---------------------------------------------

🏘️ *KEPATUHAN PEMBAYARAN PER BLOK:*
${blokStats.map(b => `• Blok ${b.blok}: ${b.paid}/${b.total} bulan (${b.pct}%)`).join('\n')}

💳 *REKENING PEMBAYARAN KAS:*
${config.rekeningKas}
Konfirmasi WA: ${config.kontakBendahara}

Terima kasih atas kerja sama dan kepedulian seluruh warga dalam menjaga lingkungan Medina Residence tetap bersih dan nyaman! 🙏`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWA = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(reportText)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
        <div className="bg-emerald-950 text-white p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-800 rounded-lg">
              <Share2 className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Format Laporan WhatsApp Grup</h3>
              <p className="text-[11px] text-emerald-200/80">Salin dan bagikan ke grup WA warga</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-stone-600">
            Teks laporan siap dibagikan ke grup Paguyuban/RT WhatsApp warga. Berisi ringkasan kas, tingkat kepatuhan per blok, dan informasi rekening kas.
          </p>

          <div className="relative">
            <textarea
              readOnly
              value={reportText}
              rows={12}
              className="w-full p-3 text-xs bg-stone-50 border border-stone-300 rounded-lg font-mono text-stone-800 focus:outline-none select-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Teks Berhasil Disalin!' : 'Salin Teks Laporan'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenWA}
              className="py-2.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Buka WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
