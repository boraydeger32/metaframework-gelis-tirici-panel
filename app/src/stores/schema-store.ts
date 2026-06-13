import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "email"
  | "url"
  | "json"
  | "text"
  | "relation"
  | "enum"
  | "computed";

export interface SchemaField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  indexed: boolean;
  defaultValue?: string;
  description?: string;
  validation?: string;
  enumValues?: string[];
  relationModel?: string;
}

export interface SchemaModel {
  id: string;
  name: string;
  tableName: string;
  fields: SchemaField[];
  timestamps: boolean;
  softDelete: boolean;
  description?: string;
  createdAt: string;
}

interface SchemaStore {
  models: SchemaModel[];
  activeModelId: string | null;
  addModel: (model: SchemaModel) => void;
  updateModel: (id: string, updates: Partial<SchemaModel>) => void;
  deleteModel: (id: string) => void;
  setActiveModel: (id: string | null) => void;
  addField: (modelId: string, field: SchemaField) => void;
  updateField: (modelId: string, fieldId: string, updates: Partial<SchemaField>) => void;
  deleteField: (modelId: string, fieldId: string) => void;
  reorderField: (modelId: string, fieldId: string, direction: "up" | "down") => void;
}

const defaultModels: SchemaModel[] = [
  {
    id: "user",
    name: "User",
    tableName: "users",
    timestamps: true,
    softDelete: true,
    description: "Kullanici modeli",
    createdAt: "2026-01-15T10:00:00Z",
    fields: [
      { id: "f1", name: "name", type: "string", required: true, unique: false, indexed: true },
      { id: "f2", name: "email", type: "email", required: true, unique: true, indexed: true },
      { id: "f3", name: "role", type: "enum", required: true, unique: false, indexed: true, enumValues: ["admin", "editor", "viewer"] },
      { id: "f4", name: "metadata", type: "json", required: false, unique: false, indexed: false },
    ],
  },
  {
    id: "product",
    name: "Product",
    tableName: "products",
    timestamps: true,
    softDelete: false,
    description: "Urun modeli",
    createdAt: "2026-02-20T10:00:00Z",
    fields: [
      { id: "p1", name: "title", type: "string", required: true, unique: false, indexed: true },
      { id: "p2", name: "price", type: "number", required: true, unique: false, indexed: false },
      { id: "p3", name: "description", type: "text", required: false, unique: false, indexed: false },
      { id: "p4", name: "category", type: "relation", required: false, unique: false, indexed: true, relationModel: "Category" },
    ],
  },
  {
    id: "order",
    name: "Order",
    tableName: "orders",
    timestamps: true,
    softDelete: false,
    description: "Siparis modeli",
    createdAt: "2026-03-10T10:00:00Z",
    fields: [
      { id: "o1", name: "order_number", type: "string", required: true, unique: true, indexed: true },
      { id: "o2", name: "customer", type: "relation", required: true, unique: false, indexed: true, relationModel: "User" },
      { id: "o3", name: "total", type: "number", required: true, unique: false, indexed: false },
      { id: "o4", name: "status", type: "enum", required: true, unique: false, indexed: true, enumValues: ["draft", "pending", "approved", "shipped", "completed", "cancelled"] },
    ],
  },
  {
    id: "category",
    name: "Category",
    tableName: "categories",
    timestamps: true,
    softDelete: false,
    description: "Kategori modeli",
    createdAt: "2026-02-25T10:00:00Z",
    fields: [
      { id: "c1", name: "name", type: "string", required: true, unique: true, indexed: true },
      { id: "c2", name: "slug", type: "string", required: true, unique: true, indexed: true },
      { id: "c3", name: "description", type: "text", required: false, unique: false, indexed: false },
    ],
  },
];

export const useSchemaStore = create<SchemaStore>()(
  persist(
    (set) => ({
      models: defaultModels,
      activeModelId: "user",

      addModel: (model) =>
        set((state) => ({ models: [...state.models, model] })),

      updateModel: (id, updates) =>
        set((state) => ({
          models: state.models.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      deleteModel: (id) =>
        set((state) => ({
          models: state.models.filter((m) => m.id !== id),
          activeModelId: state.activeModelId === id ? (state.models[0]?.id ?? null) : state.activeModelId,
        })),

      setActiveModel: (id) => set({ activeModelId: id }),

      addField: (modelId, field) =>
        set((state) => ({
          models: state.models.map((m) =>
            m.id === modelId ? { ...m, fields: [...m.fields, field] } : m
          ),
        })),

      updateField: (modelId, fieldId, updates) =>
        set((state) => ({
          models: state.models.map((m) =>
            m.id === modelId
              ? { ...m, fields: m.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)) }
              : m
          ),
        })),

      deleteField: (modelId, fieldId) =>
        set((state) => ({
          models: state.models.map((m) =>
            m.id === modelId
              ? { ...m, fields: m.fields.filter((f) => f.id !== fieldId) }
              : m
          ),
        })),

      reorderField: (modelId, fieldId, direction) =>
        set((state) => ({
          models: state.models.map((m) => {
            if (m.id !== modelId) return m;
            const idx = m.fields.findIndex((f) => f.id === fieldId);
            if (idx === -1) return m;
            const newIdx = direction === "up" ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= m.fields.length) return m;
            const fields = [...m.fields];
            [fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]];
            return { ...m, fields };
          }),
        })),
    }),
    { name: "metapanel-schema" }
  )
);
