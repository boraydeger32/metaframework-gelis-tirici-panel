"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { FileCode, Play, Save, Wand2, Copy, Check, Bug, Lightbulb, FolderOpen, ChevronRight, File } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => mod.default), { ssr: false, loading: () => <div className="flex h-[400px] items-center justify-center bg-white/[0.02] text-white/25 text-sm">Editor yükleniyor...</div> });

const fileTree = [
  { type: "folder" as const, name: "models", children: [
    { type: "file" as const, name: "user.ts", language: "typescript" },
    { type: "file" as const, name: "product.ts", language: "typescript" },
    { type: "file" as const, name: "order.ts", language: "typescript" },
  ]},
  { type: "folder" as const, name: "api", children: [
    { type: "file" as const, name: "users/route.ts", language: "typescript" },
    { type: "file" as const, name: "products/route.ts", language: "typescript" },
  ]},
  { type: "folder" as const, name: "modules", children: [
    { type: "file" as const, name: "auth/index.ts", language: "typescript" },
    { type: "file" as const, name: "blog/index.ts", language: "typescript" },
  ]},
  { type: "folder" as const, name: "config", children: [
    { type: "file" as const, name: "database.ts", language: "typescript" },
    { type: "file" as const, name: "modules.ts", language: "typescript" },
  ]},
];

const fileContents: Record<string, string> = {
  "user.ts": `import { z } from "zod";
import { pgTable, uuid, varchar, timestamp, jsonb } from "drizzle-orm/pg-core";

// Schema
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  role: varchar("role", { enum: ["admin", "editor", "viewer"] }).notNull().default("viewer"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Validation
export const createUserSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  role: z.enum(["admin", "editor", "viewer"]).default("viewer"),
  metadata: z.record(z.unknown()).optional(),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof createUserSchema>;
`,
  "product.ts": `import { z } from "zod";
import { pgTable, uuid, varchar, numeric, text, timestamp } from "drizzle-orm/pg-core";

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const createProductSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string().uuid().optional(),
});
`,
  "users/route.ts": `import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { users, createUserSchema } from "@/models/user";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 20);

  const data = await db
    .select()
    .from(users)
    .limit(limit)
    .offset((page - 1) * limit);

  return NextResponse.json({ data, meta: { page, limit } });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = createUserSchema.parse(body);

  const [user] = await db.insert(users).values(validated).returning();

  return NextResponse.json(user, { status: 201 });
}
`,
};

const aiSuggestions = [
  { type: "fix", message: "Satır 12: 'categories' tablosu import edilmemiş. Import eklensin mi?", line: 12 },
  { type: "optimize", message: "GET handler'da pagination count sorgusu eksik. Total count eklensin mi?", line: 8 },
  { type: "security", message: "POST handler'da authentication middleware eksik. Auth guard eklensin mi?", line: 18 },
];

export default function CodeEditorPage() {
  const [activeFile, setActiveFile] = useState("user.ts");
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(["models"]));
  const [copied, setCopied] = useState(false);

  const toggleFolder = (name: string) => {
    setOpenFolders((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Code Editor</h1>
          <p className="text-sm text-white/50">AI destekli kod düzenleme</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm"><Wand2 className="mr-2 h-3 w-3" />AI Açıkla</Button>
          <Button variant="outline" size="sm"><Bug className="mr-2 h-3 w-3" />Hata Bul</Button>
          <Button size="sm"><Save className="mr-2 h-3 w-3" />Kaydet</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* File Tree */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2"><CardTitle className="text-xs">Dosyalar</CardTitle></CardHeader>
          <CardContent className="p-2 space-y-0.5">
            {fileTree.map((item) => (
              <div key={item.name}>
                <button
                  onClick={() => toggleFolder(item.name)}
                  className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-[11px] text-white/50 hover:bg-white/[0.08] transition-colors"
                >
                  <ChevronRight className={cn("h-3 w-3 transition-transform", openFolders.has(item.name) && "rotate-90")} />
                  <FolderOpen className="h-3 w-3 text-amber-400" />
                  {item.name}
                </button>
                {openFolders.has(item.name) && item.children?.map((child) => (
                  <button
                    key={child.name}
                    onClick={() => setActiveFile(child.name)}
                    className={cn(
                      "flex w-full items-center gap-1.5 rounded px-2 py-1 pl-7 text-[11px] transition-colors",
                      activeFile === child.name ? "bg-indigo-600/10 text-indigo-400" : "text-white/40 hover:bg-white/[0.08] hover:text-white/60"
                    )}
                  >
                    <File className="h-3 w-3" />
                    {child.name}
                  </button>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-3 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px] font-mono">{activeFile}</Badge>
              <Badge variant="secondary" className="text-[9px]">TypeScript</Badge>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(fileContents[activeFile] || ""); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="text-white/40 hover:text-white/60"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <MonacoEditor
            height="400px"
            language="typescript"
            theme="vs-dark"
            value={fileContents[activeFile] || "// Dosya bulunamadı"}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineHeight: 20,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              renderWhitespace: "selection",
              bracketPairColorization: { enabled: true },
            }}
          />
        </Card>

        {/* AI Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-1.5 text-xs">
              <Wand2 className="h-3 w-3 text-indigo-400" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            {aiSuggestions.map((s, i) => (
              <div key={i} className={cn(
                "rounded-lg border p-2.5 text-[10px] leading-relaxed",
                s.type === "fix" ? "border-red-800/30 bg-red-950/20 text-red-300" :
                s.type === "optimize" ? "border-amber-800/30 bg-amber-950/20 text-amber-300" :
                "border-blue-800/30 bg-blue-950/20 text-blue-300"
              )}>
                <div className="flex items-center gap-1 mb-1">
                  {s.type === "fix" ? <Bug className="h-3 w-3" /> : s.type === "optimize" ? <Lightbulb className="h-3 w-3" /> : <Lightbulb className="h-3 w-3" />}
                  <span className="font-semibold uppercase text-[8px]">{s.type}</span>
                  <span className="ml-auto text-[8px] opacity-60">Satır {s.line}</span>
                </div>
                {s.message}
                <button className="mt-1.5 block text-[9px] font-medium underline underline-offset-2 opacity-70 hover:opacity-100">Uygula</button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
