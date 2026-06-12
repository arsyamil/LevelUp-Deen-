# Business Rules — Level Up Deen

> Aturan bisnis, formula gamifikasi, sistem keuangan, dan logika inti Level Up Deen.

---

## 1. Pilar Produk

| Pilar | Deskripsi | Contoh Quest |
|-------|-----------|-------------|
| **Deen** | Ibadah wajib & sunnah | Shalat 5 waktu, tilawah, dzikir, dhuha, tahajud |
| **Body** | Kesehatan fisik & hidrasi | Push up, lari, squat, water tracker |
| **Mind** | Pengembangan pikiran | Baca buku, belajar skill, refleksi/jurnal |
| **Wealth** | Keuangan & perencanaan | Catat transaksi, budget, savings goal |
| **Discipline** | Konsistensi & recovery | Streak, completion rate, recovery quest |

---

## 2. Task System

### 2.1 Task Categories

| Category | Deskripsi | Deletable | Contoh |
|----------|-----------|-----------|--------|
| **Mandatory** | Wajib, tidak bisa dihapus | ❌ | Shalat 5 waktu |
| **Recommended** | Disarankan sistem, bisa dinonaktifkan | ✅ | Tilawah, dzikir, olahraga |
| **Custom** | Dibuat user | ✅ | Task personal apapun |
| **Bonus** | Quest tambahan untuk EXP extra | ✅ | Weekly challenge |

### 2.2 Task Input Types

| Input Type | Unit | Contoh |
|-----------|------|--------|
| `boolean` | — | Shalat (selesai/belum) |
| `count` | reps | Push up 30 reps |
| `distance` | km | Lari 5 km |
| `volume` | ml | Air minum 2000 ml |
| `duration` | menit | Tilawah 15 menit |
| `pages` | halaman | Baca 20 halaman |
| `verses` | ayat | Hafalan 5 ayat |
| `currency` | IDR | Catat pengeluaran |

### 2.3 Mandatory Prayer Rules

```
Rule: Shalat 5 waktu SELALU aktif untuk semua user
- is_system_required = true
- is_deletable = false
- is_active = true (cannot be toggled off)
- Muncul setiap hari di daily quest
- Tidak bisa di-backfill setelah cut-off (23:59 timezone lokal)
```

| Prayer | Task Name | Base EXP |
|--------|-----------|----------|
| Subuh | Shalat Subuh | 20 |
| Dzuhur | Shalat Dzuhur | 20 |
| Ashar | Shalat Ashar | 20 |
| Maghrib | Shalat Maghrib | 20 |
| Isya | Shalat Isya | 20 |

---

## 3. EXP System

### 3.1 EXP Table

| Task | EXP | Pillar |
|------|----:|--------|
| Shalat (per waktu) | 20 | Deen |
| Tilawah harian | 30 | Deen |
| Sedekah harian | 25 | Deen |
| Dzikir pagi | 15 | Deen |
| Dzikir petang | 15 | Deen |
| Shalat Dhuha | 25 | Deen |
| Shalat Tahajud | 50 | Deen |
| Hafalan tambahan | 35 | Deen |
| Membaca buku | 25 | Mind |
| Push up | 20 | Body |
| Pull up | 25 | Body |
| Squat | 20 | Body |
| Lari | 40 | Body |
| Target air minum tercapai | 15 | Body |
| Catat pengeluaran harian | 15 | Wealth |
| Tidak melebihi budget harian | 20 | Wealth |

### 3.2 EXP Calculation Rules

```typescript
function calculateTaskExp(task: UserTask, actualValue: number): number {
  const baseExp = task.baseExp;
  
  // Boolean tasks: full EXP or 0
  if (task.inputType === 'boolean') {
    return actualValue ? baseExp : 0;
  }
  
  // Numeric tasks: proportional EXP (capped at 100%)
  const target = task.target.value;
  const completionRatio = Math.min(actualValue / target, 1.0);
  
  // Minimum 50% completion required for any EXP
  if (completionRatio < 0.5) return 0;
  
  return Math.floor(baseExp * completionRatio);
}
```

---

## 4. Leveling System

### 4.1 Level Formula

```
EXP_to_next_level = 100 + (current_level × 50)
```

### 4.2 Level Milestones

| Level | Total EXP Required | EXP to Next |
|------:|-------------------:|------------:|
| 1 | 0 | 150 |
| 2 | 150 | 200 |
| 3 | 350 | 250 |
| 4 | 600 | 300 |
| 5 | 900 | 350 |
| 10 | 3,250 | 600 |
| 20 | 11,500 | 1,100 |
| 50 | 66,250 | 2,600 |
| 100 | 256,250 | 5,100 |

### 4.3 Level-Up Logic

```typescript
function processLevelUp(stats: UserStats, expGained: number): LevelUpResult {
  let newExp = stats.currentExp + expGained;
  let newLevel = stats.level;
  let newTotalExp = stats.totalExp + expGained;
  let levelsGained = 0;

  while (newExp >= getExpToNext(newLevel)) {
    newExp -= getExpToNext(newLevel);
    newLevel++;
    levelsGained++;
  }

  return {
    level: newLevel,
    currentExp: newExp,
    totalExp: newTotalExp,
    expToNext: getExpToNext(newLevel),
    levelsGained,
    newRank: getRankForLevel(newLevel),
    coinsAwarded: levelsGained > 0 ? levelsGained * 10 : 0,
  };
}

function getExpToNext(level: number): number {
  return 100 + (level * 50);
}
```

---

## 5. Rank System

| Rank | Level Range | Tema |
|------|------------|------|
| **E-Rank** | 1–9 | Awakening |
| **D-Rank** | 10–19 | Discipline Initiate |
| **C-Rank** | 20–34 | Consistency Builder |
| **B-Rank** | 35–49 | Focused Striver |
| **A-Rank** | 50–74 | High Performer |
| **S-Rank** | 75–99 | Elite Disciple |
| **S+ Rank** | 100+ | Master of Discipline |

```typescript
function getRankForLevel(level: number): Rank {
  if (level >= 100) return { name: 'S+', theme: 'Master of Discipline' };
  if (level >= 75) return { name: 'S', theme: 'Elite Disciple' };
  if (level >= 50) return { name: 'A', theme: 'High Performer' };
  if (level >= 35) return { name: 'B', theme: 'Focused Striver' };
  if (level >= 20) return { name: 'C', theme: 'Consistency Builder' };
  if (level >= 10) return { name: 'D', theme: 'Discipline Initiate' };
  return { name: 'E', theme: 'Awakening' };
}
```

---

## 6. Coin System

### 6.1 Coin Sources

| Achievement | Coins |
|------------|------:|
| Complete 5 daily prayers | 10 |
| Complete full daily quest | 25 |
| 3-day streak | 30 |
| 7-day streak | 100 |
| 14-day streak | 250 |
| 30-day streak | 500 |
| Finish weekly fitness challenge | 75 |
| Stay within monthly budget | 150 |
| Reach savings target | 200 |
| Level up | 10 per level |

### 6.2 Coin Usage

Coins digunakan untuk membeli item di Avatar Shop:
- Skins, auras, frames, titles, badges
- Setiap item memiliki harga coin dan unlock level minimum
- Transaksi coin bersifat final (no refund)

---

## 7. Streak System

### 7.1 Daily Streak Rules

```
Rule: Daily streak bertambah jika user menyelesaikan SEMUA mandatory quest dalam 1 hari
- Cut-off: 23:59 di timezone lokal user
- Jika mandatory quest tidak selesai: streak TIDAK bertambah (tapi tidak reset)
- Jika 0 quest selesai dalam 1 hari: streak RESET ke 0
- Jika partial (some mandatory, not all): streak tetap (freeze), tidak bertambah
```

### 7.2 Streak Milestones

| Streak | Reward |
|-------:|--------|
| 3 hari | 30 coins + "Getting Started" badge |
| 7 hari | 100 coins + "One Week Strong" badge |
| 14 hari | 250 coins + "Fortnight Fighter" badge |
| 30 hari | 500 coins + "Monthly Master" badge |
| 60 hari | 1000 coins + "Iron Will" badge |
| 100 hari | 2000 coins + "Century Legend" badge |

---

## 8. Penalty & Recovery System

### 8.1 Penalty Rules

- **Ringan:** Streak tidak bertambah jika mandatory quest tidak selesai
- **Tidak ada penalti EXP negatif** — user tidak kehilangan EXP
- **Tidak ada penalti coin** — user tidak kehilangan coin
- Filosofi: **motivasi, bukan hukuman**

### 8.2 Recovery Quest Trigger

```
Trigger: 2 hari berturut-turut gagal menyelesaikan mandatory quest
Action: Sistem menawarkan recovery quest di hari berikutnya
```

### 8.3 Recovery Quest Options

| Quest | Deskripsi | EXP |
|-------|-----------|----:|
| Refleksi 3 menit | Tulis refleksi singkat tentang hari ini | 10 |
| Rencanakan ulang target | Review dan adjust target besok | 10 |
| Kurangi target fisik | Turunkan target olahraga sementara | 5 |
| Tambah reminder | Setup reminder untuk aktivitas inti | 5 |

Recovery quest memberikan EXP kecil untuk menjaga momentum tanpa memalsukan data ibadah.

---

## 9. Daily Log System

### 9.1 Log Date Rules

```
- Setiap task memiliki status per hari (log_date)
- Status: 'pending' | 'completed' | 'partial' | 'skipped'
- Default status: 'pending' sampai cut-off (23:59 timezone lokal)
- Jika tidak diisi setelah cut-off: otomatis 'skipped'
- Jika tidak diisi > 1 hari: 'skipped' + recovery quest trigger
```

### 9.2 Backfill Rules

```
Rule: Mandatory prayer yang tidak diisi TIDAK BOLEH di-backfill sebagai "completed" 
      setelah cut-off timezone lokal

Exception: Mode "catatan keterlambatan" (late note) yang TIDAK memberikan EXP
           → hanya untuk catatan personal, bukan untuk gamification reward
```

### 9.3 Completion Logic

```typescript
function calculateDailyCompletion(logs: DailyTaskLog[], tasks: UserTask[]): DailyCompletion {
  const mandatory = tasks.filter(t => t.category === 'mandatory');
  const mandatoryCompleted = mandatory.filter(t => 
    logs.find(l => l.taskId === t.id && l.status === 'completed')
  );

  const allTasks = tasks.filter(t => t.isActive);
  const allCompleted = allTasks.filter(t =>
    logs.find(l => l.taskId === t.id && l.status === 'completed')
  );

  return {
    mandatoryRate: mandatoryCompleted.length / mandatory.length,
    overallRate: allCompleted.length / allTasks.length,
    allMandatoryDone: mandatoryCompleted.length === mandatory.length,
    questsCompleted: allCompleted.length,
    totalQuests: allTasks.length,
  };
}
```

---

## 10. Finance Rules

### 10.1 Transaction Rules

- Setiap transaksi harus bertipe `income` atau `expense`
- Setiap transaksi harus memiliki kategori
- Amount harus positif (> 0)
- Tanggal transaksi tidak boleh di masa depan

### 10.2 Default Financial Categories

| Kategori | Type |
|----------|------|
| Makan dan minum | expense |
| Transportasi | expense |
| Pendidikan | expense |
| Ibadah dan sedekah | expense |
| Kesehatan | expense |
| Hiburan | expense |
| Belanja pribadi | expense |
| Kuota dan langganan | expense |
| Tabungan | expense |
| Lainnya | expense |
| Gaji | income |
| Freelance | income |
| Lain-lain (income) | income |

User bisa menambah kategori custom.

### 10.3 Budget Rules

```
- Budget di-set per kategori per bulan
- Alert threshold: warning saat penggunaan mencapai 80% budget
- Over-budget alert: saat penggunaan melebihi 100%
- Budget warning tampil di dashboard sebagai card
- Bahasa warning: netral dan suportif, bukan menghakimi
```

### 10.4 Savings Goal Rules

```
- Savings goal memiliki: nama, target nominal, target date
- Progress dihitung dari total income - total expense (atau manual deposit)
- Tidak ada penalti jika target terlewat
- Pesan: suportif dan encouraging
```

### 10.5 Cashflow Dashboard

```typescript
interface MonthlyCashflow {
  month: string;        // "2026-05"
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;  // income - expense
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    amount: number;
    budgetAmount: number;
    budgetUsage: number; // percentage
  }[];
}
```

---

## 11. Onboarding Personalization

### 11.1 Input Questions

| Step | Question | Options/Input |
|------|----------|---------------|
| 1 | Status | Mahasiswa / Pekerja / Santri / Freelancer / Lainnya |
| 2 | Tujuan utama | Ibadah / Fisik / Belajar / Finansial / Semuanya |
| 3 | Waktu luang harian | 1-2 jam / 2-4 jam / 4+ jam |
| 4 | Target tilawah | 1/2/5/10/custom halaman per hari |
| 5 | Target dzikir | Pagi saja / Petang saja / Keduanya |
| 6 | Dhuha & Tahajud | Ya rutin / Kadang / Belum pernah |
| 7 | Kemampuan fisik | Pemula / Menengah / Lanjutan |
| 8 | Target air minum | 1500 / 2000 / 2500 / 3000 ml |
| 9 | Pencatatan keuangan | Ya aktif / Kadang / Belum pernah |
| 10 | Target tabungan awal | Nominal + target date |

### 11.2 Output Personalization

Berdasarkan jawaban, sistem menghasilkan:

```typescript
interface OnboardingResult {
  dailyQuests: UserTask[];        // Default active tasks
  targets: {
    tilawah: number;              // pages/day
    pushUp: number;               // reps
    squat: number;                // reps
    running: number;              // km
    water: number;                // ml
  };
  financeCategories: string[];    // Active categories
  monthlyBudget: number;          // Initial total budget
  savingsGoal: {
    name: string;
    target: number;
    targetDate: string;
  } | null;
  reminderTimes: string[];        // Suggested reminder times
}
```

---

## 12. Offline Sync Rules

### 12.1 Queue Behavior

```
1. Saat offline, input disimpan ke local queue (IndexedDB)
2. UI menampilkan badge "belum sinkron" pada item yang belum ter-sync
3. Saat online kembali, queue di-replay berurutan berdasarkan client_timestamp
4. Setiap item dalam queue memiliki retry counter (max 5 retries)
```

### 12.2 Conflict Resolution

| Data Type | Strategy |
|-----------|----------|
| Notes/values | Last-write-wins (berdasarkan `client_timestamp`) |
| Completion logs | Immutable setelah tersimpan final |
| Financial transactions | Idempotent berdasarkan `client_id` (UUID generated client-side) |

### 12.3 Sync Failure Handling

```
- Jika sync gagal setelah 5 retries: item ditandai "failed"
- UI menampilkan tombol "Retry" yang jelas
- User bisa melihat daftar item yang gagal sync
- EXP dari task yang gagal sync akan dikalkulasi ulang via background job
```

---

## 13. Achievement System

### 13.1 Achievement Categories

| Category | Contoh Achievement | Coin Reward |
|----------|-------------------|------------:|
| **Streak** | "7-Day Warrior" | 100 |
| **Level** | "Reach Level 10" | 50 |
| **Deen** | "30-Day Prayer Streak" | 200 |
| **Fitness** | "Run 50km Total" | 150 |
| **Finance** | "First Savings Goal Complete" | 200 |
| **Completion** | "100% Daily Quest (7 days)" | 300 |

### 13.2 Achievement Logic

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  condition: AchievementCondition;
  coinReward: number;
  iconUrl: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// Achievement check runs after every quest completion & level up
function checkAchievements(userId: string, stats: UserStats): Achievement[] {
  // Query all unearned achievements
  // Evaluate conditions against current stats
  // Return newly unlocked achievements
}
```

---

## 14. Avatar & Shop Rules

### 14.1 Item Types

| Type | Deskripsi | Contoh |
|------|-----------|--------|
| **Skin** | Avatar skin/outfit | Shadow Cloak, Iron Discipline Armor |
| **Aura** | Visual effect around avatar | Dawn Seeker Aura |
| **Frame** | Profile frame decoration | Fajr Guardian Frame |
| **Title** | Display title | Budget Keeper |
| **Badge** | Profile badge | Qur'an Flame Badge |
| **Accessory** | Avatar accessory | Hydration Crystal |

### 14.2 Purchase Rules

```
1. User must have sufficient coins (coins >= item.price)
2. User must meet level requirement (level >= item.unlockLevel)
3. Each item can only be purchased once
4. Purchase is final (no refund)
5. Purchased items go to inventory
6. User can equip/unequip items freely
7. Only one item per type can be equipped at a time
```

### 14.3 Item Rarity

| Rarity | Color | Price Range | Unlock Level |
|--------|-------|------------|-------------|
| Common | Gray | 50-100 coins | 1-5 |
| Uncommon | Green | 100-300 coins | 5-15 |
| Rare | Blue | 300-700 coins | 15-30 |
| Epic | Purple | 700-1500 coins | 30-50 |
| Legendary | Gold | 1500-5000 coins | 50+ |
