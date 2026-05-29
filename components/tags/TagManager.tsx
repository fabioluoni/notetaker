"use client";
import { useState } from "react";
import { useNotesStore } from "@/lib/store/notesStore";
import { X, Plus, Trash2, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#6366f1", "#ec4899", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#8b5cf6", "#ef4444",
];

export function TagManager() {
  const { tags, createTag, deleteTag, setTagManagerOpen } = useNotesStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    try {
      await createTag(name.trim(), color);
      setName("");
    } catch (err: any) {
      setError(err.message?.includes("unique") ? "Tag già esistente" : "Errore");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={() => setTagManagerOpen(false)}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4" />
            <h2 className="font-semibold text-base">Gestione Tag</h2>
          </div>
          <button onClick={() => setTagManagerOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Create form */}
        <form onSubmit={handleCreate} className="mb-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome tag…"
              maxLength={30}
              className="flex-1 min-w-0 px-3 py-2 text-sm border border-input rounded-lg bg-background outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-shrink-0 flex items-center gap-1 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Crea
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Colore:</span>
            <div className="flex items-center gap-1.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all",
                    color === c ? "ring-2 ring-offset-2 ring-offset-card ring-primary scale-110" : "hover:scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </form>

        {error && <p className="text-xs text-destructive mb-3">{error}</p>}

        {/* Tags list */}
        <div className="space-y-1.5 max-h-64 overflow-y-auto">
          {tags.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Nessun tag creato</p>
          )}
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
              <span className="flex-1 text-sm font-medium">{tag.name}</span>
              <button
                onClick={() => deleteTag(tag.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                title="Elimina tag"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
