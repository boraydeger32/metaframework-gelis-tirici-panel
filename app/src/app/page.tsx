"use client";

import {
  Database,
  Puzzle,
  Palette,
  Terminal,
  Activity,
  ArrowRight,
  Zap,
  GitBranch,
  Server,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSchemaStore } from "@/stores/schema-store";
import { useModuleStore } from "@/stores/module-store";
import { useActivityStore, type ActivityType } from "@/stores/activity-store";

const quickActions = [
  { label: "Yeni Model Olustur", href: "/schema", icon: Database, color: "bg-indigo-600/10 text-indigo-400" },
  { label: "Modul Ekle", href: "/modules", icon: Puzzle, color: "bg-emerald-600/10 text-emerald-400" },
  { label: "Tema Duzenle", href: "/theme", icon: Palette, color: "bg-purple-600/10 text-purple-400" },
  { label: "AI ile Olustur", href: "/ai-copilot", icon: Terminal, color: "bg-amber-600/10 text-amber-400" },
];

const activityBadgeMap: Record<ActivityType, "success" | "warning" | "default"> = {
  schema: "warning",
  module: "success",
  migration: "default",
  api: "success",
  theme: "warning",
  auth: "default",
  form: "default",
  data: "default",
  workflow: "default",
  permission: "default",
};

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "az once";
  if (diffMin < 60) return `${diffMin} dk once`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} saat once`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} gun once`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks} hafta once`;
}

export default function DashboardPage() {
  const models = useSchemaStore((s) => s.models);
  const modules = useModuleStore((s) => s.modules);
  const activities = useActivityStore((s) => s.activities);

  const modelCount = models.length;
  const totalModules = modules.length;
  const enabledModules = modules.filter((m) => m.enabled).length;
  const apiEndpoints = modelCount * 5;
  const recentActivities = activities.slice(0, 5);

  const stats = [
    { label: "Models", value: String(modelCount), icon: Database, change: `${models.length} tanimli` },
    { label: "Modules", value: String(totalModules), icon: Puzzle, change: `${enabledModules} aktif` },
    { label: "API Endpoints", value: String(apiEndpoints), icon: Server, change: "Auto-generated" },
    { label: "Aktiviteler", value: String(activities.length), icon: GitBranch, change: recentActivities.length > 0 ? `Son: ${formatRelativeTime(recentActivities[0].timestamp)}` : "Henuz yok" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white/90">Dashboard</h1>
          <p className="text-sm text-white/50">Proje durumu ve hizli islemler</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/ai-copilot">
            <Zap className="mr-2 h-4 w-4" />
            AI ile Basla
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/50">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-xs text-white/40">{stat.change}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10">
                  <stat.icon className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Hizli Islemler</CardTitle>
            <CardDescription>Sik kullanilan islemler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-white/[0.08]"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-white/80">{action.label}</span>
                <ArrowRight className="h-4 w-4 text-white/25" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Son Aktiviteler</CardTitle>
                <CardDescription>Sistemdeki son degisiklikler</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/activity">
                  <Activity className="mr-2 h-3 w-3" />
                  Tumu
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.length === 0 && (
                <p className="text-sm text-white/40">Henuz aktivite yok.</p>
              )}
              {recentActivities.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-lg border border-white/[0.08] p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={activityBadgeMap[item.type]}>
                      {item.action}
                    </Badge>
                    <span className="text-sm font-medium text-white/80">
                      {item.target}
                    </span>
                  </div>
                  <span className="text-xs text-white/40">{formatRelativeTime(item.timestamp)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
