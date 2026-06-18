const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertIncludes(file, text) {
  const contents = read(file);
  assert(contents.includes(text), `${file} must include ${text}`);
}

function assertNotIncludes(file, text) {
  const contents = read(file);
  assert(!contents.includes(text), `${file} must not include ${text}`);
}

function main() {
  assert(!fs.existsSync(path.join(root, "src/pages/api/debug/test-achievement.ts")),
    "legacy pages/api debug route must not exist");

  assertIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_URL=");
  assertIncludes(".env.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY=");
  assertIncludes(".env.example", "SUPABASE_SERVICE_ROLE_KEY=");
  assertIncludes(".env.example", "AUTH_BYPASS_ENABLED=false");
  assertIncludes(".env.local.example", "NEXT_PUBLIC_SUPABASE_URL=");
  assertIncludes(".env.local.example", "NEXT_PUBLIC_SUPABASE_ANON_KEY=");
  assertIncludes(".env.local.example", "SUPABASE_SERVICE_ROLE_KEY=");
  assertIncludes(".env.local.example", "AUTH_BYPASS_ENABLED=false");
  assert(fs.existsSync(path.join(root, "src/middleware.ts")),
    "src/middleware.ts must exist for Supabase session refresh");
  assertIncludes("src/middleware.ts", "createServerClient");
  assertIncludes("src/middleware.ts", "supabase.auth.getUser()");
  assertNotIncludes("src/middleware.ts", "auth.protect");
  assertNotIncludes("src/middleware.ts", "createRouteMatcher");
  assert(!fs.existsSync(path.join(root, "src/app/api/ai/coach/route 2.ts")),
    "duplicate AI coach route artifact must not exist");

  assertIncludes("src/lib/routes.ts", "register: \"/register\"");
  assertIncludes("src/lib/routes.ts", "onboarding: \"/onboarding\"");
  assertIncludes("src/lib/auth.ts", "createSupabaseServerClient");
  assertIncludes("src/lib/auth.ts", "supabase.auth.getUser()");
  assertIncludes("src/lib/auth.ts", "getUserRoleFromProfile");
  assertIncludes("src/lib/env.ts", "NEXT_PUBLIC_APP_ENV === \"development\"");
  assertIncludes("src/lib/auth.ts", "isAuthBypassEnabled");
  assertIncludes("src/app/(app)/layout.tsx", "export const dynamic = \"force-dynamic\"");
  assertIncludes("src/app/(app)/layout.tsx", "profile.onboardingCompleted");
  assertIncludes("src/app/(app)/layout.tsx", "isAuthBypassEnabled");
  assertIncludes("src/lib/user.ts", "getBypassProfile");
  assertIncludes("src/lib/user.ts", "profileUsername");
  assertIncludes("src/lib/user.ts", "onConflict: \"id\"");
  assertIncludes("src/app/(app)/layout.tsx", "redirect(routes.onboarding)");
  assertIncludes("src/app/onboarding/page.tsx", "redirect(routes.login)");
  assertIncludes("src/app/onboarding/page.tsx", "export const dynamic = \"force-dynamic\"");
  assertIncludes("src/lib/personalization.ts", "mandatoryPrayerTasks");
  assertIncludes("src/lib/personalization.ts", "prayer-subuh");
  assertIncludes("src/lib/personalization.ts", "isDeletable: false");
  assertIncludes("src/app/api/onboarding/route.ts", "buildOnboardingSeedTasks");
  assertIncludes("src/app/api/onboarding/route.ts", "existingTemplateIds");
  assertIncludes("src/app/(app)/deen/page.tsx", "getCurrentUserDailyTasks");
  assertNotIncludes("src/app/(app)/deen/page.tsx", "@/lib/mock-data");
  assertIncludes("src/app/(app)/finance/page.tsx", "FinanceTracker");
  assertNotIncludes("src/app/(app)/finance/page.tsx", "@/lib/mock-data");
  assertIncludes("src/app/api/finance/transactions/route.ts", "financial_transactions");
  assertIncludes("src/app/api/finance/transactions/route.ts", "getCurrentUserId");
  assertIncludes("src/app/api/finance/transactions/route.ts", "export async function PATCH");
  assertIncludes("src/app/api/finance/transactions/route.ts", "export async function DELETE");
  assertIncludes("src/app/api/finance/transactions/route.ts", ".eq(\"user_id\", userId)");
  assertIncludes("src/app/api/finance/transactions/route.ts", "monthSchema");
  assertIncludes("src/app/api/finance/transactions/route.ts", "categorySummary");
  assertIncludes("src/components/finance/finance-tracker.tsx", "setEditingId");
  assertIncludes("src/components/finance/finance-tracker.tsx", "handleDelete");
  assertIncludes("src/components/finance/finance-tracker.tsx", "type=\"month\"");
  assertIncludes("src/components/finance/finance-tracker.tsx", "Ringkasan Bulanan");
  assertIncludes("src/app/(app)/planning/page.tsx", "getCurrentUserPlanningData");
  assertNotIncludes("src/app/(app)/planning/page.tsx", "@/lib/mock-data");
  assertIncludes("src/lib/planning.ts", "budgets");
  assertIncludes("src/lib/planning.ts", "savings_goals");
  assertIncludes("src/lib/planning.ts", ".eq(\"user_id\", userId)");
  assertIncludes("src/app/(app)/planning/page.tsx", "PlanningManager");
  assertIncludes("src/components/planning/planning-manager.tsx", "/api/planning/budgets");
  assertIncludes("src/components/planning/planning-manager.tsx", "/api/planning/savings-goals");
  assertIncludes("src/app/api/planning/budgets/route.ts", "getCurrentUserId");
  assertIncludes("src/app/api/planning/budgets/route.ts", ".eq(\"user_id\", userId)");
  assertIncludes("src/app/api/planning/savings-goals/route.ts", "getCurrentUserId");
  assertIncludes("src/app/api/planning/savings-goals/route.ts", ".eq(\"user_id\", userId)");
  assertIncludes("src/app/(app)/settings/page.tsx", "getCurrentUserProfile");
  assertIncludes("src/app/(app)/settings/page.tsx", "ProfileSettingsForm");
  assertNotIncludes("src/app/(app)/settings/page.tsx", "@/lib/mock-data");
  assertIncludes("src/app/api/settings/profile/route.ts", "getCurrentUserId");
  assertIncludes("src/app/api/settings/profile/route.ts", ".eq(\"id\", userId)");
  assertIncludes("src/components/settings/profile-settings-form.tsx", "/api/settings/profile");
  assertIncludes("src/app/api/settings/export/route.ts", "settings.data.export");
  assertIncludes("src/app/api/settings/export/route.ts", "actor_user_id");
  assertIncludes("src/components/settings/data-export-card.tsx", "/api/settings/export");
  assertIncludes("src/app/(app)/settings/page.tsx", "DataExportCard");
  assertIncludes("src/app/api/settings/delete-request/route.ts", "settings.account_deletion.request");
  assertIncludes("src/app/api/settings/delete-request/route.ts", "account_deletion_requests");
  assertIncludes("src/components/settings/account-deletion-card.tsx", "/api/settings/delete-request");
  assertIncludes("src/app/(app)/settings/page.tsx", "AccountDeletionCard");
  assertIncludes("src/lib/audit.ts", "system_audit_logs");
  assertIncludes("src/app/api/finance/transactions/route.ts", "writeSystemAuditLog");
  assertIncludes("src/app/api/planning/budgets/route.ts", "writeSystemAuditLog");
  assertIncludes("src/app/api/planning/savings-goals/route.ts", "writeSystemAuditLog");
  assertIncludes("src/app/api/settings/profile/route.ts", "writeSystemAuditLog");
  assertIncludes("src/app/api/tasks/complete/route.ts", "writeSystemAuditLog");
  assertIncludes("src/app/api/tasks/complete/route.ts", "rewardGranted");
  assertIncludes("src/app/api/tasks/route.ts", "writeSystemAuditLog");
  assertIncludes("src/app/api/tasks/route.ts", "task.create");
  assertIncludes("src/app/(app)/admin/audit/page.tsx", "system_audit_logs");
  assertIncludes("src/app/(app)/admin/audit/page.tsx", "Audit Mutasi Sistem");
  assertIncludes("src/app/(app)/admin/audit/page.tsx", "Request Delete Account");
  assertIncludes("src/app/(app)/admin/audit/page.tsx", "account_deletion_requests");
  assertIncludes("src/app/(app)/admin/audit/page.tsx", "isAdminRole");
  assertNotIncludes("next.config.mjs", "withPWA");
  assertIncludes("src/components/pwa/register-sw.tsx", "getRegistrations");
  assertIncludes("src/components/pwa/register-sw.tsx", "registration.unregister()");
  assertIncludes("public/sw.js", "self.registration.unregister()");
  assertIncludes("docs/Runtime_Runbook.md", "Server-Side Auth");
  assertIncludes("docs/Document_Audit_0d528d9c-ba71-4d84-9197-bfc9263f6ebd.md", "0d528d9c-ba71-4d84-9197-bfc9263f6ebd");

  assertIncludes("supabase/migrations/202605010001_init_level_up_deen.sql", "id text primary key");
  assertIncludes("supabase/migrations/202605010001_init_level_up_deen.sql", "user_id text not null references public.users_profile(id)");
  assertIncludes("supabase/migrations/202605010001_init_level_up_deen.sql", "user_tasks_user_template_unique_idx");
  assertNotIncludes("supabase/migrations/202605010001_init_level_up_deen.sql", "references auth.users");
  assertNotIncludes("supabase/migrations/202605010001_init_level_up_deen.sql", "auth.uid()");

  assertIncludes("supabase/migrations/202606030002_align_user_ids_with_clerk.sql", "alter column user_id type text");
  assertIncludes("supabase/migrations/202606030002_align_user_ids_with_clerk.sql", "drop function if exists public.is_owner(uuid)");
  assertIncludes("supabase/migrations/202606040001_add_user_task_template_unique_index.sql", "user_tasks_user_template_unique_idx");
  assertIncludes("supabase/migrations/202606040002_add_finance_category_unique_index.sql", "financial_categories_user_type_name_unique_idx");
  assertIncludes("supabase/migrations/202606040003_add_system_audit_logs.sql", "system_audit_logs");
  assertIncludes("supabase/migrations/202606040003_add_system_audit_logs.sql", "actor_user_id text");
  assertIncludes("supabase/migrations/202606050001_add_account_deletion_requests.sql", "account_deletion_requests");
  assertIncludes("supabase/migrations/202606050001_add_account_deletion_requests.sql", "unique(user_id, status)");

  console.log("Workflow verification passed.");
}

main();
