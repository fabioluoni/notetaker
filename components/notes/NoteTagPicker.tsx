"use client";
import { useNotesStore } from "@/lib/store/notesStore";
import type { Note } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, Tag } from "lucide-react";
import { useState } from "react";

export function NoteTagPicker({ note }: { note: Note }) {
  const { tags, addTagToNote, removeTagFromNote, setTagManagerOpen } = useNotesStore();
  const [open, setOpen] = useState(false);
  const noteTagIds = new Set(note.tags?.map((t) => t.id));

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      >
        <Tag className="w-3.5 h-3.5" />
        Tag
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 z-20 mt-1 w-48 bg-popover border border-border rounded-lg shadow-lg p-1">
            {tags.length === 0 ? (
              <div className="px-2 py-3 text-center">
                <p className="text-xs text-muted-foreground mb-2">Nessun tag disponibile</p>
                <button
                  onClick={() => { setOpen(false); setTagManagerOpen(true); }}
                  className="text-xs text-primary hover:underline"
                >
                  Crea tag
                </button>
              </div>
            ) : (
              <>
                {tags.map((tag) => {
                  const active = noteTagIds.has(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => active ? removeTagFromNote(note.id, tag.id) : addTagToNote(note.id, tag.id)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors",
                        "hover:bg-accent"
                      )}
                    >
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                      <span className="flex-1 text-left truncate">{tag.name}</span>
                      {active && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    onClick={() => { setOpen(false); setTagManagerOpen(true); }}
                    className="w-full text-left px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
                  >
                    Gestisci tag…
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
