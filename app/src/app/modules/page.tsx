"use client";

import { useState } from "react";
import {
  Puzzle,
  Plus,
  Settings,
  Power,
  PowerOff,
  Search,
  Box,
  Shield,
  Image,
  Globe,
  ShoppingCart,
  Mail,
  BarChart3,
  FileText,
  Wand2,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useModuleStore, Module } from "@/stores/module-store";
import { useActivityStore } from "@/stores/activity-store";
import { useToastStore } from "@/stores/toast-store";

const iconMap: Record<string, React.ElementType> = {
  Box, Shield, Image, Globe, ShoppingCart, Mail, BarChart3, FileText,
};

export default function ModulesPage() {
  const { modules, toggleModule, addModule } = useModuleStore();
  const { addActivity } = useActivityStore();
  const { addToast } = useToastStore();

  const [filter, setFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [search, setSearch] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const filtered = modules.filter((m) => {
    if (filter === "enabled" && !m.enabled) return false;
    if (filter === "disabled" && m.enabled) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleToggle = (mod: Module) => {
    if (mod.id === "core") return;
    toggleModule(mod.id);
    const newState = !mod.enabled;
    addActivity({
      action: newState ? "Modul etkinlestirildi" : "Modul devre disi birakildi",
      target: `${mod.name} v${mod.version}`,
      user: "admin",
      type: "module",
    });
    addToast(
      newState ? `${mod.name} etkinlestirildi` : `${mod.name} devre disi birakildi`,
      newState ? "success" : "info"
    );
  };

  const handleAddModule = () => {
    if (!newName.trim() || !newSlug.trim()) {
      addToast("Ad ve slug alanlari zorunludur", "error");
      return;
    }
    const exists = modules.some((m) => m.slug === newSlug.trim());
    if (exists) {
      addToast("Bu slug zaten kullaniliyor", "error");
      return;
    }
    const mod: Module = {
      id: newSlug.trim(),
      name: newName.trim(),
      slug: newSlug.trim(),
      version: "0.1.0",
      description: newDescription.trim(),
      enabled: false,
      dependencies: ["core"],
      icon: "Box",
      category: newCategory.trim() || "Custom",
    };
    addModule(mod);
    addActivity({
      action: "Yeni modul eklendi",
      target: mod.name,
      user: "admin",
      type: "module",
    });
    addToast(`${mod.name} modulu eklendi`, "success");
    setNewName("");
    setNewSlug("");
    setNewDescription("");
    setNewCategory("");
    setShowNewForm(false);
  };

  const enabledCount = modules.filter((m) => m.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modules</h1>
          <p className="text-sm text-white/50">
            {enabledCount} / {modules.length} modul aktif
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Wand2 className="mr-2 h-3 w-3" />
            AI ile Scaffold
          </Button>
          <Button
            size="sm"
            className="flex-1 sm:flex-none"
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
                Yeni Modul
              </>
            )}
          </Button>
        </div>
      </div>

      {/* New Module Form */}
      {showNewForm && (
        <Card className="border-indigo-600/30">
          <CardContent className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-white/80">Yeni Modul Ekle</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                placeholder="Modul adi"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (!newSlug || newSlug === newName.toLowerCase().replace(/\s+/g, "-")) {
                    setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }
                }}
              />
              <Input
                placeholder="Slug (ornek: my-module)"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
              />
              <Input
                placeholder="Aciklama"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="sm:col-span-2"
              />
              <Input
                placeholder="Kategori (varsayilan: Custom)"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <div className="flex justify-end sm:items-end">
                <Button size="sm" onClick={handleAddModule}>
                  <Plus className="mr-2 h-3 w-3" />
                  Ekle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Modul ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex rounded-lg border border-white/[0.08] p-0.5">
          {(["all", "enabled", "disabled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-white/[0.08] text-white/90"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {f === "all" ? "Tumu" : f === "enabled" ? "Aktif" : "Pasif"}
            </button>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((mod) => {
          const Icon = iconMap[mod.icon] || Box;
          return (
            <Card
              key={mod.id}
              className={`transition-colors ${
                mod.enabled ? "border-white/[0.08]" : "border-white/[0.06] opacity-60"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        mod.enabled
                          ? "bg-indigo-600/10 text-indigo-400"
                          : "bg-white/[0.08] text-white/40"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white/90">{mod.name}</h3>
                      <p className="text-xs text-white/40">v{mod.version}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggle(mod)}
                    disabled={mod.id === "core"}
                  >
                    {mod.enabled ? (
                      <Power className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <PowerOff className="h-4 w-4 text-white/40" />
                    )}
                  </Button>
                </div>

                <p className="mt-3 text-sm text-white/50">{mod.description}</p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {mod.dependencies.map((dep) => (
                      <Badge key={dep} variant="secondary" className="text-[10px]">
                        {dep}
                      </Badge>
                    ))}
                    {mod.dependencies.length === 0 && (
                      <Badge variant="outline" className="text-[10px]">no deps</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px]">{mod.category}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
