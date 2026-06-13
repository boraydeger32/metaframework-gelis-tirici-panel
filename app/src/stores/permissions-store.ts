import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Role {
  id: string;
  name: string;
  slug: string;
  color: string;
  userCount: number;
  description: string;
}

export type PermissionMatrix = Record<string, Record<string, Record<string, boolean>>>;

interface PermissionsStore {
  roles: Role[];
  permissions: PermissionMatrix;
  activeRoleId: string;
  addRole: (role: Role) => void;
  deleteRole: (id: string) => void;
  setActiveRole: (id: string) => void;
  togglePermission: (roleSlug: string, model: string, action: string) => void;
  setAllPermissions: (roleSlug: string, model: string, value: boolean) => void;
}

const defaultRoles: Role[] = [
  { id: "admin", name: "Admin", slug: "admin", color: "bg-red-500", userCount: 2, description: "Tam yetki" },
  { id: "editor", name: "Editor", slug: "editor", color: "bg-blue-500", userCount: 5, description: "Icerik duzenleme yetkisi" },
  { id: "viewer", name: "Viewer", slug: "viewer", color: "bg-emerald-500", userCount: 12, description: "Sadece okuma yetkisi" },
  { id: "api", name: "API User", slug: "api-user", color: "bg-amber-500", userCount: 3, description: "Sadece API erisimi" },
];

const models = ["User", "Product", "Order", "BlogPost", "Category", "Media"];
const actions = ["read", "create", "update", "delete", "export", "import"];

function makePerms(allowed: Record<string, string[]>): Record<string, Record<string, boolean>> {
  const result: Record<string, Record<string, boolean>> = {};
  for (const model of models) {
    result[model] = {};
    for (const action of actions) {
      result[model][action] = (allowed[model] || []).includes(action);
    }
  }
  return result;
}

const allActions = actions;
const readOnly = ["read"];
const defaultPermissions: PermissionMatrix = {
  admin: makePerms(Object.fromEntries(models.map((m) => [m, allActions]))),
  editor: makePerms({
    User: ["read"],
    Product: ["read", "create", "update", "export"],
    Order: ["read", "update", "export"],
    BlogPost: allActions,
    Category: ["read", "create", "update"],
    Media: ["read", "create", "update", "delete"],
  }),
  viewer: makePerms(Object.fromEntries(models.map((m) => [m, readOnly]))),
  "api-user": makePerms({
    User: ["read", "export"],
    Product: ["read", "create", "update", "export", "import"],
    Order: ["read", "create", "export"],
    BlogPost: ["read", "export"],
    Category: ["read"],
    Media: ["read", "create"],
  }),
};

export const MODELS = models;
export const ACTIONS = actions;

export const usePermissionsStore = create<PermissionsStore>()(
  persist(
    (set) => ({
      roles: defaultRoles,
      permissions: defaultPermissions,
      activeRoleId: "admin",

      addRole: (role) =>
        set((state) => {
          const perms = makePerms(Object.fromEntries(models.map((m) => [m, readOnly])));
          return {
            roles: [...state.roles, role],
            permissions: { ...state.permissions, [role.slug]: perms },
          };
        }),

      deleteRole: (id) =>
        set((state) => {
          const role = state.roles.find((r) => r.id === id);
          const newPerms = { ...state.permissions };
          if (role) delete newPerms[role.slug];
          return {
            roles: state.roles.filter((r) => r.id !== id),
            permissions: newPerms,
            activeRoleId: state.activeRoleId === id ? state.roles[0]?.id || "" : state.activeRoleId,
          };
        }),

      setActiveRole: (id) => set({ activeRoleId: id }),

      togglePermission: (roleSlug, model, action) =>
        set((state) => ({
          permissions: {
            ...state.permissions,
            [roleSlug]: {
              ...state.permissions[roleSlug],
              [model]: {
                ...state.permissions[roleSlug]?.[model],
                [action]: !state.permissions[roleSlug]?.[model]?.[action],
              },
            },
          },
        })),

      setAllPermissions: (roleSlug, model, value) =>
        set((state) => ({
          permissions: {
            ...state.permissions,
            [roleSlug]: {
              ...state.permissions[roleSlug],
              [model]: Object.fromEntries(actions.map((a) => [a, value])),
            },
          },
        })),
    }),
    { name: "metapanel-permissions" }
  )
);
