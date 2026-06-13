import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ActivityType = "schema" | "module" | "migration" | "api" | "theme" | "auth" | "form" | "data" | "workflow" | "permission";

export interface ActivityEntry {
  id: string;
  action: string;
  target: string;
  user: string;
  type: ActivityType;
  timestamp: string;
}

interface ActivityStore {
  activities: ActivityEntry[];
  addActivity: (entry: Omit<ActivityEntry, "id" | "timestamp">) => void;
  clearActivities: () => void;
}

const defaultActivities: ActivityEntry[] = [
  { id: "a1", action: "Model guncellendi", target: "Customer", user: "admin", type: "schema", timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: "a2", action: "Modul etkinlestirildi", target: "E-Commerce v0.9.0", user: "admin", type: "module", timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
  { id: "a3", action: "Migration calistirildi", target: "003_add_orders.sql", user: "system", type: "migration", timestamp: new Date(Date.now() - 120 * 60000).toISOString() },
  { id: "a4", action: "API endpoint olusturuldu", target: "POST /api/products", user: "admin", type: "api", timestamp: new Date(Date.now() - 180 * 60000).toISOString() },
  { id: "a5", action: "Tema renkleri degistirildi", target: "Primary: #6366F1", user: "admin", type: "theme", timestamp: new Date(Date.now() - 300 * 60000).toISOString() },
];

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set) => ({
      activities: defaultActivities,

      addActivity: (entry) =>
        set((state) => ({
          activities: [
            {
              ...entry,
              id: `a${Date.now()}`,
              timestamp: new Date().toISOString(),
            },
            ...state.activities,
          ].slice(0, 100),
        })),

      clearActivities: () => set({ activities: [] }),
    }),
    { name: "metapanel-activity" }
  )
);
