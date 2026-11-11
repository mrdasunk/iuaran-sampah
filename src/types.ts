export interface AppConfig {
  namaPerumahan: string;
  bendahara: string;
  kontakBendahara: string;
  rekeningKas: string;
  iuranPerBulan: number;
  periode: string;
  bulanList: string[];
  blokList: string[];
  totalRumahPerBlok: number;
}

export type PaymentMatrix = Record<string, Record<number, boolean[]>>;

export interface OccupantInfo {
  nama?: string;
  hp?: string;
  catatan?: string;
}

export type OccupantRecord = Record<string, OccupantInfo>;

export interface Transaction {
  id: string;
  tanggal: string;
  jenis: 'masuk' | 'keluar';
  kategori: string;
  keterangan: string;
  jumlah: number;
  waktuInput: string;
}

export interface AppDataResponse {
  success: boolean;
  config: AppConfig;
  payments: PaymentMatrix;
  occupants: OccupantRecord;
  transactions: Transaction[];
  serverTime: string;
}
