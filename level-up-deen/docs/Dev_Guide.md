# Developer Guide — Level Up Deen

> Panduan pengembangan, coding standards, dan workflow untuk kontributor Level Up Deen.

---

## 1. Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | >= 18.17 | Runtime |
| npm | >= 9.x | Package manager |
| Git | Latest | Version control |
| Supabase CLI | Latest | Local DB development |
| VS Code | Latest | Recommended IDE |

### Recommended VS Code Extensions

- ESLint, Prettier, Tailwind CSS IntelliSense, Prisma (for SQL), Error Lens

---

## 2. Project Setup

```bash
git clone https://github.com/your-org/level-up-deen.git
cd level-up-deen
npm install
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
supabase start        # Start local Supabase
supabase db push      # Run migrations
npm run dev           # Start dev server at localhost:3000
```

---

## 3. Project Structure

```
src/
├── app/                    # Next.js App Router (pages & layouts)
│   ├── (auth)/            # Auth group routes
│   ├── (onboarding)/      # Onboarding flow
│   ├── (dashboard)/       # Protected routes
│   └── api/               # API routes
├── components/             # React components
│   ├── ui/                # shadcn/ui primitives
│   └── [feature]/         # Feature-specific components
├── lib/                   # Business logic & utilities
│   ├── supabase/          # DB clients (server.ts, client.ts)
│   ├── gamification/      # EXP, level, rank, streak calculations
│   ├── finance/           # Budget, cashflow utilities
│   ├── sync/              # Offline queue manager
│   └── validators/        # Zod schemas
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript interfaces
├── constants/             # Static config (EXP tables, ranks, categories)
└── stores/                # Client state (Zustand/Context)
```

---

## 4. Coding Standards

### 4.1 TypeScript Rules

- **Strict mode** enabled — no `any` types allowed
- Use `interface` for object shapes, `type` for unions/intersections
- All function parameters and return types must be typed
- Use Zod for runtime validation at API boundaries

### 4.2 Component Patterns

```typescript
// ✅ Server Component (default) — for data fetching
// src/app/(dashboard)/quest/page.tsx
import { createServerClient } from '@/lib/supabase/server'

export default async function QuestPage() {
  const supabase = createServerClient()
  const { data: quests } = await supabase.from('user_tasks').select('*')
  return <QuestList quests={quests} />
}

// ✅ Client Component — only when interactivity needed
// src/components/quest/QuestCheckbox.tsx
'use client'
import { useState } from 'react'

export function QuestCheckbox({ taskId }: { taskId: string }) {
  const [checked, setChecked] = useState(false)
  // ...
}
```

### 4.3 Server Actions Pattern

```typescript
// src/app/(dashboard)/quest/actions.ts
'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { completeTaskSchema } from '@/lib/validators/quest'

export async function completeTask(formData: FormData) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const parsed = completeTaskSchema.safeParse({
    taskId: formData.get('taskId'),
    value: formData.get('value'),
  })
  if (!parsed.success) throw new Error('Invalid input')

  // ... business logic
  revalidatePath('/dashboard')
}
```

### 4.4 Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `QuestCard.tsx` |
| Hooks | `use` prefix | `useGameStats.ts` |
| Utilities | camelCase | `calculateExp.ts` |
| Types/Interfaces | PascalCase | `UserProfile.ts` |
| Constants | SCREAMING_SNAKE | `EXP_TABLE.ts` |
| Files | kebab-case (pages) | `finance-plan/page.tsx` |
| DB columns | snake_case | `user_id`, `log_date` |

### 4.5 Import Order

```typescript
// 1. React/Next.js
import { useState } from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries
import { z } from 'zod'

// 3. Internal libs
import { createServerClient } from '@/lib/supabase/server'
import { calculateExp } from '@/lib/gamification/exp'

// 4. Components
import { Button } from '@/components/ui/button'
import { QuestCard } from '@/components/quest/QuestCard'

// 5. Types
import type { UserTask } from '@/types/quest'

// 6. Constants
import { EXP_TABLE } from '@/constants/gamification'
```

---

## 5. Database Development

### 5.1 Migration Workflow

```bash
# Create new migration
supabase migration new add_feature_table

# Edit the migration file in supabase/migrations/
# Then apply:
supabase db push

# Reset database (WARNING: destroys data)
supabase db reset
```

### 5.2 RLS Policy Template

Every user-facing table MUST have RLS:

```sql
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Read own data only
CREATE POLICY "Users read own data" ON my_table
    FOR SELECT USING (public.is_owner(user_id));

-- Insert own data only
CREATE POLICY "Users insert own data" ON my_table
    FOR INSERT WITH CHECK (public.is_owner(user_id));

-- Update own data only
CREATE POLICY "Users update own data" ON my_table
    FOR UPDATE USING (public.is_owner(user_id));

-- Delete own data only
CREATE POLICY "Users delete own data" ON my_table
    FOR DELETE USING (public.is_owner(user_id));
```

### 5.3 Key Constraints

- All user tables MUST have Supabase Auth-compatible `user_id text NOT NULL REFERENCES public.users_profile(id) ON DELETE CASCADE`
- `username` must be unique
- Mandatory prayers: `is_deletable=false`, `is_system_required=true`
- Financial transactions: `type IN ('income', 'expense')`
- Always use `TIMESTAMPTZ` (not `TIMESTAMP`)
- Use `gen_random_uuid()` for primary keys

---

## 6. Git Workflow

### Branch Strategy

```
main          ← production-ready code
├── develop   ← integration branch
│   ├── feature/auth-login
│   ├── feature/quest-system
│   ├── fix/streak-calculation
│   └── docs/update-readme
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(quest): add daily quest completion flow
fix(gamification): correct EXP calculation for level 10+
docs(readme): update setup instructions
style(dashboard): fix card alignment on mobile
refactor(finance): extract budget calculation to utility
test(auth): add login flow unit tests
chore(deps): update supabase-js to v2.106
```

### PR Checklist

- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] ESLint passes (`npm run lint`)
- [ ] RLS policies added for new tables
- [ ] Zod validation on new API inputs
- [ ] Mobile responsive (test at 360px)
- [ ] No hardcoded secrets or API keys

---

## 7. Testing

```bash
npm run lint              # ESLint
npx tsc --noEmit          # Type checking
npm test                  # Unit tests (Vitest - planned)
npm run test:e2e          # E2E tests (Playwright - planned)
```

### Testing Priorities

| Priority | Area | Tool |
|----------|------|------|
| P0 | Gamification engine (EXP, level, streak) | Unit tests |
| P0 | RLS policies | Supabase test helpers |
| P1 | Server Actions | Integration tests |
| P1 | Auth flow | E2E tests |
| P2 | UI components | Component tests |

---

## 8. Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
GEMINI_API_KEY=xxx                 # optional AI features
# Future AI Gateway/OpenAI variables should be added only after provider strategy is finalized.
```

**Rules:**
- `NEXT_PUBLIC_*` → exposed to browser (safe for public keys only)
- Non-prefixed → server-only (secrets)
- Never commit `.env.local` to git

---

## 9. Deployment

### Vercel Deployment

```bash
# Preview deployment
npx vercel

# Production deployment
npx vercel --prod
```

### Pre-deployment Checklist

- [ ] `npm run build` succeeds
- [ ] All env vars set in Vercel dashboard
- [ ] Supabase production project configured
- [ ] RLS policies verified on production DB
- [ ] Service worker cleanup verified; do not re-enable PWA caching without stale-cache regression tests

---

## 10. Troubleshooting

| Issue | Solution |
|-------|----------|
| Supabase connection refused | Run `supabase start`, check Docker is running |
| RLS blocking queries | Verify Supabase Auth user id matches `user_id`, check policy with service role |
| Hydration mismatch | Ensure client/server render same initial content |
| Tailwind classes not working | Check `content` paths in `tailwind.config.ts` |
| Type errors after DB changes | Regenerate types: `supabase gen types typescript` |
