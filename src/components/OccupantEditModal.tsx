import React, { useState } from 'react';
import { User, Phone, FileText, X } from 'lucide-react';
import { OccupantInfo } from '../types';

interface OccupantEditModalProps {
  unitKey: string;
  occupant?: OccupantInfo;
  onSave: (unitKey: string, data: OccupantInfo) => Promise<void>;
  onClose: () => void;
}

export const OccupantEditModal: React.FC<OccupantEditModalProps> = ({
  unitKey,
  occupant,
  onSave,
  onClose
}) => {
  const [nama, setNama] = useState(occupant?.nama || '');
  const [hp, setHp] = useState(occupant?.hp || '');
  const [catatan, setCatatan] = useState(occupant?.catatan || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(unitKey, {
        nama: nama.trim(),
        hp: hp.trim(),
        catatan: catatan.trim()
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div>
            <h3 className="font-bold text-stone-900 text-base">Edit Data Penghuni</h3>
            <p className="text-xs text-emerald-800 font-semibold">Unit Blok {unitKey}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nama Kepala Keluarga / Penghuni
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Bp. Hendra / Bu Sri"
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              No. WhatsApp / HP (Opsional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                placeholder="0812xxxx"
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Catatan Khusus (Opsional)
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                rows={2}
                placeholder="Contoh: Rumah tingkat abu-abu / dekat gapura"
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
