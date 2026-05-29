"use client";
import { useRef, useState, useMemo } from "react";
import {
  Plus, Search, Star, Pin, Archive, Tag, Settings, ChevronDown,
  ChevronRight, StickyNote, Keyboard, LogOut, SortAsc, SortDesc,
} from "lucide-react";
import { useNotesStore, filterNotes } from "@/lib/store/notesStore";
import { NoteList } from "@/components/notes/NoteList";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils";
import type { FilterSection } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const SECTIONS: { id: FilterSection; label: string; icon: React.ReactNode }[] = [
  { id: "all",       label: "Tutte le note", icon: <StickyNote className="w-4 h-4" /> },
  { id: "pinned",    label: "In evidenza",   icon: <Pin className="w-4 h-4" /> },
  { id: "favorites", label: "Preferiti",     icon: <Star className="w-4 h-4" /> },
  { id: "archived",  label: "Archiviate",    icon: <Archive className="w-4 h-4" /> },
];

interface SidebarProps {
  searchRef?: React.RefObject<HTMLInputElement | null>;
}

export function Sidebar({ searchRef }: SidebarProps) {
  const router = useRouter();
  const { filters, setFilter, newNote, tags, setTagManagerOpen, setShortcutsOpen } = useNotesStore();
  const notes = useNotesStore((s) => s.notes);
  const filteredNotes = useMemo(() => filterNotes(notes, filters), [notes, filters]);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col border-r border-border bg-card h-full">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center gap-2">
        <div className="flex-1">
          <h1 className="font-bold text-base tracking-tight">Notetaker</h1>
          <p className="text-xs text-muted-foreground">{filteredNotes.length} note</p>
        </div>
        <ThemeToggle />
        <button
          onClick={newNote}
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          title="Nuova nota (Ctrl+N)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Cerca note… (Ctrl+F)"
            value={filters.search}
            onChange={(e) => setFilter({ search: e.target.value })}
            className="w-full pl-8 pr-3 py-1.5 text-sm bg-muted rounded-md outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="px-2 pt-2">
        <button
          onClick={() => setSortOpen((o) => !o)}
          className="w-full flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-accent transition-colors"
        >
          {filters.sortDir === "desc" ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />}
          Ordina per: {filters.sortBy === "updated_at" ? "modifica" : filters.sortBy === "created_at" ? "creazione" : "titolo"}
          <ChevronDown className={cn("w-3 h-3 ml-auto transition-transform", sortOpen && "rotate-180")} />
        </button>

        {sortOpen && (
          <div className="mt-1 p-1 bg-popover border border-border rounded-lg shadow-md text-xs space-y-0.5">
            {(["updated_at", "created_at", "title"] as const).map((key) => (
              <button
                key={key}
                onClick={() => { setFilter({ sortBy: key }); setSortOpen(false); }}
                className={cn(
                  "w-full text-left px-2 py-1.5 rounded hover:bg-accent transition-colors",
                  filters.sortBy === key && "bg-accent font-medium"
                )}
              >
                {key === "updated_at" ? "Ultima modifica" : key === "created_at" ? "Data creazione" : "Titolo"}
              </button>
            ))}
            <div className="border-t border-border my-1" />
            <button
              onClick={() => setFilter({ sortDir: filters.sortDir === "desc" ? "asc" : "desc" })}
              className="w-full text-left px-2 py-1.5 rounded hover:bg-accent transition-colors"
            >
              {filters.sortDir === "desc" ? "↓ Decrescente" : "↑ Crescente"}
            </button>
          </div>
        )}
      </div>

      {/* Navigation sections */}
      <nav className="px-2 pt-2 space-y-0.5">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter({ section: s.id, tagId: null })}
            className={cn(
              "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors",
              filters.section === s.id && !filters.tagId
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </nav>

      {/* Tags */}
      <div className="px-2 pt-3">
        <button
          onClick={() => setTagsOpen((o) => !o)}
          className="w-full flex items-center gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
        >
          {tagsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          Tag
          <button
            onClick={(e) => { e.stopPropagation(); setTagManagerOpen(true); }}
            className="ml-auto hover:text-foreground"
            title="Gestisci tag"
          >
            <Settings className="w-3 h-3" />
          </button>
        </button>

        {tagsOpen && (
          <div className="mt-1 space-y-0.5">
            {tags.length === 0 && (
              <p className="px-2 text-xs text-muted-foreground italic">Nessun tag</p>
            )}
            {tags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => setFilter({
                  tagId: filters.tagId === tag.id ? null : tag.id,
                  section: "all",
                })}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors",
                  filters.tagId === tag.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-hidden mt-2">
        <NoteList />
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-border flex items-center gap-1">
        <button
          onClick={() => setShortcutsOpen(true)}
          className="flex-1 flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-accent transition-colors"
          title="Scorciatoie (Ctrl+/)"
        >
          <Keyboard className="w-3.5 h-3.5" />
          Scorciatoie
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-destructive rounded-lg hover:bg-accent transition-colors"
          title="Esci"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
