"use client";

import { useState } from "react";
import { Plus, Check, X, Wand2, Users, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePermissionsStore, MODELS, ACTIONS, type Role } from "@/stores/permissions-store";
import { useActivityStore } from "@/stores/activity-store";
import { useToastStore } from "@/stores/toast-store";

const ROLE_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-orange-500",
];

export default function PermissionsPage() {
  const {
    roles,
    permissions,
    activeRoleId,
    addRole,
    setActiveRole,
    togglePermission,
  } = usePermissionsStore();

  const addActivity = useActivityStore((s) => s.addActivity);
  const addToast = useToastStore((s) => s.addToast);

  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRoleColor, setNewRoleColor] = useState(ROLE_COLORS[0]);

  const activeRole = roles.find((r) => r.id === activeRoleId) || roles[0];
  const rolePermissions = activeRole ? (permissions[activeRole.slug] || {}) : {};
  const totalPerms = MODELS.reduce(
    (acc, m) => acc + ACTIONS.filter((a) => rolePermissions[m]?.[a]).length,
    0
  );
  const maxPerms = MODELS.length * ACTIONS.length;

  const handleTogglePermission = (model: string, action: string) => {
    if (!activeRole) return;
    togglePermission(activeRole.slug, model, action);
    const wasEnabled = rolePermissions[model]?.[action] ?? false;
    addActivity({
      action: wasEnabled ? "Yetki kaldirildi" : "Yetki verildi",
      target: `${activeRole.name}: ${model}.${action}`,
      user: "admin",
      type: "permission",
    });
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;

    const slug = newRoleName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const id = `role-${Date.now()}`;

    const newRole: Role = {
      id,
      name: newRoleName.trim(),
      slug,
      color: newRoleColor,
      userCount: 0,
      description: newRoleDescription.trim() || `${newRoleName.trim()} rolu`,
    };

    addRole(newRole);
    setActiveRole(id);

    addActivity({
      action: "Yeni rol olusturuldu",
      target: newRoleName.trim(),
      user: "admin",
      type: "permission",
    });
    addToast(`"${newRoleName.trim()}" rolu olusturuldu`, "success");

    setNewRoleName("");
    setNewRoleDescription("");
    setNewRoleColor(ROLE_COLORS[0]);
    setShowNewRoleForm(false);
  };

  const handleSave = () => {
    addToast("Yetki degisiklikleri kaydedildi", "success");
    addActivity({
      action: "Yetkiler kaydedildi",
      target: activeRole?.name || "",
      user: "admin",
      type: "permission",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Permissions & Roles</h1>
          <p className="text-sm text-white/50">Rol bazli erisim kontrolu (RBAC)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Wand2 className="mr-2 h-3 w-3" />
            AI ile Oner
          </Button>
          <Button
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => setShowNewRoleForm((v) => !v)}
          >
            <Plus className="mr-2 h-3 w-3" />
            Yeni Rol
          </Button>
        </div>
      </div>

      {/* New Role Inline Form */}
      {showNewRoleForm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-white/50">Rol Adi</label>
                <Input
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Ornek: Moderator"
                  className="text-sm"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-white/50">Aciklama</label>
                <Input
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Rol aciklamasi..."
                  className="text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-white/50">Renk</label>
                <div className="flex items-center gap-1.5">
                  {ROLE_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewRoleColor(color)}
                      className={cn(
                        "h-6 w-6 rounded-full transition-all",
                        color,
                        newRoleColor === color
                          ? "ring-2 ring-white ring-offset-2 ring-offset-neutral-900"
                          : "opacity-50 hover:opacity-80"
                      )}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddRole} disabled={!newRoleName.trim()}>
                  <Check className="mr-1 h-3 w-3" />
                  Ekle
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewRoleForm(false)}
                >
                  <X className="mr-1 h-3 w-3" />
                  Iptal
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveRole(role.id)}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              activeRoleId === role.id
                ? "border-indigo-600/50 bg-indigo-950/20 ring-1 ring-indigo-600/20"
                : "border-white/[0.08] bg-white/[0.04] hover:border-white/[0.12]"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("h-3 w-3 rounded-full", role.color)} />
              <span className="text-sm font-semibold text-white/80">{role.name}</span>
            </div>
            <p className="mt-1 text-[10px] text-white/40">{role.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <Users className="h-3 w-3 text-white/25" />
              <span className="text-[10px] text-white/40">{role.userCount} kullanici</span>
            </div>
          </button>
        ))}
      </div>

      {/* Permission Matrix */}
      {activeRole && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className={cn("h-2.5 w-2.5 rounded-full", activeRole.color)} />
                  {activeRole.name} Yetkileri
                </CardTitle>
                <CardDescription>{totalPerms} / {maxPerms} yetki aktif</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 sm:w-32 rounded-full bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${maxPerms > 0 ? (totalPerms / maxPerms) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/40">
                    {maxPerms > 0 ? Math.round((totalPerms / maxPerms) * 100) : 0}%
                  </span>
                </div>
                <Button variant="outline" size="sm" className="text-xs" onClick={handleSave}>
                  <Lock className="mr-1 h-3 w-3" />
                  Kaydet
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/40">Model</th>
                    {ACTIONS.map((a) => (
                      <th key={a} className="px-3 py-3 text-center text-[10px] font-medium text-white/40 uppercase tracking-wider">
                        {a}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {MODELS.map((model) => (
                    <tr key={model} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-white/80">{model}</span>
                      </td>
                      {ACTIONS.map((action) => {
                        const allowed = rolePermissions[model]?.[action] ?? false;
                        return (
                          <td key={action} className="px-3 py-3 text-center">
                            <button
                              onClick={() => handleTogglePermission(model, action)}
                              className={cn(
                                "inline-flex h-7 w-7 items-center justify-center rounded-md transition-all",
                                allowed
                                  ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                                  : "bg-white/[0.06] text-white/15 hover:bg-white/[0.08] hover:text-white/40"
                              )}
                            >
                              {allowed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3 w-3" />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
