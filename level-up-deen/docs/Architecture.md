# Architecture — Level Up Deen

> System architecture, design patterns, dan keputusan teknis Level Up Deen.

---

## 1. Architecture Overview

Level Up Deen menggunakan arsitektur **berlapis (layered architecture)** yang dibangun di atas Next.js 14 App Router, Clerk sebagai auth/authorization provider, dan Supabase sebagai Backend-as-a-Service untuk persistence.

### High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        UI["React Components<br/>(shadcn/ui + Tailwind)"]
        Hooks["Custom React Hooks"]
        Store["Client State<br/>(React Context / Zustand)"]
        SW["Manifest + Cleanup SW<br/>(Caching Disabled)"]
    end

    subgraph NextJS["Next.js 14 Server"]
        RSC["React Server Components"]
        SA["Server Actions"]
        API["API Routes"]
        Guard["Server Guards<br/>(Clerk Session Verification)"]
    end

    subgraph Supabase["Supabase Platform"]
        Auth["Clerk Auth<br/>(Session + OAuth)"]
        DB["PostgreSQL<br/>(RLS Enabled)"]
        EF["Edge Functions"]
        Storage["Supabase Storage<br/>(Avatars, Assets)"]
        RT["Supabase Realtime"]
    end

    subgraph AI["AI Layer (v1.1)"]
        GW["AI Gateway"]
        Policy["Policy Layer<br/>(Guardrail + Moderation)"]
        LLM["LLM Provider<br/>(OpenAI / Anthropic)"]
    end

    subgraph Infra["Infrastructure"]
        Vercel["Vercel<br/>(CDN + Serverless)"]
        Analytics["Event Tracking"]
    end

    UI --> Hooks
    Hooks --> Store
    UI --> RSC
    RSC --> SA
    SA --> DB
    SA --> Auth
    API --> DB
    API --> EF
    Guard --> Auth
    SW --> API
    EF --> GW
    GW --> Policy
    Policy --> LLM
    NextJS --> Vercel
    UI --> Analytics
```

---

## 2. Layer Breakdown

### 2.1 Client Layer

**Tanggung jawab:**
- Rendering UI (mobile-first, responsive)
- Client-side state management
- Online-first user interactions
- Future offline data queue & sync
- Future push notification handling

**Komponen utama:**

| Module | Teknologi | Deskripsi |
|--------|-----------|-----------|
| UI Components | React 18 + shadcn/ui | Modular, accessible component library |
| Styling | Tailwind CSS 3.4 | Utility-first, custom dark fantasy theme |
| State | React Context + Zustand | Lightweight state untuk session & UI |
| Forms | React Hook Form + Zod | Validated form handling |
| Charts | Recharts | Visualisasi progress & finance |
| PWA | Manifest + cleanup service worker | Install metadata retained; caching disabled |
| Sync | Future Queue Manager | Offline queue is backlog scope |

**Future Offline Architecture:**

```mermaid
graph LR
    subgraph Online
        A["User Action"] --> B["API Call"]
        B --> C["Supabase DB"]
    end

    subgraph Offline
        D["User Action"] --> E["Local Queue<br/>(IndexedDB)"]
        E -->|"Connection Restored"| F["Sync Manager"]
        F -->|"Replay Queue"| C
    end

    G["Network Status API"] -->|"Online"| Online
    G -->|"Offline"| Offline
```

### 2.2 Server Layer (Next.js 14)

**Tanggung jawab:**
- Server-side rendering & data fetching
- Server-side auth guards in layouts and API routes
- Server Actions untuk data mutations
- API routes untuk complex operations

**Routing Structure:**

```
src/app/
├── page.tsx                    # Public command center
├── login/page.tsx              # Public login page
├── register/page.tsx           # Public registration page
├── sign-in/[[...sign-in]]      # Clerk sign-in catch-all
├── sign-up/[[...sign-up]]      # Clerk sign-up catch-all
├── onboarding/page.tsx         # Onboarding outside app shell
├── (app)/                      # Protected app routes
│   ├── layout.tsx              # Auth/profile guard + shell
│   ├── dashboard/page.tsx
│   ├── quests/page.tsx
│   ├── deen/page.tsx
│   ├── fitness/page.tsx
│   ├── water/page.tsx
│   ├── finance/page.tsx
│   ├── planning/page.tsx
│   ├── avatar/page.tsx
│   ├── ai-coach/page.tsx
│   ├── squad/page.tsx
│   ├── history/page.tsx
│   ├── achievements/page.tsx
│   ├── settings/page.tsx
│   └── admin/
└── api/
    ├── health/route.ts
    ├── onboarding/route.ts
    ├── tasks/route.ts
    ├── tasks/complete/route.ts
    ├── finance/transactions/route.ts
    ├── planning/budgets/route.ts
    ├── planning/savings-goals/route.ts
    ├── settings/
    ├── admin/users/route.ts
    └── ai/
```

**Server Guard Flow:**

```mermaid
sequenceDiagram
    participant Browser
    participant Layout as App Layout / API Route
    participant Auth as src/lib/auth.ts
    participant Clerk as Clerk Backend
    participant Page as Server Component

    Browser->>Layout: Request protected page/API
    Layout->>Auth: getCurrentUserId()
    Auth->>Clerk: verify Clerk session cookie
    alt Authenticated
        Clerk-->>Auth: userId
        alt Onboarding Complete
            Layout->>Page: Render protected content
        else Onboarding Incomplete
            Layout-->>Browser: Redirect to /onboarding
        end
    else Not Authenticated
        Auth-->>Layout: null
        Layout-->>Browser: Redirect to /login or return 401
    end
```

### 2.3 Data Layer (Supabase)

**Tanggung jawab:**
- Persistent data storage (PostgreSQL)
- User-scoped persistence for Clerk-authenticated users
- Row Level Security (RLS)
- File storage (avatars, assets)
- Realtime subscriptions

**Database Schema Overview:**

```mermaid
erDiagram
    users_profile ||--|| user_stats : has
    users_profile ||--o{ user_tasks : owns
    task_templates ||--o{ user_tasks : seeds
    user_tasks ||--o{ daily_task_logs : logs
    users_profile ||--o{ water_logs : tracks
    users_profile ||--o{ financial_transactions : records
    financial_categories ||--o{ financial_transactions : groups
    users_profile ||--o{ budgets : plans
    financial_categories ||--o{ budgets : scoped_by
    users_profile ||--o{ savings_goals : defines
    users_profile ||--o{ user_inventory : owns
    items ||--o{ user_inventory : unlocks
    achievements ||--o{ user_achievements : grants
    users_profile ||--o{ user_achievements : earns
    users_profile ||--o{ recovery_quest_logs : attempts

    users_profile {
        text id PK
        string username UK
        string display_name
        string timezone
        string avatar_url
        boolean onboarding_completed
        timestamp created_at
    }

    user_stats {
        uuid id PK
        text user_id FK
        integer level
        string rank
        integer total_exp
        integer current_exp
        integer exp_to_next
        integer coins
        integer daily_streak
        integer weekly_streak
        integer best_streak
        date last_active_date
        timestamp updated_at
    }

    task_templates {
        uuid id PK
        string name
        string category
        string pillar
        string input_type
        string unit
        integer base_exp
        boolean is_system_required
        boolean is_deletable
        jsonb default_target
    }

    user_tasks {
        uuid id PK
        text user_id FK
        uuid template_id FK
        string custom_name
        string category
        string pillar
        jsonb target
        boolean is_active
        jsonb schedule
        boolean is_deletable
    }

    daily_task_logs {
        uuid id PK
        text user_id FK
        uuid task_id FK
        date log_date
        string status
        jsonb actual_value
        integer exp_earned
        integer coins_earned
        timestamp completed_at
    }
```

### 2.4 AI Layer (v1.1+)

**Tanggung jawab:**
- Contextual coaching & motivation
- Smart quest recommendation
- Natural language finance parsing
- Goal forecasting

**AI Request Flow:**

```mermaid
sequenceDiagram
    participant User
    participant App as Next.js Server
    participant GW as AI Gateway
    participant PL as Policy Layer
    participant LLM as LLM Provider
    participant FB as Fallback Engine

    User->>App: AI Request
    App->>App: Build context<br/>(user stats, 7d/30d metrics)
    App->>GW: Forward with context
    GW->>PL: Apply guardrails<br/>(Islamic moderation)
    PL->>LLM: Sanitized prompt
    
    alt LLM Success
        LLM-->>PL: Raw response
        PL->>PL: Output validation
        PL-->>GW: Validated response
        GW-->>App: AI response + metadata
        App-->>User: Display with disclaimer
    else LLM Timeout/Error
        LLM-->>GW: Error
        GW->>FB: Trigger fallback
        FB-->>App: Rule-based response
        App-->>User: Fallback UX
    end

    App->>App: Log to ai_conversations
```

---

## 3. Design Patterns

### 3.1 Server Components First

Gunakan React Server Components (RSC) sebagai default. Client Components hanya untuk:
- Interaktivitas (event handlers, forms)
- Browser APIs (localStorage, geolocation)
- Real-time subscriptions
- State yang berubah (hooks)

```
"use client" → Hanya jika PERLU interaktivitas
default     → Server Component (data fetching, rendering)
```

### 3.2 Server Actions Pattern

Data mutations menggunakan Server Actions, bukan API routes:

```typescript
// src/app/(dashboard)/quest/actions.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeTask(taskId: string, actualValue: number) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Unauthorized')

  // 1. Insert daily log
  await supabase.from('daily_task_logs').insert({
    user_id: user.id,
    task_id: taskId,
    log_date: new Date().toISOString().split('T')[0],
    status: 'completed',
    actual_value: { value: actualValue },
  })

  // 2. Calculate & award EXP
  const expResult = await calculateExpReward(taskId, actualValue)
  
  // 3. Update user stats
  await updateUserStats(user.id, expResult)

  revalidatePath('/dashboard')
  revalidatePath('/quest')
}
```

### 3.3 Supabase Client Pattern

**Server-side client** (Server Components & Server Actions):

```typescript
// src/lib/supabase/server.ts
import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerClient() {
  const cookieStore = cookies()
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set({ name, value, ...options }),
        remove: (name, options) => cookieStore.set({ name, value: '', ...options }),
      },
    }
  )
}
```

**Client-side client** (Client Components):

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
```

### 3.4 Offline-First Sync Pattern

```mermaid
stateDiagram-v2
    [*] --> Online
    Online --> Offline: Connection Lost
    Offline --> Syncing: Connection Restored
    Syncing --> Online: Queue Empty
    Syncing --> ConflictResolution: Conflict Detected
    ConflictResolution --> Syncing: Resolved

    state Online {
        [*] --> DirectWrite
        DirectWrite --> ServerConfirm
    }

    state Offline {
        [*] --> LocalQueue
        LocalQueue --> IndexedDB
        note right of IndexedDB: Badge "belum sinkron"
    }

    state Syncing {
        [*] --> ReplayQueue
        ReplayQueue --> ValidateTimestamp
        ValidateTimestamp --> ServerWrite
    }
```

**Conflict Resolution Rules:**
- **Notes/Values:** Last-write-wins berdasarkan `client_timestamp`
- **Completion logs:** Immutable setelah tersimpan final
- **Financial transactions:** Idempotent berdasarkan `client_id`

### 3.5 Gamification Engine Pattern

```mermaid
graph TD
    A["Task Completed"] --> B["Calculate Base EXP"]
    B --> C{"Multiplier Active?"}
    C -->|Yes| D["Apply Multiplier"]
    C -->|No| E["Base EXP"]
    D --> F["Update user_stats.total_exp"]
    E --> F
    F --> G{"EXP >= exp_to_next?"}
    G -->|Yes| H["Level Up!"]
    G -->|No| I["Update Progress Bar"]
    H --> J{"New Rank?"}
    J -->|Yes| K["Update Rank"]
    J -->|No| L["Increment Level"]
    K --> M["Check Achievements"]
    L --> M
    M --> N{"Achievement Unlocked?"}
    N -->|Yes| O["Award Achievement + Coins"]
    N -->|No| P["Update Streak"]
    O --> P
    P --> Q["Emit Real-time Event"]
```

---

## 4. Data Flow

### 4.1 Daily Quest Completion Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React Component
    participant SA as Server Action
    participant DB as Supabase DB
    participant GE as Gamification Engine
    participant RT as Realtime

    U->>UI: Tap "Complete Task"
    UI->>UI: Optimistic UI update
    UI->>SA: completeTask(taskId, value)
    SA->>DB: INSERT daily_task_logs
    SA->>GE: calculateReward(task, value)
    GE->>GE: Compute EXP + Coins
    GE->>DB: UPDATE user_stats
    GE->>GE: Check level-up
    GE->>GE: Check achievements
    GE->>DB: INSERT user_achievements (if any)
    SA->>DB: UPDATE streak counters
    DB-->>RT: Broadcast stats change
    RT-->>UI: Real-time update
    UI->>UI: Show EXP animation
    UI->>UI: Show level-up toast (if any)
```

### 4.2 Finance Transaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as Finance Page
    participant SA as Server Action
    participant DB as Supabase DB

    U->>UI: Input transaction
    UI->>UI: Validate with Zod
    UI->>SA: addTransaction(data)
    SA->>DB: INSERT financial_transactions
    SA->>DB: SELECT budget for category
    
    alt Over Budget Threshold
        DB-->>SA: Budget exceeded
        SA-->>UI: Warning flag
        UI->>UI: Show budget warning card
    end

    SA->>DB: SELECT savings_goals
    SA->>DB: UPDATE savings progress
    SA-->>UI: Updated cashflow data
    UI->>UI: Refresh dashboard cards
```

---

## 5. Performance Strategy

### 5.1 Target Metrics

| Metric | Target | Strategy |
|--------|--------|----------|
| Time to Interactive | ≤ 3s (4G) | SSR + code splitting |
| First Contentful Paint | ≤ 1.5s | Server Components + streaming |
| P95 API Latency | ≤ 800ms | Edge functions + DB indexes |
| Availability | ≥ 99.5% | Vercel + Supabase SLA |

### 5.2 Optimization Techniques

| Technique | Implementation |
|-----------|---------------|
| **Code Splitting** | Next.js automatic per-route splitting |
| **Image Optimization** | `next/image` with WebP, lazy loading |
| **Static Generation** | ISR for landing page, shop catalog |
| **Database Indexing** | Composite indexes on `(user_id, log_date)` |
| **Connection Pooling** | Supabase built-in PgBouncer |
| **Caching** | React `cache()` + `unstable_cache` for computed stats |
| **Bundle Analysis** | `@next/bundle-analyzer` untuk monitoring |

---

## 6. Monitoring & Observability

### 6.1 Event Tracking

Semua event berikut wajib di-track:

```typescript
// Event taxonomy
type AppEvent =
  | 'onboarding_completed'
  | 'quest_completed'
  | 'streak_updated'
  | 'level_up'
  | 'rank_up'
  | 'transaction_logged'
  | 'budget_warning_shown'
  | 'item_purchased'
  | 'achievement_unlocked'
  | 'sync_completed'
  | 'sync_conflict'
  | 'ai_chat_sent'          // v1.1
  | 'ai_recommendation_accepted' // v1.1
```

### 6.2 Error Monitoring

| Category | Tool | Alert Threshold |
|----------|------|-----------------|
| Client Errors | Vercel Analytics / Sentry | > 5 errors/min |
| Server Errors | Vercel Logs | 5xx > 1% |
| Auth Failures | Supabase Dashboard | Spike detection |
| Sync Failures | Custom logging | > 3 retries |
| AI Errors | AI Gateway logs | Timeout > 10% |

---

## 7. Scalability Considerations

### Current (MVP)

- **Users:** < 1,000 concurrent
- **Database:** Single Supabase instance (Free/Pro tier)
- **Deployment:** Vercel Hobby/Pro

### Future Scaling Path

| Scale Point | Action |
|-------------|--------|
| > 5K DAU | Supabase Pro + read replicas |
| > 20K DAU | Vercel Pro + edge caching |
| > 50K DAU | Supabase Enterprise + CDN for assets |
| > 100K DAU | Consider dedicated infra + microservices |

---

## 8. Directory Conventions

```
src/
├── app/                    # Routes & pages (Next.js App Router)
│   ├── (group)/           # Route groups (no URL impact)
│   │   ├── page.tsx       # Page component
│   │   ├── layout.tsx     # Layout for group
│   │   ├── loading.tsx    # Loading UI
│   │   ├── error.tsx      # Error boundary
│   │   └── actions.ts     # Server Actions
├── components/             # React components
│   ├── ui/                # Atomic design primitives
│   ├── [feature]/         # Feature-specific components
│   └── layout/            # Shell, navigation, sidebar
├── lib/                   # Business logic & utilities
│   ├── supabase/          # Database clients
│   ├── gamification/      # Game engine logic
│   └── validators/        # Zod schemas
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript interfaces/types
├── constants/             # Static configuration values
└── stores/                # Client-side state stores
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `QuestCard.tsx` |
| Hooks | camelCase with `use` prefix | `useGameStats.ts` |
| Utilities | camelCase | `calculateExp.ts` |
| Types | PascalCase | `UserProfile.ts` |
| Constants | SCREAMING_SNAKE_CASE | `EXP_TABLE.ts` |
| Server Actions | camelCase | `completeTask.ts` |
| CSS Classes | kebab-case (Tailwind) | `dark-fantasy-card` |
