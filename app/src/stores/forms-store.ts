import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FormField {
  id: string;
  type: string;
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  width: "full" | "half";
}

export interface FormDefinition {
  id: string;
  name: string;
  fields: FormField[];
  status: "active" | "draft";
  createdAt: string;
}

interface FormsStore {
  forms: FormDefinition[];
  activeFormId: string;
  addForm: (form: FormDefinition) => void;
  deleteForm: (id: string) => void;
  setActiveForm: (id: string) => void;
  addField: (formId: string, field: FormField) => void;
  updateField: (formId: string, fieldId: string, updates: Partial<FormField>) => void;
  deleteField: (formId: string, fieldId: string) => void;
  reorderField: (formId: string, fieldId: string, direction: "up" | "down") => void;
  updateFormStatus: (formId: string, status: "active" | "draft") => void;
}

const defaultForms: FormDefinition[] = [
  {
    id: "contact",
    name: "Iletisim Formu",
    status: "active",
    createdAt: "2026-04-01T10:00:00Z",
    fields: [
      { id: "1", type: "text", label: "Ad Soyad", name: "full_name", required: true, placeholder: "Adiniz ve soyadiniz", width: "full" },
      { id: "2", type: "email", label: "E-posta", name: "email", required: true, placeholder: "ornek@email.com", width: "half" },
      { id: "3", type: "text", label: "Telefon", name: "phone", required: false, placeholder: "+90", width: "half" },
      { id: "4", type: "select", label: "Konu", name: "subject", required: true, options: ["Genel", "Destek", "Satis", "Diger"], width: "full" },
      { id: "5", type: "textarea", label: "Mesaj", name: "message", required: true, placeholder: "Mesajinizi yazin...", width: "full" },
    ],
  },
  {
    id: "register",
    name: "Kayit Formu",
    status: "active",
    createdAt: "2026-03-15T10:00:00Z",
    fields: [
      { id: "r1", type: "text", label: "Ad", name: "first_name", required: true, placeholder: "Adiniz", width: "half" },
      { id: "r2", type: "text", label: "Soyad", name: "last_name", required: true, placeholder: "Soyadiniz", width: "half" },
      { id: "r3", type: "email", label: "E-posta", name: "email", required: true, placeholder: "ornek@email.com", width: "full" },
      { id: "r4", type: "text", label: "Sifre", name: "password", required: true, placeholder: "En az 8 karakter", width: "half" },
      { id: "r5", type: "text", label: "Sifre Tekrar", name: "password_confirm", required: true, placeholder: "Sifrenizi tekrarlayin", width: "half" },
      { id: "r6", type: "toggle", label: "Kosullari kabul ediyorum", name: "terms", required: true, width: "full" },
    ],
  },
  {
    id: "feedback",
    name: "Geri Bildirim",
    status: "draft",
    createdAt: "2026-05-01T10:00:00Z",
    fields: [
      { id: "fb1", type: "text", label: "Baslik", name: "title", required: true, placeholder: "Konu basligi", width: "full" },
      { id: "fb2", type: "select", label: "Tur", name: "type", required: true, options: ["Bug", "Feature", "Improvement"], width: "half" },
      { id: "fb3", type: "select", label: "Oncelik", name: "priority", required: true, options: ["Low", "Medium", "High"], width: "half" },
      { id: "fb4", type: "textarea", label: "Aciklama", name: "description", required: true, placeholder: "Detayli aciklama...", width: "full" },
    ],
  },
];

export const useFormsStore = create<FormsStore>()(
  persist(
    (set) => ({
      forms: defaultForms,
      activeFormId: "contact",

      addForm: (form) =>
        set((state) => ({ forms: [...state.forms, form] })),

      deleteForm: (id) =>
        set((state) => ({
          forms: state.forms.filter((f) => f.id !== id),
          activeFormId: state.activeFormId === id ? (state.forms[0]?.id ?? "") : state.activeFormId,
        })),

      setActiveForm: (id) => set({ activeFormId: id }),

      addField: (formId, field) =>
        set((state) => ({
          forms: state.forms.map((f) =>
            f.id === formId ? { ...f, fields: [...f.fields, field] } : f
          ),
        })),

      updateField: (formId, fieldId, updates) =>
        set((state) => ({
          forms: state.forms.map((f) =>
            f.id === formId
              ? { ...f, fields: f.fields.map((fi) => (fi.id === fieldId ? { ...fi, ...updates } : fi)) }
              : f
          ),
        })),

      deleteField: (formId, fieldId) =>
        set((state) => ({
          forms: state.forms.map((f) =>
            f.id === formId ? { ...f, fields: f.fields.filter((fi) => fi.id !== fieldId) } : f
          ),
        })),

      reorderField: (formId, fieldId, direction) =>
        set((state) => ({
          forms: state.forms.map((f) => {
            if (f.id !== formId) return f;
            const idx = f.fields.findIndex((fi) => fi.id === fieldId);
            if (idx === -1) return f;
            const newIdx = direction === "up" ? idx - 1 : idx + 1;
            if (newIdx < 0 || newIdx >= f.fields.length) return f;
            const fields = [...f.fields];
            [fields[idx], fields[newIdx]] = [fields[newIdx], fields[idx]];
            return { ...f, fields };
          }),
        })),

      updateFormStatus: (formId, status) =>
        set((state) => ({
          forms: state.forms.map((f) => (f.id === formId ? { ...f, status } : f)),
        })),
    }),
    { name: "metapanel-forms" }
  )
);
