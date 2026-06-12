export type RoleKey = "user" | "admin_system" | "community_member" | "guild_leader" | "mentor";

export type PermissionScope =
  | "profile"
  | "quest"
  | "deen"
  | "fitness"
  | "water"
  | "finance"
  | "avatar"
  | "settings"
  | "admin_master_data"
  | "community";

export type AccessLevel = "none" | "read" | "write" | "manage";

export interface RoleDefinition {
  key: RoleKey;
  name: string;
  stage: "mvp" | "next_phase";
  description: string;
  usersCount: number;
}

export interface PermissionMatrixRow {
  scope: PermissionScope;
  label: string;
  access: Record<RoleKey, AccessLevel>;
}

export interface UserRoleAssignment {
  id: string;
  name: string;
  username: string;
  role: RoleKey;
  status: "active" | "pending";
  lastUpdated: string;
}

export const roleDefinitions: RoleDefinition[] = [
  {
    key: "user",
    name: "User",
    stage: "mvp",
    description: "Akses penuh ke data pribadi dan fitur personal progress.",
    usersCount: 128,
  },
  {
    key: "admin_system",
    name: "Admin System",
    stage: "mvp",
    description: "Kelola template task, item shop, achievement, dan konfigurasi sistem.",
    usersCount: 3,
  },
  {
    key: "community_member",
    name: "Community Member",
    stage: "next_phase",
    description: "Berpartisipasi dalam leaderboard dan challenge komunitas.",
    usersCount: 0,
  },
  {
    key: "guild_leader",
    name: "Guild Leader",
    stage: "next_phase",
    description: "Membuat challenge grup, mengelola anggota squad/guild.",
    usersCount: 0,
  },
  {
    key: "mentor",
    name: "Mentor",
    stage: "next_phase",
    description: "Memberi arahan dan challenge berbasis pendampingan.",
    usersCount: 0,
  },
];

export const roleOrder: RoleKey[] = [
  "user",
  "admin_system",
  "community_member",
  "guild_leader",
  "mentor",
];

export const permissionMatrix: PermissionMatrixRow[] = [
  {
    scope: "profile",
    label: "User Profile",
    access: {
      user: "write",
      admin_system: "manage",
      community_member: "read",
      guild_leader: "read",
      mentor: "read",
    },
  },
  {
    scope: "quest",
    label: "Daily Quest",
    access: {
      user: "write",
      admin_system: "manage",
      community_member: "read",
      guild_leader: "manage",
      mentor: "read",
    },
  },
  {
    scope: "deen",
    label: "Deen Tracker",
    access: {
      user: "write",
      admin_system: "manage",
      community_member: "none",
      guild_leader: "none",
      mentor: "read",
    },
  },
  {
    scope: "fitness",
    label: "Fitness Tracker",
    access: {
      user: "write",
      admin_system: "manage",
      community_member: "read",
      guild_leader: "read",
      mentor: "read",
    },
  },
  {
    scope: "water",
    label: "Water Tracker",
    access: {
      user: "write",
      admin_system: "manage",
      community_member: "none",
      guild_leader: "none",
      mentor: "none",
    },
  },
  {
    scope: "finance",
    label: "Finance & Planning",
    access: {
      user: "write",
      admin_system: "none",
      community_member: "none",
      guild_leader: "none",
      mentor: "none",
    },
  },
  {
    scope: "avatar",
    label: "Avatar & Shop",
    access: {
      user: "write",
      admin_system: "manage",
      community_member: "read",
      guild_leader: "read",
      mentor: "read",
    },
  },
  {
    scope: "settings",
    label: "Settings",
    access: {
      user: "write",
      admin_system: "manage",
      community_member: "none",
      guild_leader: "none",
      mentor: "none",
    },
  },
  {
    scope: "admin_master_data",
    label: "Master Data",
    access: {
      user: "none",
      admin_system: "manage",
      community_member: "none",
      guild_leader: "none",
      mentor: "none",
    },
  },
  {
    scope: "community",
    label: "Community Module",
    access: {
      user: "none",
      admin_system: "manage",
      community_member: "write",
      guild_leader: "manage",
      mentor: "write",
    },
  },
];

export const userRoleAssignments: UserRoleAssignment[] = [
  {
    id: "u-1",
    name: "Ahmad Ramadhan",
    username: "fajr_striver",
    role: "user",
    status: "active",
    lastUpdated: "2026-05-20",
  },
  {
    id: "u-2",
    name: "Nadia Syifa",
    username: "discipline_nadia",
    role: "user",
    status: "active",
    lastUpdated: "2026-05-21",
  },
  {
    id: "u-3",
    name: "Admin Core",
    username: "admin_core",
    role: "admin_system",
    status: "active",
    lastUpdated: "2026-05-19",
  },
  {
    id: "u-4",
    name: "Rafi Akbar",
    username: "rafi_future_guild",
    role: "guild_leader",
    status: "pending",
    lastUpdated: "2026-05-18",
  },
];

export function roleLabel(role: RoleKey) {
  const found = roleDefinitions.find((item) => item.key === role);
  return found?.name ?? role;
}

export function accessLevelLabel(level: AccessLevel) {
  switch (level) {
    case "none":
      return "No Access";
    case "read":
      return "Read";
    case "write":
      return "Write";
    case "manage":
      return "Manage";
    default:
      return level;
  }
}
