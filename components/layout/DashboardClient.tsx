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
    <div className="relative flex flex-col items-center justify-center h-full text-center gap-5 text-muted-foreground overflow-hidden">
      {/* Sfondo decorativo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5" />
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
        <FileText className="w-9 h-9" />
      </div>
      <div className="relative">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Inizia a scrivere</h2>
        <p className="text-sm mt-1.5 max-w-xs">Seleziona una nota dalla lista a sinistra oppure creane una nuova per cominciare.</p>
      </div>
      <button
        onClick={newNote}
        className="relative px-5 py-2.5 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 shadow-md shadow-violet-500/20 transition-opacity"
      >
        + Crea la tua prima nota
      </button>
      <p className="relative text-xs">oppure premi <kbd className="px-1.5 py-0.5 rounded border bg-card text-xs font-mono">Ctrl+N</kbd></p>
    </div>
  );
}
