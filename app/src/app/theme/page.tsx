"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Palette, Copy, Download, RotateCcw, Wand2, Sun, Moon, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useThemeStore, type ColorToken } from "@/stores/theme-store";
import { useActivityStore } from "@/stores/activity-store";
import { useToastStore } from "@/stores/toast-store";

const typographyTokens = [
  { name: "Font Family (Sans)", variable: "--font-sans", value: "Inter, system-ui, sans-serif" },
  { name: "Font Family (Mono)", variable: "--font-mono", value: "JetBrains Mono, monospace" },
  { name: "Font Size (xs)", variable: "--text-xs", value: "0.75rem" },
  { name: "Font Size (sm)", variable: "--text-sm", value: "0.875rem" },
  { name: "Font Size (base)", variable: "--text-base", value: "1rem" },
  { name: "Font Size (lg)", variable: "--text-lg", value: "1.125rem" },
  { name: "Font Size (xl)", variable: "--text-xl", value: "1.25rem" },
  { name: "Font Size (2xl)", variable: "--text-2xl", value: "1.5rem" },
];

const spacingTokens = [
  { name: "Border Radius (sm)", variable: "--radius-sm", value: "0.25rem" },
  { name: "Border Radius (md)", variable: "--radius-md", value: "0.375rem" },
  { name: "Border Radius (lg)", variable: "--radius-lg", value: "0.5rem" },
  { name: "Border Radius (xl)", variable: "--radius-xl", value: "0.75rem" },
];

function generateCSSVars(colors: Record<string, ColorToken[]>): string {
  const lines = [":root {"];
  for (const [group, tokens] of Object.entries(colors)) {
    lines.push(`  /* ${group} */`);
    for (const token of tokens) {
      lines.push(`  ${token.variable}: ${token.value};`);
    }
  }
  lines.push("}");
  return lines.join("\n");
}

function generateTailwindConfig(colors: Record<string, ColorToken[]>): string {
  const lines = [
    "// tailwind.config.ts",
    "export default {",
    "  theme: {",
    "    extend: {",
    "      colors: {",
  ];
  for (const [group, tokens] of Object.entries(colors)) {
    if (group === "Semantic") {
      for (const t of tokens) {
        lines.push(`        "${t.name}": "${t.value}",`);
      }
    } else {
      lines.push(`        ${group.toLowerCase()}: {`);
      for (const t of tokens) {
        lines.push(`          "${t.name}": "${t.value}",`);
      }
      lines.push("        },");
    }
  }
  lines.push("      },", "    },", "  },", "};");
  return lines.join("\n");
}

export default function ThemePage() {
  const { colors, updateColor, resetColors } = useThemeStore();
  const addActivity = useActivityStore((s) => s.addActivity);
  const addToast = useToastStore((s) => s.addToast);

  const [activeTab, setActiveTab] = useState<"colors" | "typography" | "spacing">("colors");
  const [exportFormat, setExportFormat] = useState<"css" | "tailwind">("css");
  const [copied, setCopied] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  // Debounced activity logging for color changes
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastChangeRef = useRef<{ group: string; name: string; value: string } | null>(null);

  // Inject CSS variables into document when colors change
  useEffect(() => {
    const root = document.documentElement;
    for (const [, tokens] of Object.entries(colors)) {
      for (const token of tokens) {
        root.style.setProperty(token.variable, token.value);
      }
    }
  }, [colors]);

  const handleColorChange = useCallback(
    (group: string, index: number, value: string) => {
      updateColor(group, index, value);

      const token = colors[group]?.[index];
      lastChangeRef.current = { group, name: token?.name || "", value };

      // Debounce activity log: only log after 800ms of no changes
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const change = lastChangeRef.current;
        if (change) {
          addActivity({
            action: "Tema rengi degistirildi",
            target: `${change.group}-${change.name}: ${change.value}`,
            user: "admin",
            type: "theme",
          });
        }
      }, 800);
    },
    [updateColor, addActivity, colors]
  );

  const handleCopy = () => {
    const output =
      exportFormat === "css" ? generateCSSVars(colors) : generateTailwindConfig(colors);
    navigator.clipboard.writeText(output);
    setCopied(true);
    addToast(
      exportFormat === "css"
        ? "CSS degiskenleri panoya kopyalandi"
        : "Tailwind config panoya kopyalandi",
      "success"
    );
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    resetColors();
    addToast("Tema renkleri varsayilana sifirlandi", "info");
    addActivity({
      action: "Tema renkleri sifirlandi",
      target: "Tum renkler varsayilan degerlere donduruldu",
      user: "admin",
      type: "theme",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Theme Engine</h1>
          <p className="text-sm text-white/50">Brand renkleri, tipografi ve spacing token&apos;larini yonetin</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="mr-2 h-3 w-3" />
            Reset
          </Button>
          <Button size="sm" onClick={handleCopy}>
            {copied ? <Check className="mr-2 h-3 w-3" /> : <Copy className="mr-2 h-3 w-3" />}
            {copied ? "Kopyalandi" : "Export"}
          </Button>
        </div>
      </div>

      {/* AI Color Generator */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Wand2 className="hidden sm:block h-5 w-5 text-purple-400 shrink-0" />
            <Input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder='AI: "Accessible palette olustur..."'
              className="flex-1 border-purple-900/50 bg-purple-950/30"
            />
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto shrink-0">
              <Wand2 className="mr-2 h-3 w-3" />
              Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] p-1 w-fit">
        {(["colors", "typography", "spacing"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-white/[0.08] text-white/90"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {tab === "colors" ? "Colors" : tab === "typography" ? "Typography" : "Spacing"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Token Editor */}
        <div className="lg:col-span-2 space-y-4">
          {activeTab === "colors" &&
            Object.entries(colors).map(([group, tokens]) => (
              <Card key={group}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{group}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                    {tokens.map((token, i) => (
                      <div key={token.variable} className="space-y-1.5">
                        <div
                          className="h-12 rounded-lg border border-white/[0.12] cursor-pointer relative overflow-hidden"
                          style={{ backgroundColor: token.value }}
                        >
                          <input
                            type="color"
                            value={token.value}
                            onChange={(e) => handleColorChange(group, i, e.target.value)}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                        </div>
                        <p className="text-xs font-medium text-white/60">{token.name}</p>
                        <p className="text-[10px] text-white/40 font-mono">{token.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

          {activeTab === "typography" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Typography Tokens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {typographyTokens.map((token) => (
                  <div key={token.variable} className="flex flex-col gap-2 rounded-lg border border-white/[0.08] p-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="sm:w-40">
                      <p className="text-sm font-medium text-white/80">{token.name}</p>
                      <p className="text-[10px] text-white/40 font-mono">{token.variable}</p>
                    </div>
                    <Input defaultValue={token.value} className="flex-1 font-mono text-xs" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "spacing" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Spacing & Border Tokens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {spacingTokens.map((token) => (
                  <div key={token.variable} className="flex flex-col gap-2 rounded-lg border border-white/[0.08] p-3 sm:flex-row sm:items-center sm:gap-4">
                    <div className="sm:w-40">
                      <p className="text-sm font-medium text-white/80">{token.name}</p>
                      <p className="text-[10px] text-white/40 font-mono">{token.variable}</p>
                    </div>
                    <Input defaultValue={token.value} className="w-32 font-mono text-xs" />
                    <div
                      className="h-8 w-16 rounded border border-white/[0.12] bg-indigo-600"
                      style={{ borderRadius: token.value }}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Preview & Export */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-white/[0.08] p-4 space-y-3" style={{ backgroundColor: colors.Primary[9]?.value || "#312e81" }}>
                <h3 className="text-lg font-bold" style={{ color: colors.Primary[0]?.value }}>
                  Sample Heading
                </h3>
                <p className="text-sm" style={{ color: colors.Primary[2]?.value }}>
                  Bu bir onizleme metnidir. Renk token&apos;lariniz burada gosterilir.
                </p>
                <div className="flex gap-2">
                  <button
                    className="rounded-md px-4 py-2 text-sm font-medium text-white"
                    style={{ backgroundColor: colors.Primary[5]?.value }}
                  >
                    Primary Button
                  </button>
                  <button
                    className="rounded-md border px-4 py-2 text-sm font-medium"
                    style={{
                      borderColor: colors.Primary[4]?.value,
                      color: colors.Primary[4]?.value,
                    }}
                  >
                    Outline
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                {colors.Semantic.map((s) => (
                  <div
                    key={s.name}
                    className="flex-1 rounded-md p-2 text-center text-[10px] font-medium text-white"
                    style={{ backgroundColor: s.value }}
                  >
                    {s.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Export</CardTitle>
                <div className="flex rounded-md border border-white/[0.08] p-0.5">
                  <button
                    onClick={() => setExportFormat("css")}
                    className={`rounded px-2 py-1 text-[10px] font-medium ${
                      exportFormat === "css" ? "bg-white/[0.08] text-white" : "text-white/40"
                    }`}
                  >
                    CSS Vars
                  </button>
                  <button
                    onClick={() => setExportFormat("tailwind")}
                    className={`rounded px-2 py-1 text-[10px] font-medium ${
                      exportFormat === "tailwind" ? "bg-white/[0.08] text-white" : "text-white/40"
                    }`}
                  >
                    Tailwind
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="max-h-64 overflow-auto rounded-lg bg-white/[0.02] p-3 text-[11px] text-white/50 font-mono">
                {exportFormat === "css" ? generateCSSVars(colors) : generateTailwindConfig(colors)}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
