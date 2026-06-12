import { Card } from "@/components/ui/card";
import { UserRoleManagement } from "@/components/admin/user-role-management";
import { getCurrentUserProfile } from "@/lib/user";
import { routes } from "@/lib/routes";
import { isAdminRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  AccessLevel,
  accessLevelLabel,
  permissionMatrix,
  roleDefinitions,
  roleLabel,
  roleOrder,
} from "@/lib/rbac";

function stageBadge(stage: "mvp" | "next_phase") {
  if (stage === "mvp") {
    return (
      <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-300">
        MVP
      </span>
    );
  }

  return (
    <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-1 text-xs font-medium text-amber-300">
      Next Phase
    </span>
  );
}

function accessBadge(level: AccessLevel) {
  const styleByLevel: Record<AccessLevel, string> = {
    none: "border-line text-text-dim bg-bg-soft",
    read: "border-blue-400/40 text-blue-200 bg-blue-400/10",
    write: "border-emerald-400/40 text-emerald-200 bg-emerald-400/10",
    manage: "border-brand/60 text-brand bg-brand/10",
  };

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${styleByLevel[level]}`}
    >
      {accessLevelLabel(level)}
    </span>
  );
}

export default async function AccessControlPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) {
    redirect(routes.login);
  }

  const currentRole = profile.role;
  const isAdmin = isAdminRole(currentRole);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">Management Role & Permission</h1>
        <p className="mt-2 text-sm text-text-dim">
          Halaman ini menampilkan katalog role, matrix permission, dan pengaturan role.
          Hanya admin system yang dapat mengubah assignment role pengguna.
        </p>
      </Card>

      <Card className="p-5">
        <h2 className="section-title">Role Catalog</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {roleDefinitions.map((role) => (
            <div key={role.key} className="rounded-xl border border-line bg-bg-soft p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold">{role.name}</h3>
                {stageBadge(role.stage)}
              </div>
              <p className="mt-2 text-sm text-text-dim">{role.description}</p>
              <p className="mt-3 text-xs text-text-dim">Assigned users: {role.usersCount}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="section-title">Permission Matrix</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[880px] w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-line px-3 py-3 text-left text-xs uppercase tracking-wide text-text-dim">
                  Scope
                </th>
                {roleOrder.map((role) => (
                  <th
                    key={role}
                    className="border-b border-line px-3 py-3 text-left text-xs uppercase tracking-wide text-text-dim"
                  >
                    {roleLabel(role)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionMatrix.map((row) => (
                <tr key={row.scope} className="align-top">
                  <td className="border-b border-line px-3 py-3">
                    <p className="font-medium text-text">{row.label}</p>
                    <p className="mt-1 text-xs text-text-dim">{row.scope}</p>
                  </td>
                  {roleOrder.map((role) => (
                    <td key={role} className="border-b border-line px-3 py-3">
                      {accessBadge(row.access[role])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="p-5">
          <h2 className="section-title">User Role Assignment</h2>
          <div className="mt-4 text-sm text-text-dim">
            {isAdmin ? (
              <p>
                Anda adalah admin system. Ubah role pengguna melalui panel di samping
                jika diperlukan.
              </p>
            ) : (
              <p>
                Hanya admin system yang dapat mengubah role. User biasa tidak dapat
                mengakses atau mengubah role pengguna lain.
              </p>
            )}
          </div>
        </Card>

        {isAdmin ? (
          <UserRoleManagement />
        ) : (
          <Card className="p-5">
            <h2 className="section-title">Restricted Access</h2>
            <p className="mt-4 text-sm text-text-dim">
              Halaman ini menampilkan permintaan yang terbatas untuk user normal. Jika Anda
              membutuhkan akses admin, silakan hubungi tim sistem.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
