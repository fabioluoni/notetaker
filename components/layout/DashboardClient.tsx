"use client";
import { useEffect, useRef, useState } from "react";
import { useNotesStore } from "@/lib/store/notesStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { ShortcutsModal } from "@/components/layout/ShortcutsModal";
import { TagManager } from "@/components/tags/TagManager";
import { useKeyboardShortcuts } from "@/lib/hooks/useKeyboardShortcuts";
import { createClient } from "@/lib/supabase/client";
import { FileText, Loader2 } from "lucide-react";

export function DashboardClient() {
  const { loadAll, selectedNoteId, isShortcutsOpen, isTagManagerOpen } = useNotesStore();
  const searchRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  useKeyboardShortcuts(searchRef);

  useEffect(() => {
    setMounted(true);
    console.log("[Notetaker] build: fix-hydration-v3 — dashboard mounted");
    loadAll();

    // Real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel("notes-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, () => {
        loadAll();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "note_tags" }, () => {
        loadAll();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loadAll]);

  // Evita hydration mismatch: render solo lato client dopo il mount
  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar searchRef={searchRef} />

      <main className="flex-1 overflow-hidden">
        {selectedNoteId ? (
          <NoteEditor key={selectedNoteId} noteId={selectedNoteId} />
        ) : (
          <EmptyState />
        )}
      </main>

      {isShortcutsOpen && <ShortcutsModal />}
      {isTagManagerOpen && <TagManager />}
    </div>
  );
}

function EmptyState() {
  const newNote = useNotesStore((s) => s.newNote);
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-muted-foreground">
      <div className="p-6 rounded-full bg-muted">
        <FileText className="w-12 h-12" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground">Nessuna nota selezionata</h2>
        <p className="text-sm mt-1">Seleziona una nota dalla lista o creane una nuova</p>
      </div>
      <button
        onClick={newNote}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Nuova nota
      </button>
      <p className="text-xs">oppure premi <kbd className="px-1.5 py-0.5 rounded border text-xs font-mono">Ctrl+N</kbd></p>
    </div>
  );
}
