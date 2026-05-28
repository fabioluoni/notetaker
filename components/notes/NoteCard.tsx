"use client";
import { useNotesStore } from "@/lib/store/notesStore";
import type { Note } from "@/lib/types";
import { cn, formatDate, stripMarkdown, COLOR_DOT, NOTE_COLORS } from "@/lib/utils";
import { Pin, Star } from "lucide-react";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const { selectedNoteId, selectNote } = useNotesStore();
  const isSelected = selectedNoteId === note.id;
  const colors = NOTE_COLORS[note.color];
  const preview = stripMarkdown(note.content).slice(0, 80) || "Nessun contenuto";

  return (
    <button
      onClick={() => selectNote(note.id)}
      className={cn(
        "w-full text-left rounded-lg border p-2.5 transition-all",
        "hover:shadow-sm",
        colors.bg, colors.bgDark, colors.border,
        isSelected && "ring-2 ring-primary shadow-sm"
      )}
    >
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            {note.is_pinned && <Pin className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
            {note.is_favorite && <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />}
            <span className="font-medium text-sm truncate">{note.title || "Senza titolo"}</span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{preview}</p>

          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {note.color !== "default" && (
              <span className={cn("w-2 h-2 rounded-full flex-shrink-0", COLOR_DOT[note.color])} />
            )}
            {note.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{ backgroundColor: tag.color + "22", color: tag.color }}
              >
                {tag.name}
              </span>
            ))}
            {(note.tags?.length ?? 0) > 2 && (
              <span className="text-[10px] text-muted-foreground">+{(note.tags?.length ?? 0) - 2}</span>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground flex-shrink-0">
              {formatDate(note.updated_at)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
