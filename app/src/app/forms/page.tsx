"use client";

import { useState } from "react";
import {
  Layers,
  Plus,
  GripVertical,
  Trash2,
  Settings,
  Eye,
  Code,
  Wand2,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  Mail,
  AlignLeft,
  List,
  Link2,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFormsStore, FormField, FormDefinition } from "@/stores/forms-store";
import { useActivityStore } from "@/stores/activity-store";
import { useToastStore } from "@/stores/toast-store";

const fieldIcons: Record<string, React.ElementType> = {
  text: Type,
  number: Hash,
  date: Calendar,
  toggle: ToggleLeft,
  email: Mail,
  textarea: AlignLeft,
  select: List,
  url: Link2,
};

const fieldTypes = ["text", "email", "number", "textarea", "select", "date", "toggle", "url"];

function generateFormSchema(fields: FormField[]): string {
  const lines = [
    'import { z } from "zod";',
    "",
    "const formSchema = z.object({",
  ];
  for (const f of fields) {
    let validator = "z.string()";
    if (f.type === "number") validator = "z.number()";
    if (f.type === "email") validator = "z.string().email()";
    if (f.type === "date") validator = "z.date()";
    if (f.type === "toggle") validator = "z.boolean()";
    if (f.type === "url") validator = "z.string().url()";
    if (f.type === "select" && f.options) {
      validator = `z.enum([${f.options.map((o) => `"${o}"`).join(", ")}])`;
    }
    if (!f.required && f.type !== "toggle") validator += ".optional()";
    lines.push(`  ${f.name}: ${validator},`);
  }
  lines.push("});");
  return lines.join("\n");
}

export default function FormsPage() {
  const {
    forms,
    activeFormId,
    setActiveForm,
    addForm,
    addField,
    deleteField,
  } = useFormsStore();
  const { addActivity } = useActivityStore();
  const { addToast } = useToastStore();

  const [viewMode, setViewMode] = useState<"builder" | "preview" | "code">("builder");

  // New form inline state
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFormName, setNewFormName] = useState("");

  // New field inline state
  const [showNewField, setShowNewField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldWidth, setNewFieldWidth] = useState<"full" | "half">("full");

  const activeForm = forms.find((f) => f.id === activeFormId) || forms[0];
  const fields = activeForm?.fields || [];

  const handleAddForm = () => {
    if (!newFormName.trim()) {
      addToast("Form adi zorunludur", "error");
      return;
    }
    const id = newFormName.trim().toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const form: FormDefinition = {
      id,
      name: newFormName.trim(),
      fields: [],
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    addForm(form);
    setActiveForm(id);
    addActivity({
      action: "Yeni form olusturuldu",
      target: form.name,
      user: "admin",
      type: "form",
    });
    addToast(`${form.name} formu olusturuldu`, "success");
    setNewFormName("");
    setShowNewForm(false);
  };

  const handleAddField = () => {
    if (!activeForm) return;
    if (!newFieldLabel.trim() || !newFieldName.trim()) {
      addToast("Label ve name alanlari zorunludur", "error");
      return;
    }
    const field: FormField = {
      id: `f${Date.now()}`,
      type: newFieldType,
      label: newFieldLabel.trim(),
      name: newFieldName.trim(),
      required: newFieldRequired,
      width: newFieldWidth,
    };
    addField(activeForm.id, field);
    addActivity({
      action: "Form alani eklendi",
      target: `${activeForm.name} / ${field.label}`,
      user: "admin",
      type: "form",
    });
    addToast(`${field.label} alani eklendi`, "success");
    setNewFieldLabel("");
    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldRequired(false);
    setNewFieldWidth("full");
    setShowNewField(false);
  };

  const handleDeleteField = (fieldId: string) => {
    if (!activeForm) return;
    const field = fields.find((f) => f.id === fieldId);
    deleteField(activeForm.id, fieldId);
    addActivity({
      action: "Form alani silindi",
      target: `${activeForm.name} / ${field?.label || fieldId}`,
      user: "admin",
      type: "form",
    });
    addToast(`${field?.label || "Alan"} silindi`, "info");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Custom Forms</h1>
          <p className="text-sm text-white/50">Form builder ve validation schema yonetimi</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-white/[0.08] p-0.5">
            {(["builder", "preview", "code"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 ${
                  viewMode === m ? "bg-white/[0.08] text-white" : "text-white/40 hover:text-white/60"
                }`}
              >
                {m === "builder" && <Layers className="h-3 w-3" />}
                {m === "preview" && <Eye className="h-3 w-3" />}
                {m === "code" && <Code className="h-3 w-3" />}
                <span className="hidden sm:inline">{m === "builder" ? "Builder" : m === "preview" ? "Preview" : "Schema"}</span>
              </button>
            ))}
          </div>
          <Button
            size="sm"
            onClick={() => setShowNewForm(!showNewForm)}
          >
            {showNewForm ? (
              <>
                <X className="mr-2 h-3 w-3" />
                Iptal
              </>
            ) : (
              <>
                <Plus className="mr-2 h-3 w-3" />
                Yeni Form
              </>
            )}
          </Button>
        </div>
      </div>

      {/* New Form Inline */}
      {showNewForm && (
        <Card className="border-indigo-600/30">
          <CardContent className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-white/80">Yeni Form Olustur</h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Form adi"
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => e.key === "Enter" && handleAddForm()}
              />
              <Button size="sm" onClick={handleAddForm}>
                <Plus className="mr-2 h-3 w-3" />
                Olustur
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Form List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Formlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {forms.map((form) => (
              <button
                key={form.id}
                onClick={() => setActiveForm(form.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeFormId === form.id
                    ? "bg-indigo-600/10 text-indigo-400"
                    : "text-white/60 hover:bg-white/[0.08]"
                }`}
              >
                <div>
                  <p className="font-medium">{form.name}</p>
                  <p className="text-xs text-white/40">{form.fields.length} fields</p>
                </div>
                <Badge variant={form.status === "active" ? "success" : "secondary"} className="text-[10px]">
                  {form.status}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Form Editor */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{activeForm?.name || "Form Sec"}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
                  <Wand2 className="mr-1 h-3 w-3" />
                  AI Field
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none text-xs"
                  onClick={() => setShowNewField(!showNewField)}
                >
                  {showNewField ? (
                    <>
                      <X className="mr-1 h-3 w-3" />
                      Iptal
                    </>
                  ) : (
                    <>
                      <Plus className="mr-1 h-3 w-3" />
                      Field Ekle
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* New Field Inline Form */}
            {showNewField && activeForm && (
              <div className="mb-4 rounded-lg border border-indigo-600/30 p-4">
                <h4 className="mb-3 text-sm font-semibold text-white/80">Yeni Alan Ekle</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Input
                    placeholder="Label (ornek: Ad Soyad)"
                    value={newFieldLabel}
                    onChange={(e) => {
                      setNewFieldLabel(e.target.value);
                      if (!newFieldName || newFieldName === newFieldLabel.toLowerCase().replace(/\s+/g, "_")) {
                        setNewFieldName(e.target.value.toLowerCase().replace(/\s+/g, "_"));
                      }
                    }}
                  />
                  <Input
                    placeholder="Name (ornek: full_name)"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                  />
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value)}
                    className="rounded-md border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm text-white/80"
                  >
                    {fieldTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-sm text-white/60">
                    <input
                      type="checkbox"
                      checked={newFieldRequired}
                      onChange={(e) => setNewFieldRequired(e.target.checked)}
                      className="rounded border-neutral-600"
                    />
                    Required
                  </label>
                  <select
                    value={newFieldWidth}
                    onChange={(e) => setNewFieldWidth(e.target.value as "full" | "half")}
                    className="rounded-md border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm text-white/80"
                  >
                    <option value="full">Full width</option>
                    <option value="half">Half width</option>
                  </select>
                  <Button size="sm" onClick={handleAddField}>
                    <Plus className="mr-2 h-3 w-3" />
                    Ekle
                  </Button>
                </div>
              </div>
            )}

            {viewMode === "builder" && (
              <div className="space-y-2">
                {fields.length === 0 && (
                  <p className="py-8 text-center text-sm text-white/40">
                    Henuz alan eklenmemis. &quot;Field Ekle&quot; butonunu kullanin.
                  </p>
                )}
                {fields.map((field) => {
                  const Icon = fieldIcons[field.type] || Type;
                  return (
                    <div
                      key={field.id}
                      className="group flex items-center gap-3 rounded-lg border border-white/[0.08] p-3 hover:border-white/[0.12]"
                    >
                      <GripVertical className="h-4 w-4 cursor-grab text-white/15 group-hover:text-white/40" />
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-white/[0.08]">
                        <Icon className="h-4 w-4 text-white/50" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white/80">{field.label}</span>
                          <code className="text-[10px] text-white/40 font-mono">{field.name}</code>
                          {field.required && (
                            <Badge variant="destructive" className="text-[10px]">required</Badge>
                          )}
                        </div>
                        <p className="text-xs text-white/40">
                          {field.type} {field.width === "half" ? "* 50% width" : "* full width"}
                          {field.placeholder && ` * "${field.placeholder}"`}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{field.type}</Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => handleDeleteField(field.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === "preview" && (
              <div className="mx-auto max-w-lg space-y-4 rounded-lg border border-white/[0.08] bg-white/[0.02] p-6">
                <h3 className="text-lg font-semibold">{activeForm?.name || "Preview"}</h3>
                {fields.length === 0 && (
                  <p className="py-4 text-center text-sm text-white/40">Henuz alan yok.</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div key={field.id} className={field.width === "full" ? "col-span-2" : "col-span-1"}>
                      <label className="mb-1.5 block text-sm font-medium text-white/60">
                        {field.label}
                        {field.required && <span className="ml-1 text-red-400">*</span>}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          placeholder={field.placeholder}
                          className="w-full rounded-md border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm text-white/80 placeholder:text-white/40"
                          rows={3}
                        />
                      ) : field.type === "select" ? (
                        <select className="w-full rounded-md border border-white/[0.12] bg-white/[0.08] px-3 py-2 text-sm text-white/80">
                          <option value="">Secin...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === "toggle" ? (
                        <div className="flex items-center gap-2">
                          <input type="checkbox" className="rounded border-neutral-600" />
                          <span className="text-sm text-white/50">{field.label}</span>
                        </div>
                      ) : (
                        <Input type={field.type} placeholder={field.placeholder} />
                      )}
                    </div>
                  ))}
                </div>
                {fields.length > 0 && <Button className="w-full">Gonder</Button>}
              </div>
            )}

            {viewMode === "code" && (
              <pre className="rounded-lg bg-white/[0.02] p-4 text-xs font-mono text-white/60 overflow-auto">
                <code>{fields.length > 0 ? generateFormSchema(fields) : "// Henuz alan eklenmemis"}</code>
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
