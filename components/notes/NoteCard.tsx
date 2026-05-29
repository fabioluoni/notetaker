"use client";
import { useNotesStore } from "@/lib/store/notesStore";
import type { Note } from "@/lib/types";
import { cn, formatDate, stripMarkdown, NOTE_COLORS } from "@/lib/utils";
import { Pin, Star } from "lucide-react";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const { selectedNoteId, selectNote } = useNotesStore();
  const isSelected = selectedNoteId === note.id;
  const colors = NOTE_COLORS[note.color];
  const preview = stripMarkdown(note.content).slice(0, 90) || "Nessun contenuto";
  const hasColor = note.color !== "default";

  return (
    <button
      onClick={() => selectNote(note.id)}
      className={cn(
        "group relative w-full text-left rounded-xl border p-3 overflow-hidden transition-all duration-200",
        colors.bg, colors.border,
        "hover:shadow-md hover:-translate-y-0.5",
        isSelected
          ? "ring-2 ring-primary ring-offset-1 ring-offset-background shadow-md"
          : "hover:border-foreground/20"
      )}
    >
      {/* Accento colorato laterale */}
      {hasColor && (
        <span className={cn("absolute left-0 top-0 bottom-0 w-1", colors.accent)} />
      )}

      <div className={cn("min-w-0", hasColor && "pl-2")}>
        <div className="flex items-center gap-1.5 mb-1">
          {note.is_pinned && <Pin className="w-3 h-3 text-muted-foreground flex-shrink-0 fill-current" />}
          {note.is_favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />}
          <span className="font-semibold text-sm truncate">{note.title || "Senza titolo"}</span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2rem]">
          {preview}
        </p>

        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {note.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium"
              style={{ backgroundColor: tag.color + "22", color: tag.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </span>
          ))}
          {(note.tags?.length ?? 0) > 3 && (
            <span className="text-[10px] text-muted-foreground">+{(note.tags?.length ?? 0) - 3}</span>
          )}
          <span className="ml-auto text-[10px] text-muted-foreground/80 flex-shrink-0 font-medium">
            {formatDate(note.updated_at)}
          </span>
        </div>
      </div>
    </button>
  );
}
