import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  Download, 
  Upload, 
  RotateCcw, 
  Save, 
  X, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { AppConfig } from '../types';
import { api, formatRupiah } from '../services/api';

interface AdminSettingsModalProps {
  config: AppConfig;
  onUpdateConfig: (newCfg: Partial<AppConfig>) => Promise<void>;
  onResetSeed: () => Promise<void>;
  onClose: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  config,
  onUpdateConfig,
  onResetSeed,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'backup'>('general');

  // General settings state
  const [namaPerumahan, setNamaPerumahan] = useState(config.namaPerumahan);
  const [bendahara, setBendahara] = useState(config.bendahara);
  const [kontakBendahara, setKontakBendahara] = useState(config.kontakBendahara);
  const [rekeningKas, setRekeningKas] = useState(config.rekeningKas);
  const [iuranPerBulan, setIuranPerBulan] = useState(config.iuranPerBulan.toString());
  const [periode, setPeriode] = useState(config.periode);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [generalSuccess, setGeneralSuccess] = useState('');

  // Security password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Backup state
  const [isResetting, setIsResetting] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);
    setGeneralSuccess('');
    try {
      await onUpdateConfig({
        namaPerumahan: namaPerumahan.trim(),
        bendahara: bendahara.trim(),
        kontakBendahara: kontakBendahara.trim(),
        rekeningKas: rekeningKas.trim(),
        iuranPerBulan: Number(iuranPerBulan) || 20000,
        periode: periode.trim()
      });
      setGeneralSuccess('Pengaturan umum berhasil disimpan!');
      setTimeout(() => setGeneralSuccess(''), 3000);
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Password baru dan konfirmasi tidak cocok.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('Password baru minimal 4 karakter.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.changePassword(oldPassword, newPassword);
      setPasswordSuccess('Password admin berhasil diubah!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: any) {
      setPasswordError(err?.message || 'Gagal mengubah password');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleExportJson = () => {
    window.open('/api/system/export-json', '_blank');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        await api.restoreJson(json);
        setBackupMsg('Data backup JSON berhasil dipulihkan!');
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        setBackupMsg('File JSON tidak valid atau format salah.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await onResetSeed();
      setBackupMsg('Data berhasil dikembalikan ke status awal.');
      setTimeout(() => window.location.reload(), 1200);
    } finally {
      setIsResetting(false);
      setResetConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="bg-stone-900 text-white p-4 px-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-stone-800 rounded-lg">
              <Settings className="w-4 h-4 text-stone-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Pengaturan Sistem Pengurus</h3>
              <p className="text-[11px] text-stone-400">Konfigurasi bendahara, keamanan & data</p>
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

        {/* Tab switch */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Umum & Tarif
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Password Admin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`py-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'backup'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Backup & Reset
          </button>
        </div>

        {/* Tab content */}
        <div className="p-5">
          {activeTab === 'general' && (
            <form onSubmit={handleGeneralSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Perumahan
                </label>
                <input
                  type="text"
                  value={namaPerumahan}
                  onChange={(e) => setNamaPerumahan(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nama Bendahara
                  </label>
                  <input
                    type="text"
                    value={bendahara}
                    onChange={(e) => setBendahara(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    No. WhatsApp Bendahara
                  </label>
                  <input
                    type="text"
                    value={kontakBendahara}
                    onChange={(e) => setKontakBendahara(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Informasi Rekening Kas
                </label>
                <input
                  type="text"
                  value={rekeningKas}
                  onChange={(e) => setRekeningKas(e.target.value)}
                  placeholder="Contoh: BCA 8105-0982-11 a.n. Aziz Maryansyah"
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Besar Iuran (Rupiah/bln)
                  </label>
                  <input
                    type="number"
                    value={iuranPerBulan}
                    onChange={(e) => setIuranPerBulan(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Periode Berjalan
                  </label>
                  <input
                    type="text"
                    value={periode}
                    onChange={(e) => setPeriode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {generalSuccess && (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                  {generalSuccess}
                </p>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingGeneral}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingGeneral ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Password Lama
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan password admin saat ini"
                  required
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  required
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  required
                  className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {passwordError && (
                <p className="text-xs text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                  {passwordError}
                </p>
              )}
              {passwordSuccess && (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                  {passwordSuccess}
                </p>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Key className="w-4 h-4" />
                  <span>{isSavingPassword ? 'Memperbarui...' : 'Ganti Password'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1">Ekspor Data Cadangan (Backup JSON)</h4>
                <p className="text-stone-500 mb-3 text-[11px]">
                  Unduh seluruh rekaman pembayaran iuran dan riwayat buku kas untuk disimpan sebagai arsip.
                </p>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="px-3.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 font-semibold text-stone-800 flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-stone-600" />
                  <span>Download Backup JSON</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                <h4 className="font-bold text-stone-900 mb-1">Pulihkan Data (Restore)</h4>
                <p className="text-stone-500 mb-3 text-[11px]">
                  Unggah file backup JSON yang pernah diunduh sebelumnya untuk memulihkan data.
                </p>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-100 font-semibold text-stone-800 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-stone-600" />
                  <span>Pilih File Backup JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
                <h4 className="font-bold text-rose-900 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Reset ke Data Awal Demo
                </h4>
                <p className="text-rose-700 mb-3 text-[11px]">
                  Mengembalikan semua data ke status awal contoh prototype Medina Residence.
                </p>
                {resetConfirm ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetData}
                      disabled={isResetting}
                      className="px-3 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs"
                    >
                      {isResetting ? 'Mereset...' : 'Ya, Saya Yakin Reset'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetConfirm(false)}
                      className="px-3 py-1.5 rounded-lg bg-stone-200 text-stone-700 text-xs font-semibold"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setResetConfirm(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold border border-rose-300 transition-colors"
                  >
                    Reset Data Awal
                  </button>
                )}
              </div>

              {backupMsg && (
                <p className="text-xs text-stone-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 font-medium">
                  {backupMsg}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
