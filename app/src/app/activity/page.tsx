"use client";

import { useState } from "react";
import {
  Activity,
  Database,
  Puzzle,
  Palette,
  FileCode,
  Shield,
  GitBranch,
  Search,
  X,
  Trash2,
  Workflow,
  FormInput,
  HardDrive,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useActivityStore, type ActivityType } from "@/stores/activity-store";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "az once";
  if (mins < 60) return `${mins} dk once`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat once`;
  const days = Math.floor(hours / 24);
  return `${days} gun once`;
}

const typeIcons: Record<ActivityType, typeof Database> = {
  schema: Database,
  module: Puzzle,
  migration: GitBranch,
  api: FileCode,
  theme: Palette,
  auth: Shield,
  form: FormInput,
  data: HardDrive,
  workflow: Workflow,
  permission: Lock,
};

const typeColors: Record<ActivityType, string> = {
  schema: "bg-indigo-600/10 text-indigo-400",
  module: "bg-emerald-600/10 text-emerald-400",
  migration: "bg-amber-600/10 text-amber-400",
  api: "bg-blue-600/10 text-blue-400",
  theme: "bg-purple-600/10 text-purple-400",
  auth: "bg-red-600/10 text-red-400",
  form: "bg-cyan-600/10 text-cyan-400",
  data: "bg-teal-600/10 text-teal-400",
  workflow: "bg-orange-600/10 text-orange-400",
  permission: "bg-pink-600/10 text-pink-400",
};

const allTypes: ActivityType[] = [
  "schema", "module", "migration", "api", "theme", "auth", "form", "data", "workflow", "permission",
];

export default function ActivityPage() {
  const { activities, clearActivities } = useActivityStore();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<ActivityType | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const filtered = activities.filter((item) => {
    if (filterType && item.type !== filterType) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !item.action.toLowerCase().includes(q) &&
        !item.target.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  // Only show filter buttons for types that exist in activities
  const presentTypes = allTypes.filter((t) =>
    activities.some((a) => a.type === t)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-sm text-white/50">
            Tum sistem aktiviteleri ve degisiklik gecmisi
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!showConfirm ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowConfirm(true)}
              disabled={activities.length === 0}
            >
              <Trash2 className="mr-2 h-3 w-3" />
              Temizle
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-red-800/30 bg-red-950/20 px-3 py-1.5">
              <span className="text-xs text-red-400">
                Tum aktiviteler silinecek. Emin misiniz?
              </span>
              <Button
                variant="destructive"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  clearActivities();
                  setShowConfirm(false);
                }}
              >
                Evet, Sil
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setShowConfirm(false)}
              >
                Iptal
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <Input
            placeholder="Aktivite ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {presentTypes.map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(filterType === t ? null : t)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-medium border transition-colors",
                filterType === t
                  ? "border-indigo-600 bg-indigo-600/20 text-indigo-400"
                  : "border-white/[0.08] text-white/40 hover:text-white/60"
              )}
            >
              {t}
            </button>
          ))}
          {filterType && (
            <button
              onClick={() => setFilterType(null)}
              className="ml-1 text-white/25 hover:text-white/50"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <Badge variant="secondary" className="ml-auto text-[10px] shrink-0">
          {filtered.length} aktivite
        </Badge>
      </div>

      {/* Activity List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-white/[0.08]">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-white/40">
                <Activity className="h-8 w-8 mb-2" />
                <p className="text-sm">
                  {activities.length === 0
                    ? "Henuz aktivite yok"
                    : "Filtreye uygun aktivite bulunamadi"}
                </p>
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = typeIcons[item.type] || Activity;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 px-4 py-3 hover:bg-white/[0.04] transition-colors sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-4"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeColors[item.type] || "bg-white/[0.08] text-white/50"}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium text-white/80">
                          {item.action}
                        </span>
                        <span className="text-white/40"> &mdash; </span>
                        <span className="text-white/60">{item.target}</span>
                      </p>
                      <p className="text-xs text-white/40">
                        by{" "}
                        <span
                          className={
                            item.user === "ai-copilot"
                              ? "text-indigo-400"
                              : "text-white/50"
                          }
                        >
                          {item.user}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 sm:shrink-0">
                      <Badge variant="outline" className="text-[10px]">
                        {item.type}
                      </Badge>
                      <span className="text-xs text-white/40">
                        {relativeTime(item.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
