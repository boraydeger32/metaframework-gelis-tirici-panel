"use client";

import { useState } from "react";
import {
  Database,
  Plus,
  Trash2,
  Code,
  Eye,
  Save,
  Wand2,
  GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSchemaStore, type SchemaModel, type SchemaField, type FieldType } from "@/stores/schema-store";
import { useActivityStore } from "@/stores/activity-store";
import { useToastStore } from "@/stores/toast-store";

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: "string", label: "String" },
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "json", label: "JSON" },
  { value: "relation", label: "Relation" },
  { value: "enum", label: "Enum" },
  { value: "computed", label: "Computed" },
];

function generateTypeScript(model: SchemaModel): string {
  const lines = [`interface ${model.name} {`];
  for (const f of model.fields) {
    const tsType = {
      string: "string",
      text: "string",
      number: "number",
      boolean: "boolean",
      date: "Date",
      email: "string",
      url: "string",
      json: "Record<string, unknown>",
      relation: f.relationModel || "unknown",
      enum: f.enumValues ? f.enumValues.map((v) => `"${v}"`).join(" | ") : "string",
      computed: "unknown",
    }[f.type];
    lines.push(`  ${f.name}${f.required ? "" : "?"}: ${tsType};`);
  }
  if (model.timestamps) {
    lines.push("  createdAt: Date;");
    lines.push("  updatedAt: Date;");
  }
  if (model.softDelete) {
    lines.push("  deletedAt?: Date | null;");
  }
  lines.push("}");
  return lines.join("\n");
}

export default function SchemaPage() {
  const models = useSchemaStore((s) => s.models);
  const activeModelId = useSchemaStore((s) => s.activeModelId);
  const setActiveModel = useSchemaStore((s) => s.setActiveModel);
  const addModel = useSchemaStore((s) => s.addModel);
  const deleteModel = useSchemaStore((s) => s.deleteModel);
  const addField = useSchemaStore((s) => s.addField);
  const deleteField = useSchemaStore((s) => s.deleteField);

  const addActivity = useActivityStore((s) => s.addActivity);
  const addToast = useToastStore((s) => s.addToast);

  const activeModel = models.find((m) => m.id === activeModelId) || models[0] || null;

  const [viewMode, setViewMode] = useState<"ui" | "code">("ui");
  const [aiPrompt, setAiPrompt] = useState("");

  // New model form state
  const [showNewModelForm, setShowNewModelForm] = useState(false);
  const [newModelName, setNewModelName] = useState("");

  // New field form state
  const [showNewFieldForm, setShowNewFieldForm] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<FieldType>("string");
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  const handleAddModel = () => {
    const name = newModelName.trim();
    if (!name) return;

    const id = name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    const tableName = name.toLowerCase().replace(/\s+/g, "_") + "s";

    const newModel: SchemaModel = {
      id,
      name,
      tableName,
      fields: [],
      timestamps: true,
      softDelete: false,
      description: "",
      createdAt: new Date().toISOString(),
    };

    addModel(newModel);
    setActiveModel(id);
    setNewModelName("");
    setShowNewModelForm(false);

    addActivity({ action: "Model olusturuldu", target: name, user: "admin", type: "schema" });
    addToast(`"${name}" modeli olusturuldu`, "success");
  };

  const handleDeleteModel = (modelId: string, modelName: string) => {
    if (!confirm(`"${modelName}" modelini silmek istediginizden emin misiniz?`)) return;

    deleteModel(modelId);
    addActivity({ action: "Model silindi", target: modelName, user: "admin", type: "schema" });
    addToast(`"${modelName}" modeli silindi`, "success");
  };

  const handleAddField = () => {
    if (!activeModel) return;
    const name = newFieldName.trim();
    if (!name) return;

    const fieldId = "f_" + Date.now();
    const newField: SchemaField = {
      id: fieldId,
      name,
      type: newFieldType,
      required: newFieldRequired,
      unique: false,
      indexed: false,
    };

    addField(activeModel.id, newField);
    setNewFieldName("");
    setNewFieldType("string");
    setNewFieldRequired(false);
    setShowNewFieldForm(false);

    addActivity({ action: "Field eklendi", target: `${activeModel.name}.${name}`, user: "admin", type: "schema" });
    addToast(`"${name}" field'i eklendi`, "success");
  };

  const handleDeleteField = (fieldId: string, fieldName: string) => {
    if (!activeModel) return;

    deleteField(activeModel.id, fieldId);
    addActivity({ action: "Field silindi", target: `${activeModel.name}.${fieldName}`, user: "admin", type: "schema" });
    addToast(`"${fieldName}" field'i silindi`, "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schema Builder</h1>
          <p className="text-sm text-white/50">Model ve field tanimlarini yonetin</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "ui" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("ui")}
          >
            <Eye className="mr-2 h-3 w-3" />
            Visual
          </Button>
          <Button
            variant={viewMode === "code" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("code")}
          >
            <Code className="mr-2 h-3 w-3" />
            Code
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-3 w-3" />
            Kaydet
          </Button>
        </div>
      </div>

      {/* AI Prompt Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Wand2 className="hidden sm:block h-5 w-5 text-indigo-400 shrink-0" />
            <Input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder='AI: "Bir BlogPost modeli olustur..."'
              className="flex-1 border-indigo-900/50 bg-indigo-950/30"
            />
            <Button size="sm" className="w-full sm:w-auto shrink-0">
              <Wand2 className="mr-2 h-3 w-3" />
              Olustur
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Model List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Modeller</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowNewModelForm((v) => !v)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {showNewModelForm && (
              <div className="mb-2 space-y-2 rounded-lg border border-white/[0.08] p-2">
                <Input
                  value={newModelName}
                  onChange={(e) => setNewModelName(e.target.value)}
                  placeholder="Model adi..."
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddModel();
                    if (e.key === "Escape") setShowNewModelForm(false);
                  }}
                  autoFocus
                />
                <div className="flex gap-1">
                  <Button size="sm" className="h-7 flex-1 text-xs" onClick={handleAddModel}>
                    Ekle
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => { setShowNewModelForm(false); setNewModelName(""); }}
                  >
                    Iptal
                  </Button>
                </div>
              </div>
            )}
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => setActiveModel(model.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeModel?.id === model.id
                    ? "bg-indigo-600/10 text-indigo-400"
                    : "text-white/60 hover:bg-white/[0.08]"
                }`}
              >
                <Database className="h-4 w-4" />
                <div className="flex-1">
                  <p className="font-medium">{model.name}</p>
                  <p className="text-xs text-white/40">{model.fields.length} fields</p>
                </div>
              </button>
            ))}
            {models.length === 0 && (
              <p className="text-xs text-white/40 px-3 py-2">Henuz model yok.</p>
            )}
          </CardContent>
        </Card>

        {/* Field Editor */}
        <Card className="lg:col-span-3">
          {activeModel ? (
            <>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{activeModel.name}</CardTitle>
                    <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                      <span>Tablo: <code className="rounded bg-white/[0.08] px-1.5 py-0.5">{activeModel.tableName}</code></span>
                      {activeModel.timestamps && <Badge variant="secondary">timestamps</Badge>}
                      {activeModel.softDelete && <Badge variant="secondary">soft-delete</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNewFieldForm((v) => !v)}
                    >
                      <Plus className="mr-2 h-3 w-3" />
                      Field Ekle
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteModel(activeModel.id, activeModel.name)}
                    >
                      <Trash2 className="mr-2 h-3 w-3" />
                      Sil
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {showNewFieldForm && (
                  <div className="mb-4 flex flex-col gap-3 rounded-lg border border-white/[0.08] p-3 sm:flex-row sm:items-end">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-white/50">Field Adi</label>
                      <Input
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="field_name"
                        className="h-8 text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddField();
                          if (e.key === "Escape") setShowNewFieldForm(false);
                        }}
                        autoFocus
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-white/50">Tip</label>
                      <select
                        value={newFieldType}
                        onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                        className="h-8 rounded-md border border-white/[0.08] bg-white/[0.04] px-2 text-sm text-white/80"
                      >
                        {fieldTypes.map((ft) => (
                          <option key={ft.value} value={ft.value}>{ft.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-white/50">
                        <input
                          type="checkbox"
                          checked={newFieldRequired}
                          onChange={(e) => setNewFieldRequired(e.target.checked)}
                          className="rounded"
                        />
                        Required
                      </label>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" className="h-8 text-xs" onClick={handleAddField}>
                        Ekle
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={() => { setShowNewFieldForm(false); setNewFieldName(""); }}
                      >
                        Iptal
                      </Button>
                    </div>
                  </div>
                )}

                {viewMode === "ui" ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.08] text-left text-xs text-white/40">
                          <th className="w-8 pb-3"></th>
                          <th className="pb-3 font-medium">Field Name</th>
                          <th className="pb-3 font-medium">Type</th>
                          <th className="pb-3 font-medium text-center">Required</th>
                          <th className="pb-3 font-medium text-center">Unique</th>
                          <th className="pb-3 font-medium text-center">Indexed</th>
                          <th className="pb-3 font-medium">Extra</th>
                          <th className="w-10 pb-3"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {activeModel.fields.map((field) => (
                          <tr key={field.id} className="group hover:bg-white/[0.04]">
                            <td className="py-3 pr-2">
                              <GripVertical className="h-4 w-4 cursor-grab text-white/15 group-hover:text-white/40" />
                            </td>
                            <td className="py-3">
                              <code className="font-mono text-sm text-white/80">{field.name}</code>
                            </td>
                            <td className="py-3">
                              <Badge variant="outline">{field.type}</Badge>
                            </td>
                            <td className="py-3 text-center">
                              {field.required ? (
                                <span className="text-emerald-400">&#10003;</span>
                              ) : (
                                <span className="text-white/25">-</span>
                              )}
                            </td>
                            <td className="py-3 text-center">
                              {field.unique ? (
                                <span className="text-amber-400">&#10003;</span>
                              ) : (
                                <span className="text-white/25">-</span>
                              )}
                            </td>
                            <td className="py-3 text-center">
                              {field.indexed ? (
                                <span className="text-indigo-400">&#10003;</span>
                              ) : (
                                <span className="text-white/25">-</span>
                              )}
                            </td>
                            <td className="py-3">
                              {field.enumValues && (
                                <span className="text-xs text-white/40">
                                  [{field.enumValues.join(", ")}]
                                </span>
                              )}
                              {field.relationModel && (
                                <span className="text-xs text-indigo-400">
                                  &rarr; {field.relationModel}
                                </span>
                              )}
                            </td>
                            <td className="py-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                onClick={() => handleDeleteField(field.id, field.name)}
                              >
                                <Trash2 className="h-3 w-3 text-red-400" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {activeModel.fields.length === 0 && (
                          <tr>
                            <td colSpan={8} className="py-6 text-center text-sm text-white/40">
                              Henuz field eklenmemis. &quot;Field Ekle&quot; butonunu kullanin.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg bg-white/[0.02] p-4">
                    <pre className="font-mono text-sm text-white/60">
                      <code>{generateTypeScript(activeModel)}</code>
                    </pre>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-sm text-white/40">Model secin veya yeni bir model olusturun.</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
