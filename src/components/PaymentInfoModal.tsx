import React, { useState } from 'react';
import { CreditCard, Phone, User, Copy, Check, X, Building, MessageCircle } from 'lucide-react';
import { AppConfig } from '../types';
import { formatRupiah } from '../services/api';

interface PaymentInfoModalProps {
  config: AppConfig;
  onClose: () => void;
}

export const PaymentInfoModal: React.FC<PaymentInfoModalProps> = ({ config, onClose }) => {
  const [copiedRek, setCopiedRek] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyRek = () => {
    navigator.clipboard.writeText(config.rekeningKas);
    setCopiedRek(true);
    setTimeout(() => setCopiedRek(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(config.kontakBendahara);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const rawPhone = config.kontakBendahara.replace(/[^0-9]/g, '');
  const waPhone = rawPhone.startsWith('0') ? '62' + rawPhone.slice(1) : rawPhone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
        <div className="bg-emerald-950 text-white p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-800 rounded-lg">
              <CreditCard className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Rekening Pembayaran & Kontak</h3>
              <p className="text-[11px] text-emerald-200/80">{config.namaPerumahan}</p>
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
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500">Nomor Rekening Kas Iuran</span>
              <button
                type="button"
                onClick={handleCopyRek}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-stone-200 shadow-xs"
              >
                {copiedRek ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRek ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <p className="font-mono text-base font-extrabold text-stone-900">
              {config.rekeningKas}
            </p>
            <p className="text-xs text-stone-600">
              Iuran per bulan: <span className="font-bold text-emerald-800">{formatRupiah(config.iuranPerBulan)}</span> / unit rumah
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500">Bendahara Paguyuban</span>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-stone-200 shadow-xs"
              >
                {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPhone ? 'Tersalin' : 'Salin Nomor'}</span>
              </button>
            </div>
            <div className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-stone-500" />
              <span>{config.bendahara}</span>
            </div>
            <div className="text-xs text-stone-600 flex items-center gap-2 font-mono">
              <Phone className="w-3.5 h-3.5 text-stone-500" />
              <span>{config.kontakBendahara}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900">
            <strong>Catatan:</strong> Setelah melakukan transfer, harap kirimkan foto struk bukti transfer atau konfirmasi melalui WhatsApp ke bendahara agar dapat langsung dicentang pada sistem online ini.
          </div>

          <div className="pt-1">
            <a
              href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Halo Pak ${config.bendahara}, saya warga Medina Residence ingin konfirmasi perihal iuran sampah.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat WhatsApp Bendahara Langsung</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
