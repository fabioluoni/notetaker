"use client";
import { useNotesStore } from "@/lib/store/notesStore";
import { NoteCard } from "@/components/notes/NoteCard";
import { Loader2 } from "lucide-react";

export function NoteList() {
  const { filteredNotes, isLoading, filters } = useNotesStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (filteredNotes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 px-4 text-center">
        <p className="text-sm text-muted-foreground">
          {filters.search ? `Nessun risultato per "${filters.search}"` : "Nessuna nota"}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full px-2 pb-2 space-y-1">
      {filteredNotes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
