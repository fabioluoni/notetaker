"use client";
import { useState, useEffect, useCallback } from "react";
import { useNotesStore } from "@/lib/store/notesStore";
import { useAutoSave } from "@/lib/hooks/useAutoSave";
import { ColorPicker } from "@/components/notes/ColorPicker";
import { NoteTagPicker } from "@/components/notes/NoteTagPicker";
import { countWords, downloadFile, formatDate, NOTE_COLORS, cn } from "@/lib/utils";
import type { NoteColor } from "@/lib/types";
import {
  Pin, Star, Archive, Trash2, Download, Eye, Edit3,
  CheckCircle2, Loader2, AlertCircle, Palette,
} from "lucide-react";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor").then((m) => m.default), { ssr: false });
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface NoteEditorProps {
  noteId: string;
}

export function NoteEditor({ noteId }: NoteEditorProps) {
  const { notes, deleteNote, togglePin, toggleFavorite, toggleArchive, setColor, saveStatus, setSaveStatus } = useNotesStore();
  const note = notes.find((n) => n.id === noteId);

  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [previewMode, setPreviewMode] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  // Sync when note changes from external source
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [noteId]); // eslint-disable-line react-hooks/exhaustive-deps

  useAutoSave(noteId, title, content);

  const handleDelete = useCallback(async () => {
    if (!confirm("Eliminare questa nota?")) return;
    await deleteNote(noteId);
  }, [noteId, deleteNote]);

  const handleExport = useCallback((format: "md" | "txt") => {
    if (!note) return;
    const filename = `${note.title || "nota"}.${format}`;
    downloadFile(format === "md" ? content : `${title}\n\n${content}`, filename,
      format === "md" ? "text/markdown" : "text/plain");
  }, [note, title, content]);

  const handleColorChange = useCallback(async (color: NoteColor) => {
    setColorOpen(false);
    await setColor(noteId, color);
  }, [noteId, setColor]);

  if (!note) return null;

  const colors = NOTE_COLORS[note.color];
  const words = countWords(content);
  const chars = content.length;

  return (
    <div className={cn("flex flex-col h-full transition-colors duration-300", colors.bg)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-border/60 flex-wrap backdrop-blur-sm">
        {/* Left actions */}
        <div className="flex items-center gap-1">
          <ToolbarBtn
            onClick={() => togglePin(noteId)}
            active={note.is_pinned}
            title={note.is_pinned ? "Rimuovi da evidenza" : "Metti in evidenza"}
          >
            <Pin className="w-4 h-4" />
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => toggleFavorite(noteId)}
            active={note.is_favorite}
            title={note.is_favorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
          >
            <Star className={cn("w-4 h-4", note.is_favorite && "fill-amber-400 text-amber-500")} />
          </ToolbarBtn>

          <ToolbarBtn
            onClick={() => toggleArchive(noteId)}
            active={note.is_archived}
            title={note.is_archived ? "Ripristina" : "Archivia"}
          >
            <Archive className="w-4 h-4" />
          </ToolbarBtn>
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Color picker */}
        <div className="relative">
          <ToolbarBtn onClick={() => setColorOpen((o) => !o)} title="Colore nota">
            <Palette className="w-4 h-4" />
          </ToolbarBtn>
          {colorOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setColorOpen(false)} />
              <div className="absolute top-full left-0 z-20 mt-1 bg-popover border border-border rounded-lg shadow-lg">
                <ColorPicker current={note.color} onChange={handleColorChange} />
              </div>
            </>
          )}
        </div>

        {/* Tags */}
        <NoteTagPicker note={note} />

        <div className="w-px h-5 bg-border mx-1" />

        {/* View toggle */}
        <ToolbarBtn onClick={() => setPreviewMode(false)} active={!previewMode} title="Modifica">
          <Edit3 className="w-4 h-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => setPreviewMode(true)} active={previewMode} title="Anteprima">
          <Eye className="w-4 h-4" />
        </ToolbarBtn>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Save status */}
        <SaveIndicator status={saveStatus} />

        {/* Export */}
        <div className="relative group">
          <ToolbarBtn title="Esporta">
            <Download className="w-4 h-4" />
          </ToolbarBtn>
          <div className="absolute right-0 top-full z-20 mt-1 bg-popover border border-border rounded-lg shadow-lg hidden group-hover:block w-32">
            <button onClick={() => handleExport("md")} className="w-full text-left px-3 py-2 text-xs hover:bg-accent rounded-t-lg transition-colors">
              Markdown (.md)
            </button>
            <button onClick={() => handleExport("txt")} className="w-full text-left px-3 py-2 text-xs hover:bg-accent rounded-b-lg transition-colors">
              Testo (.txt)
            </button>
          </div>
        </div>

        {/* Delete */}
        <ToolbarBtn onClick={handleDelete} title="Elimina nota" danger>
          <Trash2 className="w-4 h-4" />
        </ToolbarBtn>
      </div>

      {/* Tags display */}
      {(note.tags?.length ?? 0) > 0 && (
        <div className="flex gap-1.5 px-6 pt-3 flex-wrap">
          {note.tags!.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: tag.color + "22", color: tag.color }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titolo nota…"
        className="w-full px-6 pt-5 pb-2 text-3xl font-bold tracking-tight bg-transparent outline-none placeholder:text-muted-foreground/40"
      />

      {/* Meta */}
      <div className="px-6 flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground/5">
          {words} {words === 1 ? "parola" : "parole"}
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-foreground/5">
          {chars} caratteri
        </span>
        <span className="text-muted-foreground/70">
          Modificata {formatDate(note.updated_at)}
        </span>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 overflow-auto px-6 pb-6">
        {previewMode ? (
          <article className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "*Nessun contenuto*"}</ReactMarkdown>
          </article>
        ) : (
          <div data-color-mode="auto">
            <MDEditor
              value={content}
              onChange={(v) => setContent(v ?? "")}
              preview="edit"
              hideToolbar={false}
              height="100%"
              style={{ minHeight: 400 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarBtn({
  children, onClick, active, title, danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded-md text-sm transition-colors",
        active && !danger && "bg-primary text-primary-foreground",
        !active && !danger && "text-muted-foreground hover:text-foreground hover:bg-accent",
        danger && "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      )}
    >
      {children}
    </button>
  );
}

function SaveIndicator({ status }: { status: string }) {
  if (status === "idle") return null;
  return (
    <span className={cn(
      "flex items-center gap-1 text-xs px-2 py-1 rounded-md",
      status === "saving" && "text-muted-foreground",
      status === "saved" && "text-green-600 dark:text-green-400",
      status === "error" && "text-destructive"
    )}>
      {status === "saving" && <><Loader2 className="w-3 h-3 animate-spin" /> Salvataggio…</>}
      {status === "saved" && <><CheckCircle2 className="w-3 h-3" /> Salvato</>}
      {status === "error" && <><AlertCircle className="w-3 h-3" /> Errore</>}
    </span>
  );
}
