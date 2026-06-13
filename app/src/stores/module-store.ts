import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Module {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  enabled: boolean;
  dependencies: string[];
  author?: string;
  icon: string;
  category: string;
}

interface ModuleStore {
  modules: Module[];
  addModule: (mod: Module) => void;
  toggleModule: (id: string) => void;
  removeModule: (id: string) => void;
  updateModule: (id: string, updates: Partial<Module>) => void;
}

const defaultModules: Module[] = [
  { id: "core", name: "Core", slug: "core", version: "1.0.0", description: "Temel sistem fonksiyonlari ve lifecycle yonetimi", enabled: true, dependencies: [], icon: "Box", category: "System" },
  { id: "auth", name: "Authentication", slug: "auth", version: "2.1.0", description: "JWT, OAuth, RBAC tabanli kimlik dogrulama ve yetkilendirme", enabled: true, dependencies: ["core"], icon: "Shield", category: "System" },
  { id: "media", name: "Media Manager", slug: "media", version: "1.3.0", description: "Dosya upload, image processing, CDN entegrasyonu", enabled: true, dependencies: ["core"], icon: "Image", category: "Content" },
  { id: "api", name: "API Gateway", slug: "api", version: "1.0.0", description: "REST & GraphQL auto-generation, rate limiting, versioning", enabled: true, dependencies: ["core", "auth"], icon: "Globe", category: "Infrastructure" },
  { id: "ecommerce", name: "E-Commerce", slug: "ecommerce", version: "0.9.0", description: "Urun, siparis, sepet ve odeme yonetimi", enabled: false, dependencies: ["core", "auth", "media"], icon: "ShoppingCart", category: "Business" },
  { id: "notifications", name: "Notifications", slug: "notifications", version: "1.0.0", description: "Email, SMS, push notification ve in-app bildirimler", enabled: false, dependencies: ["core"], icon: "Mail", category: "Communication" },
  { id: "analytics", name: "Analytics", slug: "analytics", version: "0.5.0", description: "Event tracking, dashboard metrikleri, custom raporlama", enabled: false, dependencies: ["core", "auth"], icon: "BarChart3", category: "Intelligence" },
  { id: "cms", name: "CMS", slug: "cms", version: "1.2.0", description: "Icerik yonetimi, sayfa builder, SEO araclari", enabled: false, dependencies: ["core", "auth", "media"], icon: "FileText", category: "Content" },
];

export const useModuleStore = create<ModuleStore>()(
  persist(
    (set) => ({
      modules: defaultModules,

      addModule: (mod) =>
        set((state) => ({ modules: [...state.modules, mod] })),

      toggleModule: (id) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, enabled: !m.enabled } : m
          ),
        })),

      removeModule: (id) =>
        set((state) => ({
          modules: state.modules.filter((m) => m.id !== id),
        })),

      updateModule: (id, updates) =>
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
    }),
    { name: "metapanel-modules" }
  )
);
