# Design Spec - Level Up Deen

> Dokumen desain produk dan UI system untuk Level Up Deen. File ini menjadi acuan visual, UX, dan implementasi frontend agar aplikasi terasa konsisten, fokus, dan siap dikembangkan bertahap.

---

## 1. Design Objective

Level Up Deen harus terasa seperti **daily command center** untuk membangun disiplin muslim secara bertahap. Pengalaman pertama user tidak boleh terasa seperti landing page panjang, tetapi seperti aplikasi yang langsung membantu mengambil tindakan hari ini.

Tujuan utama desain:

- Membuat user langsung paham progres hari ini.
- Menjadikan shalat wajib sebagai core quest yang jelas dan tidak bisa hilang.
- Menggabungkan Deen, Body, Mind, Wealth, dan Discipline dalam satu alur yang ringan.
- Memberi rasa RPG progression tanpa membuat ibadah terasa seperti kompetisi kosong.
- Menyediakan dashboard yang mobile-first, cepat dipindai, dan nyaman dipakai setiap hari.

---

## 2. Experience Model

## 2.1 Core Experience

Core loop harian:

1. User membuka aplikasi.
2. User melihat status karakter, quest, streak, dan warning penting.
3. User menyelesaikan aktivitas nyata.
4. User melakukan self-check atau input nilai.
5. Sistem memberi EXP, coin, streak update, dan insight.
6. Jika ada pola gagal, sistem memberi recovery quest atau micro-habit.

## 2.2 First Screen Principle

Halaman `/` berfungsi sebagai **Daily Command Center**, bukan halaman marketing.

First viewport harus memuat:

- Nama produk dan konteks hari ini.
- Progress daily quest.
- Progress shalat wajib.
- Level, rank, EXP, coin.
- Avatar state.
- Akses cepat ke modul utama.

User tidak perlu scroll jauh untuk tahu apa yang harus dikerjakan.

---

## 3. Design Personality

## 3.1 Visual Direction

Tema visual: **disciplined dark fantasy with warm spiritual discipline**.

Karakter visual:

- Gelap, fokus, dan tenang.
- Aksen emas untuk reward, level, dan prioritas.
- Aksen hijau untuk progres, recovery, dan rasa aman.
- Tekstur grid halus untuk rasa dashboard dan sistem.
- Tidak horor, tidak mistis berlebihan, dan tidak menyeramkan.

## 3.2 Product Tone

Nada teks harus:

- Supportive.
- Tidak menghakimi.
- Ringkas.
- Mengarah ke aksi kecil.
- Tidak mengklaim nilai ibadah user.

Contoh:

- Baik: "Bangun ritme hari ini, satu quest kecil pada satu waktu."
- Baik: "Target mikro hari ini: satu sesi pendek setelah Subuh."
- Hindari: "Kamu gagal menjaga ibadah."
- Hindari: "Rank ini membuktikan kualitas ibadahmu."

---

## 4. User Personas and UX Needs

## 4.1 Pelajar yang Sibuk

Kebutuhan desain:

- Checklist cepat.
- Quest ringan.
- Progress yang mudah dibaca.
- Reminder shalat dan air minum.
- Mobile-first karena sering akses dari HP.

## 4.2 Pekerja Kantoran

Kebutuhan desain:

- Dashboard padat tapi rapi.
- Finance warning yang jelas.
- Akses cepat ke budget dan savings goal.
- Ringkasan mingguan.

## 4.3 Muslim Produktif Mandiri

Kebutuhan desain:

- Custom quest yang fleksibel.
- Progress avatar dan achievement terasa menarik.
- Tampilan lebih game-like tetapi tetap matang.

---

## 5. Information Architecture

## 5.1 Public Routes

| Route | Fungsi | Design Goal |
|---|---|---|
| `/` | Daily Command Center preview | Menampilkan pengalaman inti aplikasi |
| `/login` | Login user | Cepat, jelas, minim distraksi |
| `/register` | Registrasi user | Sederhana dan trust-building |
| `/sign-in` | Auth route tambahan | Konsisten dengan login |
| `/sign-up` | Auth route tambahan | Konsisten dengan register |
| `/ai-coach` | AI Coach public/preview | Menampilkan konsep AI assistant |

## 5.2 App Routes

| Route | Fungsi | Design Goal |
|---|---|---|
| `/dashboard` | Dashboard personal | Ringkasan progres user login |
| `/quests` | Daily quest | Checklist dan input task harian |
| `/deen` | Deen tracker | Fokus shalat wajib dan sunnah |
| `/fitness` | Fitness tracker | Target fisik adaptif |
| `/water` | Water tracker | Quick add hidrasi |
| `/finance` | Finance tracker | Input transaksi cepat |
| `/planning` | Budget dan savings goal | Kontrol keuangan bulanan |
| `/avatar` | Avatar shop | Reward visual dan ownership |
| `/achievements` | Achievement | Milestone dan badge |
| `/history` | Activity history | Riwayat quest dan progres |
| `/settings` | Settings | Preferensi, target, export data |
| `/squad` | Social lite | Dukungan kecil dan privacy-first |
| `/access-control` | Role management | Admin permission clarity |
| `/admin` | Admin console | Master data dan system config |

---

## 6. Visual System

## 6.1 Current Design Tokens

Token yang sudah dipakai di `src/app/globals.css`:

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0d100d` | Page background |
| `--bg-soft` | `#171b16` | Secondary surfaces |
| `--bg-card` | `#1d231b` | Card surface |
| `--text` | `#edf3ea` | Main text |
| `--text-dim` | `#a7b2a0` | Muted text |
| `--line` | `#33402f` | Border |
| `--brand` | `#d8b45f` | Primary CTA and EXP |
| `--brand-strong` | `#eccb7a` | Hover/active brand |
| `--danger` | `#f27579` | Skipped, risk, warning |
| `--success` | `#58d39d` | Completed, healthy progress |

## 6.2 Color Usage

Primary usage:

- Gold: CTA, EXP, coin, rank, important affordance.
- Green: completed state, safe progress, positive recovery.
- Rose/red: skipped state, financial risk, sync error.
- Cyan: fitness/body accent.
- Amber: pending state, reminder, warning.

Rules:

- Do not make the entire UI one hue.
- Use gold sparingly so rewards feel meaningful.
- Finance warning should be visible but not alarming unless budget is exceeded.
- Prayer task states must be readable and calm.

## 6.3 Background

Current background uses:

- Subtle diagonal gradients.
- Repeating grid lines.
- Dark base color.

Rules:

- Do not add floating decorative blobs.
- Do not use heavy blur effects behind important text.
- Keep background texture subtle so dashboard remains readable.

---

## 7. Typography

Current font:

- Geist Sans via local font.
- Geist Mono for code/technical labels.

Typography rules:

- Page title: `text-3xl` to `text-5xl` only for first screen hero/command center.
- Dashboard card heading: `text-xl` or smaller.
- Section heading: use `.section-title`.
- Labels: uppercase small text with normal letter spacing.
- Do not scale font size using viewport width.
- Avoid negative letter spacing.

Copy style:

- Short, useful, and action-oriented.
- Use Indonesian as default.
- English terms are acceptable for product concepts like EXP, Rank, Quest, Coin.

---

## 8. Layout System

## 8.1 Container

Use `.container-shell`:

```css
max-width: 80rem;
padding-inline: 1rem on mobile;
padding-inline: 1.5rem on small screens and above;
```

## 8.2 Cards

Use `Card` only for:

- Individual dashboard panels.
- Repeated items.
- Forms.
- Data summaries.
- Modal-like sections.

Rules:

- Card radius: 8px.
- Avoid cards inside cards unless the inner element is a small repeated row.
- Page sections should be full-width bands or normal constrained layouts.
- Important numeric cards must have clear label, value, and optional progress bar.

## 8.3 Grid

Recommended grids:

- Mobile: 1 column.
- Tablet: 2 columns.
- Desktop: 2 to 4 columns depending on density.
- Command center desktop: `xl:grid-cols-[1.2fr_0.8fr]`.
- Main content + aside: `xl:grid-cols-[1fr_360px]`.

## 8.4 Spacing

Recommended rhythm:

- Page section vertical padding: `py-6`.
- Card padding: `p-4` for compact, `p-5` for standard, `p-6` for page headers.
- Grid gap: `gap-3` for compact metrics, `gap-6` for major sections.

---

## 9. Components

## 9.1 Progress Bar

Used for:

- EXP progress.
- Daily quest completion.
- Prayer completion.
- Budget usage.
- Fitness/water goals.

Rules:

- Clamp value from 0 to 100.
- Display numeric label near the bar when the metric matters.
- For budget: use warning color if >80%, danger if >100%.

## 9.2 Status Badge

States:

| State | Visual |
|---|---|
| `completed` | Green border + soft green background |
| `pending` | Amber border + soft amber background |
| `skipped` | Rose border + soft rose background |
| `unsynced` | Amber badge with sync label |
| `locked` | Muted border and dim text |

## 9.3 Navigation Button

Rules:

- Use compact rectangular buttons with 8px radius.
- Primary action uses `bg-brand`.
- Secondary action uses border + muted text.
- Link labels must be short: Dashboard, Quest, Finance, Avatar.

## 9.4 Metric Card

Required content:

- Label.
- Main value.
- Optional context text.
- Optional progress bar.

Example:

```tsx
<Card className="p-4">
  <p className="text-xs uppercase tracking-wide text-text-dim">Daily Quest</p>
  <p className="mt-2 text-2xl font-semibold">6/10</p>
  <ProgressBar value={60} />
</Card>
```

## 9.5 Quest Row

Required content:

- Quest name.
- Category and reward.
- Status badge.
- Optional target value.

Rules:

- Mandatory prayer quest must be visually stable and cannot show delete affordance.
- Custom quest may show edit/deactivate action in future implementation.

---

## 10. Page Design Specs

## 10.1 Daily Command Center (`/`)

Purpose:

- Preview and operate the core product loop.

Must include:

- Header with product name and quick links.
- Daily quest progress.
- Prayer progress.
- Rank, level, EXP, coin.
- Avatar state.
- Quest list preview.
- AI insight panel.
- Finance signal panel.
- Pillar progress.
- Recent transactions.

Interaction direction:

- CTA to `/quests` for daily task action.
- CTA to `/ai-coach` for motivation/recovery.
- CTA to `/finance` for transaction input.

## 10.2 Dashboard (`/dashboard`)

Purpose:

- Authenticated daily overview.

Must include:

- Greeting.
- User profile context.
- EXP bar.
- Quest completion.
- Prayer streak.
- Full quest streak.
- Budget warning.
- Savings goal.

## 10.3 Daily Quest (`/quests`)

Purpose:

- Core checklist and completion surface.

Must include:

- Mandatory section.
- Recommended section.
- Custom section.
- Bonus section.
- EXP and coin reward display.
- Self-check controls.
- Numeric input for value-based quests.

Future interaction:

- Complete button per quest.
- Complete eligible tasks.
- Undo within short grace period.

## 10.4 Deen Tracker (`/deen`)

Purpose:

- Spiritual habit tracking with careful product ethics.

Must include:

- Shalat 5 waktu checklist.
- Tilawah progress.
- Sunnah task list.
- Prayer streak.
- Ethical note that app points are motivation, not worship value.

## 10.5 Finance (`/finance` and `/planning`)

Purpose:

- Fast daily transaction logging and budget awareness.

Must include:

- Transaction list.
- Natural language input preview for AI v1.1.
- Category and amount confirmation.
- Budget progress.
- Savings goal forecast.

Finance tone:

- Avoid shame language.
- Use "warning" as helpful signal, not punishment.

## 10.6 Avatar (`/avatar`)

Purpose:

- Reward loop and identity.

Must include:

- Avatar state.
- Equipped items.
- Item grid.
- Rarity.
- Unlock level.
- Coin price.
- Owned/equipped state.

Visual rule:

- Avatar progression is cosmetic and should not imply religious status.

## 10.7 AI Coach (`/ai-coach`)

Purpose:

- Motivational and practical assistant.

Must include:

- Clear non-fatwa disclaimer.
- Intent cards or chat entry.
- Recovery suggestions.
- Time management prompts.
- Finance discipline prompts.

Rules:

- AI should never judge worship quality.
- User must confirm AI recommendations before changing targets.

## 10.8 Squad (`/squad`)

Purpose:

- Social retention lite.

Must include:

- Mini leaderboard based on general completion score.
- Privacy rules.
- Opt-in behavior.
- No finance data.
- No detailed prayer timing.

---

## 11. Responsive Rules

Mobile:

- One-column layout.
- Header wraps cleanly.
- Quick links wrap into multiple rows.
- Quest rows show status below/right without overlap.
- Main number cards use `text-2xl`, not oversized hero text.

Tablet:

- Two-column cards.
- Maintain readable line length.
- Keep navigation accessible.

Desktop:

- Use main content + right aside when useful.
- Avoid overly wide text blocks.
- Keep repeated cards compact.

Minimum target:

- Supports 360px width.
- Buttons and touch targets should be at least 44px high when interactive.

---

## 12. Accessibility

Requirements:

- Text contrast must be readable on dark surfaces.
- Interactive elements must have focus styles.
- Status must not rely on color alone; include text labels.
- Forms must use labels.
- Progress bars should have accessible labels when interactive or data-critical.
- Do not hide critical warning only in hover states.

Keyboard:

- User should navigate primary pages and buttons with keyboard.
- Modal/future dialogs must trap focus.

Screen reader:

- Use semantic headings in order.
- Use `button` for actions and `a`/`Link` for navigation.

---

## 13. Motion and Feedback

Motion style:

- Subtle.
- Functional.
- No excessive decorative animation.

Allowed:

- Progress bar transition.
- Hover border change.
- Level-up celebration in short burst.
- Toast for sync success/error.

Avoid:

- Continuous distracting animation on dashboard.
- Motion that hides data.
- Large layout shifts.

---

## 14. Empty, Loading, and Error States

## 14.1 Empty States

Examples:

- No transactions: show input CTA.
- No custom tasks: show "Tambah custom quest".
- No savings goal: show create goal prompt.
- No inventory items: show first unlock path.

## 14.2 Loading States

Use:

- Skeleton card for dashboard metrics.
- Spinner only for short actions.
- Preserve layout height to prevent jumps.

## 14.3 Error States

Examples:

- Sync failed: "Belum sinkron. Coba lagi."
- AI timeout: "Rekomendasi rule-based tersedia sementara."
- Finance parse uncertain: ask user to confirm amount/category.

Rules:

- Error copy must be specific.
- Always give next action.
- Do not blame user.

---

## 15. Offline and PWA UX

Offline behavior:

- Quest checklist and transaction input can be queued.
- UI shows `unsynced` state.
- When online returns, replay queue.
- If conflict occurs, show sync result.

PWA install:

- Install prompt should appear after user completes a meaningful action.
- Do not show install prompt immediately on first visit.

Offline page:

- `public/offline.html` should match dark theme.
- Include simple message and retry action.

---

## 16. AI Design Guardrails

AI features:

- AI Deen & Life Coach.
- Smart Quest Personalization.
- AI Finance Categorization.
- Intelligent Goal Forecasting.
- Dynamic Avatar Evolution in later phase.

Design rules:

- AI is assistant, not authority.
- AI suggestions must be editable.
- Sensitive changes need confirmation.
- Finance parse must show review before save.
- AI content should be logged safely with minimal personal data.

Copy rules:

- Use "saran", "rekomendasi", "target mikro".
- Avoid "fatwa", "nilai ibadah", or religious ranking claims.

---

## 17. Privacy by Design

Sensitive data:

- Finance transactions.
- Prayer logs.
- User profile.
- AI conversations.

UI rules:

- Finance data never appears in social leaderboard.
- Detailed prayer timing never appears in squad view.
- Social features default to opt-in.
- Export and delete account must be discoverable in settings.

Admin UI:

- Admin sees system configuration and role tools.
- Admin should not browse personal user finance data.

---

## 18. Implementation Mapping

Current implementation files:

| Design Area | File |
|---|---|
| Global theme | `src/app/globals.css` |
| Public command center | `src/app/page.tsx` |
| App dashboard | `src/app/(app)/dashboard/page.tsx` |
| Quest page | `src/app/(app)/quests/page.tsx` |
| Deen page | `src/app/(app)/deen/page.tsx` |
| Finance page | `src/app/(app)/finance/page.tsx` |
| Planning page | `src/app/(app)/planning/page.tsx` |
| Avatar page | `src/app/(app)/avatar/page.tsx` |
| Squad page | `src/app/(app)/squad/page.tsx` |
| Card component | `src/components/ui/card.tsx` |
| Progress bar | `src/components/ui/progress-bar.tsx` |
| Mock data | `src/lib/mock-data.ts` |
| Business logic | `src/lib/gamification.ts` |
| AI finance helper | `src/lib/finance-ai.ts` |

---

## 19. Design QA Checklist

Before shipping UI changes:

- Page works at 360px mobile width.
- No text overlaps or escapes buttons/cards.
- Main workflow is visible above the fold.
- Interactive targets are easy to tap.
- Status is clear without relying on color alone.
- Finance data is not exposed in social surfaces.
- Prayer gamification copy follows ethical guardrails.
- Loading, empty, and error states exist for user-facing modules.
- `npm run lint`, `npm run typecheck`, and `npm run build` pass.

---

## 20. Future Design Improvements

Next design work:

- Add a real interactive quest completion component.
- Add forms for finance transaction input and confirmation.
- Add responsive bottom navigation for mobile app shell.
- Add achievement detail screen.
- Add level-up modal with short animation.
- Add avatar preview asset system.
- Add theme preview in settings.
- Add AI chat interface with confirmation flows.

