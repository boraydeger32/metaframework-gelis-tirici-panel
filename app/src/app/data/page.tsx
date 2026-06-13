"use client";

import { useState, useMemo } from "react";
import {
  List,
  Columns3,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  Eye,
  Download,
  Upload,
  Plus,
  X,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSchemaStore, type SchemaField } from "@/stores/schema-store";
import { useToastStore } from "@/stores/toast-store";

type ViewMode = "list" | "kanban" | "calendar";

interface DataRow {
  id: string;
  [key: string]: string;
}

const ROWS_PER_PAGE = 8;

// ---- Fake data generators by field type ----

const fakeNames = ["Ahmet Yilmaz", "Ayse Demir", "Mehmet Kaya", "Fatma Celik", "Ali Ozturk", "Zeynep Arslan", "Emre Yildiz", "Selin Koc", "Burak Can", "Deniz Acar", "Ece Sahin", "Mert Polat"];
const fakeDomains = ["example.com", "test.io", "firma.co", "demo.org"];
const fakeTexts = ["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit", "Sed do eiusmod tempor", "Ut enim ad minim veniam", "Duis aute irure dolor", "Excepteur sint occaecat"];
const fakeTitles = ["Premium Urun", "Standart Paket", "Ozel Koleksiyon", "Limited Edition", "Temel Plan", "Pro Versiyon", "Enterprise", "Starter Kit", "Gold Paket", "Silver Paket", "Bronze Paket", "Diamond"];
const fakeSlugs = ["premium-urun", "standart-paket", "ozel-koleksiyon", "limited-edition", "temel-plan", "pro-versiyon", "enterprise", "starter-kit", "gold-paket", "silver-paket", "bronze-paket", "diamond"];
const fakeOrderNums = ["ORD-001", "ORD-002", "ORD-003", "ORD-004", "ORD-005", "ORD-006", "ORD-007", "ORD-008", "ORD-009", "ORD-010", "ORD-011", "ORD-012"];
const fakeUrls = ["https://example.com", "https://test.io/page", "https://firma.co/about", "https://demo.org/home"];

function generateFieldValue(field: SchemaField, rowIndex: number): string {
  const i = rowIndex % 12;
  switch (field.type) {
    case "string":
      if (field.name.toLowerCase().includes("name") || field.name.toLowerCase().includes("ad"))
        return fakeNames[i];
      if (field.name.toLowerCase().includes("slug"))
        return fakeSlugs[i];
      if (field.name.toLowerCase().includes("title") || field.name.toLowerCase().includes("baslik"))
        return fakeTitles[i];
      if (field.name.toLowerCase().includes("order") || field.name.toLowerCase().includes("number"))
        return fakeOrderNums[i];
      return fakeTitles[i];
    case "email":
      return `${fakeNames[i].toLowerCase().replace(" ", ".")}@${fakeDomains[i % fakeDomains.length]}`;
    case "number":
      if (field.name.toLowerCase().includes("price") || field.name.toLowerCase().includes("fiyat"))
        return `${(Math.floor(Math.random() * 9000) + 100)}.00`;
      if (field.name.toLowerCase().includes("total") || field.name.toLowerCase().includes("toplam"))
        return `${(Math.floor(Math.random() * 50000) + 500)}.00`;
      return `${Math.floor(Math.random() * 1000)}`;
    case "boolean":
      return i % 2 === 0 ? "true" : "false";
    case "date":
      return `2026-${String((i % 6) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`;
    case "text":
      return fakeTexts[i % fakeTexts.length];
    case "url":
      return fakeUrls[i % fakeUrls.length];
    case "json":
      return `{ "key": "value_${i}" }`;
    case "enum":
      if (field.enumValues && field.enumValues.length > 0)
        return field.enumValues[i % field.enumValues.length];
      return "default";
    case "relation":
      return field.relationModel ? `${field.relationModel}#${i + 1}` : `ref_${i + 1}`;
    case "computed":
      return `computed_${i}`;
    default:
      return `value_${i}`;
  }
}

function generateRows(fields: SchemaField[], count: number): DataRow[] {
  return Array.from({ length: count }, (_, rowIndex) => {
    const row: DataRow = { id: String(rowIndex + 1) };
    fields.forEach((field) => {
      row[field.name] = generateFieldValue(field, rowIndex);
    });
    return row;
  });
}

// Status-like badge styling for enum fields
const statusColorMap: Record<string, "success" | "destructive" | "warning" | "secondary"> = {
  active: "success",
  admin: "default" as "secondary",
  editor: "secondary",
  viewer: "secondary",
  inactive: "destructive",
  pending: "warning",
  draft: "secondary",
  approved: "success",
  shipped: "success",
  completed: "success",
  cancelled: "destructive",
};


export default function DataPage() {
  const { models } = useSchemaStore();
  const { addToast } = useToastStore();

  const [activeModelId, setActiveModelId] = useState<string>(models[0]?.id ?? "");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterValue, setFilterValue] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newFormData, setNewFormData] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const activeModel = models.find((m) => m.id === activeModelId) ?? models[0];
  const fields = activeModel?.fields ?? [];

  // Find the first enum field (used for kanban grouping and filter buttons)
  const enumField = fields.find((f) => f.type === "enum" && f.enumValues && f.enumValues.length > 0);
  const enumValues = enumField?.enumValues ?? [];

  // Generate data for the active model
  const [dataMap, setDataMap] = useState<Record<string, DataRow[]>>({});

  const rows = useMemo(() => {
    if (!activeModel) return [];
    if (dataMap[activeModel.id]) return dataMap[activeModel.id];
    const generated = generateRows(fields, 12);
    // We can't call setDataMap here directly (side effect in render), so we use a lazy init approach
    return generated;
  }, [activeModel?.id, fields.length]);

  // Sync generated rows into dataMap
  useMemo(() => {
    if (activeModel && !dataMap[activeModel.id]) {
      setDataMap((prev) => ({ ...prev, [activeModel.id]: generateRows(fields, 12) }));
    }
  }, [activeModel?.id]);

  const currentRows = dataMap[activeModel?.id ?? ""] ?? rows;

  // Filtering
  const filtered = useMemo(() => {
    let result = currentRows;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((v) => v.toLowerCase().includes(q))
      );
    }
    if (filterValue && enumField) {
      result = result.filter((row) => row[enumField.name] === filterValue);
    }
    if (sortField) {
      result = [...result].sort((a, b) => {
        const aVal = a[sortField] ?? "";
        const bVal = b[sortField] ?? "";
        const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return result;
  }, [currentRows, search, filterValue, enumField, sortField, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRows = filtered.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE
  );

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === paginatedRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedRows.map((r) => r.id)));
    }
  };

  const deleteSelected = () => {
    if (!activeModel) return;
    const count = selectedRows.size;
    setDataMap((prev) => ({
      ...prev,
      [activeModel.id]: (prev[activeModel.id] ?? currentRows).filter(
        (r) => !selectedRows.has(r.id)
      ),
    }));
    setSelectedRows(new Set());
    addToast(`${count} kayit silindi`, "success");
  };

  const deleteRow = (id: string) => {
    if (!activeModel) return;
    setDataMap((prev) => ({
      ...prev,
      [activeModel.id]: (prev[activeModel.id] ?? currentRows).filter(
        (r) => r.id !== id
      ),
    }));
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    addToast("Kayit silindi", "success");
  };

  const handleNewRecord = () => {
    if (!activeModel) return;
    const newRow: DataRow = {
      id: `new_${Date.now()}`,
    };
    fields.forEach((f) => {
      newRow[f.name] = newFormData[f.name] || "";
    });
    setDataMap((prev) => ({
      ...prev,
      [activeModel.id]: [newRow, ...(prev[activeModel.id] ?? currentRows)],
    }));
    setNewFormData({});
    setShowNewForm(false);
    addToast("Yeni kayit eklendi", "success");
  };

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(fieldName);
      setSortDir("asc");
    }
  };

  const switchModel = (modelId: string) => {
    setActiveModelId(modelId);
    setSelectedRows(new Set());
    setSearch("");
    setFilterValue(null);
    setCurrentPage(1);
    setShowNewForm(false);
    setSortField(null);
  };

  if (!activeModel) {
    return (
      <div className="flex items-center justify-center py-20 text-white/40">
        <p className="text-sm">Henuz model tanimlanmamis. Schema sayfasindan model ekleyin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Manager</h1>
          <p className="text-sm text-white/50">
            Kayitlari goruntule, filtrele ve yonet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-3 w-3" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-3 w-3" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowNewForm(true)}>
            <Plus className="mr-2 h-3 w-3" />
            Yeni Kayit
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Model Selector */}
        <div className="flex overflow-x-auto rounded-lg border border-white/[0.08] p-0.5">
          {models.map((m) => (
            <button
              key={m.id}
              onClick={() => switchModel(m.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                activeModel.id === m.id
                  ? "bg-white/[0.08] text-white/90"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="sm:ml-auto flex items-center gap-1 rounded-lg border border-white/[0.08] p-0.5 self-end">
          {([
            { mode: "list" as ViewMode, icon: List, label: "List" },
            { mode: "kanban" as ViewMode, icon: Columns3, label: "Kanban" },
            { mode: "calendar" as ViewMode, icon: Calendar, label: "Calendar" },
          ]).map((v) => (
            <button
              key={v.mode}
              onClick={() => setViewMode(v.mode)}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                viewMode === v.mode
                  ? "bg-white/[0.08] text-white/90"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              <v.icon className="h-3 w-3" />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Kayit ara..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9"
          />
        </div>
        {enumValues.length > 0 && (
          <div className="flex items-center gap-1">
            <Filter className="h-3 w-3 text-white/40" />
            {enumValues.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setFilterValue(filterValue === s ? null : s);
                  setCurrentPage(1);
                }}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-medium border transition-colors",
                  filterValue === s
                    ? "border-indigo-600 bg-indigo-600/20 text-indigo-400"
                    : "border-white/[0.08] text-white/40 hover:text-white/60"
                )}
              >
                {s}
              </button>
            ))}
            {filterValue && (
              <button
                onClick={() => {
                  setFilterValue(null);
                  setCurrentPage(1);
                }}
                className="ml-1 text-white/25 hover:text-white/50"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
        <Badge variant="secondary" className="ml-auto text-[10px]">
          {filtered.length} kayit
        </Badge>
      </div>

      {/* Inline New Record Form */}
      {showNewForm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white/80">
                Yeni {activeModel.name} Kaydi
              </h3>
              <button
                onClick={() => {
                  setShowNewForm(false);
                  setNewFormData({});
                }}
                className="text-white/40 hover:text-white/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map((field) => (
                <div key={field.id}>
                  <label className="mb-1 block text-xs text-white/50">
                    {field.name}
                    {field.required && (
                      <span className="text-red-400 ml-0.5">*</span>
                    )}
                    <span className="ml-1 text-white/25">({field.type})</span>
                  </label>
                  {field.type === "enum" && field.enumValues ? (
                    <select
                      value={newFormData[field.name] || ""}
                      onChange={(e) =>
                        setNewFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-sm text-white/80 focus:border-indigo-600 focus:outline-none"
                    >
                      <option value="">Secin...</option>
                      {field.enumValues.map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "boolean" ? (
                    <select
                      value={newFormData[field.name] || ""}
                      onChange={(e) =>
                        setNewFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-sm text-white/80 focus:border-indigo-600 focus:outline-none"
                    >
                      <option value="">Secin...</option>
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  ) : (
                    <Input
                      type={
                        field.type === "number"
                          ? "number"
                          : field.type === "date"
                            ? "date"
                            : field.type === "email"
                              ? "email"
                              : field.type === "url"
                                ? "url"
                                : "text"
                      }
                      placeholder={field.name}
                      value={newFormData[field.name] || ""}
                      onChange={(e) =>
                        setNewFormData((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowNewForm(false);
                  setNewFormData({});
                }}
              >
                Iptal
              </Button>
              <Button size="sm" onClick={handleNewRecord}>
                <Check className="mr-1 h-3 w-3" />
                Kaydet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-indigo-800/30 bg-indigo-950/20 px-4 py-2 animate-in">
          <span className="text-xs text-indigo-400">
            {selectedRows.size} kayit secildi
          </span>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-7">
              <Pencil className="mr-1 h-3 w-3" />
              Duzenle
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7">
              <Download className="mr-1 h-3 w-3" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 text-red-400 hover:text-red-300"
              onClick={deleteSelected}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Sil
            </Button>
            <button
              onClick={() => setSelectedRows(new Set())}
              className="text-white/40 hover:text-white/60 ml-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-left text-xs text-white/40">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={
                          selectedRows.size === paginatedRows.length &&
                          paginatedRows.length > 0
                        }
                        onChange={toggleAll}
                        className="rounded border-white/[0.12]"
                      />
                    </th>
                    <th className="px-4 py-3 font-medium text-white/40">
                      #
                    </th>
                    {fields.map((f) => (
                      <th
                        key={f.id}
                        className="px-4 py-3 font-medium cursor-pointer hover:text-white/60"
                        onClick={() => handleSort(f.name)}
                      >
                        <span className="flex items-center gap-1">
                          {f.name}
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </th>
                    ))}
                    <th className="w-10 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {paginatedRows.map((row) => (
                    <tr
                      key={row.id}
                      className={cn(
                        "group transition-colors hover:bg-white/[0.04]",
                        selectedRows.has(row.id) && "bg-indigo-950/20"
                      )}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={() => toggleRow(row.id)}
                          className="rounded border-white/[0.12]"
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-white/25">
                        {row.id}
                      </td>
                      {fields.map((f) => (
                        <td key={f.id} className="px-4 py-3">
                          {f.type === "enum" ? (
                            <Badge
                              variant={
                                statusColorMap[row[f.name]] || "secondary"
                              }
                              className="text-[10px]"
                            >
                              {row[f.name]}
                            </Badge>
                          ) : f.type === "email" ? (
                            <span className="text-white/50 font-mono text-xs">
                              {row[f.name]}
                            </span>
                          ) : f.type === "number" ? (
                            <span className="text-white/60 font-mono text-xs">
                              {row[f.name]}
                            </span>
                          ) : f.type === "boolean" ? (
                            <Badge
                              variant={
                                row[f.name] === "true"
                                  ? "success"
                                  : "secondary"
                              }
                              className="text-[10px]"
                            >
                              {row[f.name]}
                            </Badge>
                          ) : f.type === "relation" ? (
                            <Badge variant="outline" className="text-[10px]">
                              {row[f.name]}
                            </Badge>
                          ) : (
                            <span className="text-white/80 text-xs">
                              {row[f.name]?.length > 40
                                ? row[f.name].slice(0, 40) + "..."
                                : row[f.name]}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="rounded p-1 hover:bg-white/[0.12]">
                            <Eye className="h-3 w-3 text-white/50" />
                          </button>
                          <button className="rounded p-1 hover:bg-white/[0.12]">
                            <Pencil className="h-3 w-3 text-white/50" />
                          </button>
                          <button
                            className="rounded p-1 hover:bg-white/[0.12]"
                            onClick={() => deleteRow(row.id)}
                          >
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedRows.length === 0 && (
                    <tr>
                      <td
                        colSpan={fields.length + 3}
                        className="px-4 py-8 text-center text-sm text-white/40"
                      >
                        Kayit bulunamadi
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3">
              <span className="text-xs text-white/40">
                {(safePage - 1) * ROWS_PER_PAGE + 1}-
                {Math.min(safePage * ROWS_PER_PAGE, filtered.length)} /{" "}
                {filtered.length} toplam
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <span className="px-3 text-xs text-white/50">
                  Sayfa {safePage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {enumField && enumValues.length > 0 ? (
            enumValues.slice(0, 6).map((val, idx) => {
              const colColors = [
                "border-emerald-600/30",
                "border-amber-600/30",
                "border-red-600/30",
                "border-blue-600/30",
                "border-purple-600/30",
                "border-cyan-600/30",
              ];
              const colRows = filtered.filter(
                (r) => r[enumField.name] === val
              );
              return (
                <div
                  key={val}
                  className={cn(
                    "rounded-xl border-t-2 bg-white/[0.04]/50 p-3",
                    colColors[idx % colColors.length]
                  )}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white/80">
                      {val}
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {colRows.length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {colRows.map((row) => {
                      const displayFields = fields.filter(
                        (f) => f.name !== enumField.name
                      );
                      const primaryField = displayFields[0];
                      const secondaryField = displayFields[1];
                      return (
                        <div
                          key={row.id}
                          className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3 hover:border-white/[0.12] transition-colors cursor-pointer"
                        >
                          <p className="text-sm font-medium text-white/80">
                            {primaryField ? row[primaryField.name] : row.id}
                          </p>
                          {secondaryField && (
                            <p className="mt-0.5 text-xs text-white/40 font-mono">
                              {row[secondaryField.name]}
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            <Badge variant="outline" className="text-[10px]">
                              #{row.id}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                    {colRows.length === 0 && (
                      <p className="text-xs text-white/25 text-center py-4">
                        Kayit yok
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-8 text-white/40 text-sm">
              Kanban gorunumu icin modelde enum alani gereklidir.
            </div>
          )}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === "calendar" && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-px rounded-lg border border-white/[0.08] bg-white/[0.08] overflow-hidden">
              {["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"].map((d) => (
                <div
                  key={d}
                  className="bg-white/[0.04] px-2 py-2 text-center text-[10px] font-medium text-white/40"
                >
                  {d}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 2;
                const dateStr =
                  day >= 1 && day <= 30
                    ? `2026-06-${String(day).padStart(2, "0")}`
                    : null;
                // Find date fields and match events
                const dateField = fields.find((f) => f.type === "date");
                const events = dateStr && dateField
                  ? filtered.filter((r) => r[dateField.name] === dateStr)
                  : [];
                const primaryField = fields.find(
                  (f) => f.type !== "date"
                );
                const today = 14; // current date marker
                return (
                  <div
                    key={i}
                    className={cn(
                      "min-h-[80px] bg-white/[0.02] p-1.5",
                      day === today && "ring-1 ring-indigo-600 ring-inset"
                    )}
                  >
                    {day >= 1 && day <= 30 && (
                      <>
                        <span
                          className={cn(
                            "text-[10px]",
                            day === today
                              ? "font-bold text-indigo-400"
                              : "text-white/25"
                          )}
                        >
                          {day}
                        </span>
                        {events.map((e) => (
                          <div
                            key={e.id}
                            className="mt-0.5 rounded bg-indigo-600/20 px-1 py-0.5 text-[9px] text-indigo-400 truncate"
                          >
                            {primaryField
                              ? e[primaryField.name]
                              : `#${e.id}`}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
