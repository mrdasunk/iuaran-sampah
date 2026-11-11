import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'medina_db.json');

const DEFAULT_CONFIG = {
  namaPerumahan: 'Perumahan Medina Residence Bantargedang',
  bendahara: 'Bp Aziz Maryansyah',
  kontakBendahara: '0812-3456-7890',
  rekeningKas: 'BCA 8105-0982-11 a.n. Aziz Maryansyah',
  iuranPerBulan: 20000,
  periode: 'Nov 2026 – Okt 2027',
  adminPassword: 'adminsampah',
  bulanList: [
    'Nov 26', 'Des 26', 'Jan 27', 'Feb 27', 
    'Mar 27', 'Apr 27', 'Mei 27', 'Jun 27', 
    'Jul 27', 'Agu 27', 'Sep 27', 'Okt 27'
  ],
  blokList: ['A', 'B', 'C', 'D'],
  totalRumahPerBlok: 40
};

interface MedinaDatabase {
  config: typeof DEFAULT_CONFIG;
  payments: Record<string, Record<number, boolean[]>>;
  occupants: Record<string, { nama?: string; hp?: string; catatan?: string }>;
  transactions: Array<{
    id: string;
    tanggal: string;
    jenis: 'masuk' | 'keluar';
    kategori: string;
    keterangan: string;
    jumlah: number;
    waktuInput: string;
  }>;
}

function generateInitialData(): MedinaDatabase {
  const payments: Record<string, Record<number, boolean[]>> = {};

  DEFAULT_CONFIG.blokList.forEach((blok) => {
    payments[blok] = {};
    for (let i = 1; i <= DEFAULT_CONFIG.totalRumahPerBlok; i++) {
      // Create 12 months array
      const arr = new Array(12).fill(false);
      // Pre-seed some realistic payments for Nov 26 and Des 26
      if (i % 2 === 1 || i % 3 === 0) {
        arr[0] = true; // Nov 26 paid
      }
      if (i % 2 === 1 && i <= 25) {
        arr[1] = true; // Des 26 paid
      }
      if (i === 1 || i === 7 || i === 15) {
        arr[2] = true; // Jan 27 paid early
        arr[3] = true; // Feb 27 paid early
      }
      payments[blok][i] = arr;
    }
  });

  const occupants: Record<string, { nama?: string; hp?: string; catatan?: string }> = {
    'A1': { nama: 'H. Sudirman', catatan: 'Dekat Pos Satpam Utama' },
    'A2': { nama: 'Pak Hendra Kusuma', catatan: 'Rumah Putih Abu' },
    'A5': { nama: 'Bu Hj. Rohanah' },
    'A10': { nama: 'Bp Aziz Maryansyah', catatan: 'Bendahara Paguyuban' },
    'B1': { nama: 'Pak Bambang S.' },
    'B12': { nama: 'Pak RT Dedi Irawan', catatan: 'Ketua Paguyuban RT 04' },
    'C4': { nama: 'Ibu Ratna Dewi' },
    'C15': { nama: 'Pak Gunawan' },
    'D8': { nama: 'Pak Mulyadi' },
    'D20': { nama: 'Keluarga Bp Rudi' }
  };

  const transactions = [
    {
      id: 'tx-seed-1',
      tanggal: '2026-11-05',
      jenis: 'keluar' as const,
      kategori: 'Operasional Angkut',
      keterangan: 'Iuran Retribusi Truk Sampah Dinas DLH Periode Nov 2026',
      jumlah: 750000,
      waktuInput: new Date('2026-11-05T09:00:00Z').toISOString()
    },
    {
      id: 'tx-seed-2',
      tanggal: '2026-11-10',
      jenis: 'keluar' as const,
      kategori: 'Honor Petugas',
      keterangan: 'Honor Petugas Angkut Gerobak Sampah Lingkungan (2 Orang)',
      jumlah: 600000,
      waktuInput: new Date('2026-11-10T14:30:00Z').toISOString()
    },
    {
      id: 'tx-seed-3',
      tanggal: '2026-11-15',
      jenis: 'masuk' as const,
      kategori: 'Sumbangan Warga',
      keterangan: 'Sumbangan Sukarela Warga Peduli Kebersihan Lingkungan Medina',
      jumlah: 350000,
      waktuInput: new Date('2026-11-15T11:00:00Z').toISOString()
    },
    {
      id: 'tx-seed-4',
      tanggal: '2026-11-20',
      jenis: 'keluar' as const,
      kategori: 'Perlengkapan',
      keterangan: 'Pembelian Plastik Trashbag Jumbo 10 Pack & Sapu Lidi',
      jumlah: 185000,
      waktuInput: new Date('2026-11-20T16:15:00Z').toISOString()
    },
    {
      id: 'tx-seed-5',
      tanggal: '2026-12-05',
      jenis: 'keluar' as const,
      kategori: 'Operasional Angkut',
      keterangan: 'Iuran Retribusi Truk Sampah Dinas DLH Periode Des 2026',
      jumlah: 750000,
      waktuInput: new Date('2026-12-05T08:45:00Z').toISOString()
    },
    {
      id: 'tx-seed-6',
      tanggal: '2026-12-10',
      jenis: 'keluar' as const,
      kategori: 'Honor Petugas',
      keterangan: 'Honor Petugas Angkut Gerobak Sampah Lingkungan (2 Orang)',
      jumlah: 600000,
      waktuInput: new Date('2026-12-10T10:00:00Z').toISOString()
    }
  ];

  return {
    config: DEFAULT_CONFIG,
    payments,
    occupants,
    transactions
  };
}

function loadDatabase(): MedinaDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Ensure missing keys or formats are reconciled
      if (!parsed.config) parsed.config = DEFAULT_CONFIG;
      if (!parsed.payments) parsed.payments = {};
      if (!parsed.occupants) parsed.occupants = {};
      if (!parsed.transactions) parsed.transactions = [];
      return parsed;
    }
  } catch (err) {
    console.error('Failed reading database file, using default data:', err);
  }

  const initial = generateInitialData();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: MedinaDatabase): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed saving database file:', err);
    return false;
  }
}

// Global cached database
let db = loadDatabase();

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  // 1. Get full state
  app.get('/api/data', (_req, res) => {
    // Send state to client, excluding the secret password
    const { adminPassword, ...safeConfig } = db.config;
    res.json({
      success: true,
      config: safeConfig,
      payments: db.payments,
      occupants: db.occupants,
      transactions: db.transactions,
      serverTime: new Date().toISOString()
    });
  });

  // 2. Auth login
  app.post('/api/auth/login', (req, res) => {
    const { password } = req.body;
    if (password === db.config.adminPassword) {
      res.json({ success: true, message: 'Berhasil login sebagai Admin' });
    } else {
      res.status(401).json({ success: false, message: 'Password salah' });
    }
  });

  // 3. Update admin password
  app.post('/api/auth/change-password', (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (oldPassword !== db.config.adminPassword) {
      return res.status(401).json({ success: false, message: 'Password lama salah' });
    }
    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 4 karakter' });
    }
    db.config.adminPassword = newPassword.trim();
    saveDatabase(db);
    res.json({ success: true, message: 'Password admin berhasil diperbarui' });
  });

  // 4. Toggle payment
  app.post('/api/payments/toggle', (req, res) => {
    const { blok, unit, monthIndex, value } = req.body;
    if (!blok || !unit || monthIndex === undefined) {
      return res.status(400).json({ success: false, message: 'Parameter tidak lengkap' });
    }

    if (!db.payments[blok]) {
      db.payments[blok] = {};
    }
    if (!db.payments[blok][unit]) {
      db.payments[blok][unit] = new Array(12).fill(false);
    }

    db.payments[blok][unit][monthIndex] = Boolean(value);
    saveDatabase(db);

    res.json({
      success: true,
      blok,
      unit,
      monthIndex,
      value: db.payments[blok][unit][monthIndex]
    });
  });

  // 5. Batch update payments (e.g., mark whole year or multiple months)
  app.post('/api/payments/batch', (req, res) => {
    const { updates } = req.body; // Array<{ blok: string; unit: number; monthIndex: number; value: boolean }>
    if (!Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: 'Format data tidak valid' });
    }

    updates.forEach(({ blok, unit, monthIndex, value }) => {
      if (!db.payments[blok]) db.payments[blok] = {};
      if (!db.payments[blok][unit]) db.payments[blok][unit] = new Array(12).fill(false);
      db.payments[blok][unit][monthIndex] = Boolean(value);
    });

    saveDatabase(db);
    res.json({ success: true, count: updates.length });
  });

  // 6. Update occupant details (resident name, note)
  app.post('/api/occupants/update', (req, res) => {
    const { unitKey, nama, hp, catatan } = req.body; // e.g. "A10"
    if (!unitKey) {
      return res.status(400).json({ success: false, message: 'Nomor rumah (unitKey) wajib diisi' });
    }

    db.occupants[unitKey] = {
      nama: nama?.trim() || '',
      hp: hp?.trim() || '',
      catatan: catatan?.trim() || ''
    };

    saveDatabase(db);
    res.json({ success: true, occupant: db.occupants[unitKey] });
  });

  // 7. Add cash transaction (masuk / keluar)
  app.post('/api/transactions', (req, res) => {
    const { jenis, kategori, keterangan, jumlah, tanggal } = req.body;
    if (!keterangan || !jumlah || isNaN(Number(jumlah)) || Number(jumlah) <= 0) {
      return res.status(400).json({ success: false, message: 'Keterangan dan nominal transaksi harus valid' });
    }

    const newTx = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      jenis: jenis === 'keluar' ? ('keluar' as const) : ('masuk' as const),
      kategori: kategori?.trim() || (jenis === 'keluar' ? 'Operasional' : 'Pemasukan Lain'),
      keterangan: keterangan.trim(),
      jumlah: Math.round(Number(jumlah)),
      waktuInput: new Date().toISOString()
    };

    db.transactions.unshift(newTx);
    saveDatabase(db);
    res.json({ success: true, transaction: newTx });
  });

  // 8. Delete transaction
  app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const initialLen = db.transactions.length;
    db.transactions = db.transactions.filter(t => t.id !== id);

    if (db.transactions.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Transaksi tidak ditemukan' });
    }

    saveDatabase(db);
    res.json({ success: true, message: 'Transaksi berhasil dihapus' });
  });

  // 9. Update system config (bendahara name, fee, etc.)
  app.post('/api/config/update', (req, res) => {
    const { bendahara, kontakBendahara, rekeningKas, iuranPerBulan, periode } = req.body;
    if (bendahara) db.config.bendahara = bendahara.trim();
    if (kontakBendahara !== undefined) db.config.kontakBendahara = kontakBendahara.trim();
    if (rekeningKas !== undefined) db.config.rekeningKas = rekeningKas.trim();
    if (iuranPerBulan && Number(iuranPerBulan) > 0) db.config.iuranPerBulan = Math.round(Number(iuranPerBulan));
    if (periode) db.config.periode = periode.trim();

    saveDatabase(db);
    const { adminPassword, ...safeConfig } = db.config;
    res.json({ success: true, config: safeConfig });
  });

  // 10. Reset data to factory seed
  app.post('/api/system/reset-seed', (_req, res) => {
    db = generateInitialData();
    saveDatabase(db);
    const { adminPassword, ...safeConfig } = db.config;
    res.json({ success: true, message: 'Data berhasil direset ke data awal', config: safeConfig });
  });

  // 11. Full backup JSON export
  app.get('/api/system/export-json', (_req, res) => {
    const { adminPassword, ...safeConfig } = db.config;
    const exportPayload = {
      app: 'Medina Residence Waste Fee App',
      exportDate: new Date().toISOString(),
      config: safeConfig,
      payments: db.payments,
      occupants: db.occupants,
      transactions: db.transactions
    };
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="backup_iuran_medina.json"');
    res.send(JSON.stringify(exportPayload, null, 2));
  });

  // 12. Full backup JSON restore
  app.post('/api/system/restore-json', (req, res) => {
    const incoming = req.body;
    if (!incoming || !incoming.payments) {
      return res.status(400).json({ success: false, message: 'Format file backup tidak valid' });
    }

    if (incoming.payments) db.payments = incoming.payments;
    if (incoming.occupants) db.occupants = incoming.occupants;
    if (Array.isArray(incoming.transactions)) db.transactions = incoming.transactions;
    if (incoming.config) {
      db.config = { ...db.config, ...incoming.config };
    }

    saveDatabase(db);
    res.json({ success: true, message: 'Data berhasil dipulihkan' });
  });

  // Vite Integration
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Medina Residence running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
