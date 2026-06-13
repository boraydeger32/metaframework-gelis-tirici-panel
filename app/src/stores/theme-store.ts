import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ColorToken {
  name: string;
  variable: string;
  value: string;
}

interface ThemeStore {
  colors: Record<string, ColorToken[]>;
  updateColor: (group: string, index: number, value: string) => void;
  resetColors: () => void;
}

const defaultColors: Record<string, ColorToken[]> = {
  Primary: [
    { name: "50", variable: "--primary-50", value: "#eef2ff" },
    { name: "100", variable: "--primary-100", value: "#e0e7ff" },
    { name: "200", variable: "--primary-200", value: "#c7d2fe" },
    { name: "300", variable: "--primary-300", value: "#a5b4fc" },
    { name: "400", variable: "--primary-400", value: "#818cf8" },
    { name: "500", variable: "--primary-500", value: "#6366f1" },
    { name: "600", variable: "--primary-600", value: "#4f46e5" },
    { name: "700", variable: "--primary-700", value: "#4338ca" },
    { name: "800", variable: "--primary-800", value: "#3730a3" },
    { name: "900", variable: "--primary-900", value: "#312e81" },
  ],
  Secondary: [
    { name: "50", variable: "--secondary-50", value: "#fdf4ff" },
    { name: "500", variable: "--secondary-500", value: "#d946ef" },
    { name: "600", variable: "--secondary-600", value: "#c026d3" },
    { name: "900", variable: "--secondary-900", value: "#701a75" },
  ],
  Semantic: [
    { name: "success", variable: "--color-success", value: "#10b981" },
    { name: "warning", variable: "--color-warning", value: "#f59e0b" },
    { name: "error", variable: "--color-error", value: "#ef4444" },
    { name: "info", variable: "--color-info", value: "#3b82f6" },
  ],
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      colors: defaultColors,

      updateColor: (group, index, value) =>
        set((state) => ({
          colors: {
            ...state.colors,
            [group]: state.colors[group].map((t, i) =>
              i === index ? { ...t, value } : t
            ),
          },
        })),

      resetColors: () => set({ colors: defaultColors }),
    }),
    { name: "metapanel-theme" }
  )
);
