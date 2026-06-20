import { redirect } from "next/navigation";
import { getCurrentUserId, requireAdminContext, isAuthFailure } from "@/lib/auth";
import { routes } from "@/lib/routes";
import { ItemManagement } from "@/components/admin/item-management";

export const dynamic = "force-dynamic";

export default async function AdminItemsPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(routes.login);
  }

  const adminContext = await requireAdminContext();
  if (isAuthFailure(adminContext)) {
    redirect(routes.dashboard);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Shop</h1>
          <p className="mt-1 text-sm text-text-dim">Kelola item kosmetik Avatar Shop.</p>
        </div>
      </div>

      <ItemManagement />
    </div>
  );
}
