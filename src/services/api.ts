import { AppConfig, AppDataResponse, OccupantInfo, PaymentMatrix, Transaction } from '../types';

export const api = {
  async fetchAllData(): Promise<AppDataResponse> {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('Gagal mengambil data dari server');
    return res.json();
  },

  async login(password: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    return res.json();
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mengubah password');
    return data;
  },

  async togglePayment(
    blok: string,
    unit: number,
    monthIndex: number,
    value: boolean
  ): Promise<{ success: boolean; blok: string; unit: number; monthIndex: number; value: boolean }> {
    const res = await fetch('/api/payments/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blok, unit, monthIndex, value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal mengubah status pembayaran');
    return data;
  },

  async batchUpdatePayments(
    updates: Array<{ blok: string; unit: number; monthIndex: number; value: boolean }>
  ): Promise<{ success: boolean; count: number }> {
    const res = await fetch('/api/payments/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menyimpan perubahan massal');
    return data;
  },

  async updateOccupant(
    unitKey: string,
    occupant: OccupantInfo
  ): Promise<{ success: boolean; occupant: OccupantInfo }> {
    const res = await fetch('/api/occupants/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitKey, ...occupant }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memperbarui data warga');
    return data;
  },

  async addTransaction(tx: {
    jenis: 'masuk' | 'keluar';
    kategori?: string;
    keterangan: string;
    jumlah: number;
    tanggal?: string;
  }): Promise<{ success: boolean; transaction: Transaction }> {
    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tx),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menambah transaksi');
    return data;
  },

  async deleteTransaction(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal menghapus transaksi');
    return data;
  },

  async updateConfig(config: Partial<AppConfig>): Promise<{ success: boolean; config: AppConfig }> {
    const res = await fetch('/api/config/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memperbarui konfigurasi');
    return data;
  },

  async resetSeed(): Promise<{ success: boolean; message: string; config: AppConfig }> {
    const res = await fetch('/api/system/reset-seed', {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal reset data');
    return data;
  },

  async restoreJson(payload: {
    payments?: PaymentMatrix;
    occupants?: Record<string, OccupantInfo>;
    transactions?: Transaction[];
    config?: Partial<AppConfig>;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/system/restore-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Gagal memulihkan backup');
    return data;
  },
};

export function formatRupiah(amount: number): string {
  return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
}
