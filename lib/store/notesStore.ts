import { create } from "zustand";
import type { Note, Tag, NoteFilters, SaveStatus, FilterSection, NoteColor } from "@/lib/types";
import {
  fetchNotes, createNote, updateNote, deleteNote,
  fetchTags, createTag, deleteTag, addTagToNote, removeTagFromNote,
} from "@/lib/supabase/notes";
import { countWords } from "@/lib/utils";

interface NotesState {
  notes: Note[];
  tags: Tag[];
  selectedNoteId: string | null;
  filters: NoteFilters;
  saveStatus: SaveStatus;
  isLoading: boolean;
  isTagManagerOpen: boolean;
  isShortcutsOpen: boolean;

  // Computed
  selectedNote: Note | undefined;
  filteredNotes: Note[];

  // Actions
  loadAll: () => Promise<void>;
  selectNote: (id: string | null) => void;
  newNote: () => Promise<void>;
  saveNote: (id: string, title: string, content: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<void>;
  setColor: (id: string, color: NoteColor) => Promise<void>;
  setFilter: (partial: Partial<NoteFilters>) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setTagManagerOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;

  // Tags
  createTag: (name: string, color: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  addTagToNote: (noteId: string, tagId: string) => Promise<void>;
  removeTagFromNote: (noteId: string, tagId: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>()((set, get) => ({
  notes: [],
  tags: [],
  selectedNoteId: null,
  filters: {
    section: "all",
    tagId: null,
    search: "",
    sortBy: "updated_at",
    sortDir: "desc",
  },
  saveStatus: "idle",
  isLoading: false,
  isTagManagerOpen: false,
  isShortcutsOpen: false,

  get selectedNote() {
    return get().notes.find((n) => n.id === get().selectedNoteId);
  },

  get filteredNotes() {
    const { notes, filters } = get();
    let result = [...notes];

    // Section filter
    if (filters.section === "pinned")    result = result.filter((n) => n.is_pinned && !n.is_archived);
    else if (filters.section === "favorites") result = result.filter((n) => n.is_favorite && !n.is_archived);
    else if (filters.section === "archived") result = result.filter((n) => n.is_archived);
    else result = result.filter((n) => !n.is_archived);

    // Tag filter
    if (filters.tagId) {
      result = result.filter((n) => n.tags?.some((t) => t.id === filters.tagId));
    }

    // Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      let va: string, vb: string;
      if (filters.sortBy === "title") {
        va = a.title.toLowerCase();
        vb = b.title.toLowerCase();
      } else {
        va = a[filters.sortBy];
        vb = b[filters.sortBy];
      }
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return filters.sortDir === "asc" ? cmp : -cmp;
    });

    // Pinned first (only in "all" section)
    if (filters.section === "all") {
      result.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
    }

    return result;
  },

  loadAll: async () => {
    set({ isLoading: true });
    try {
      const [notes, tags] = await Promise.all([fetchNotes(), fetchTags()]);
      set({ notes, tags, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  selectNote: (id) => set({ selectedNoteId: id }),

  newNote: async () => {
    const note = await createNote();
    set((s) => ({ notes: [note, ...s.notes], selectedNoteId: note.id }));
  },

  saveNote: async (id, title, content) => {
    set({ saveStatus: "saving" });
    try {
      const word_count = countWords(content);
      const updated = await updateNote(id, { title, content, word_count });
      set((s) => ({
        notes: s.notes.map((n) => (n.id === id ? { ...updated, tags: n.tags } : n)),
        saveStatus: "saved",
      }));
      setTimeout(() => set({ saveStatus: "idle" }), 2000);
    } catch {
      set({ saveStatus: "error" });
    }
  },

  deleteNote: async (id) => {
    await deleteNote(id);
    set((s) => {
      const notes = s.notes.filter((n) => n.id !== id);
      const selectedNoteId = s.selectedNoteId === id
        ? (notes[0]?.id ?? null)
        : s.selectedNoteId;
      return { notes, selectedNoteId };
    });
  },

  togglePin: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    const updated = await updateNote(id, { is_pinned: !note.is_pinned });
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...updated, tags: n.tags } : n)) }));
  },

  toggleFavorite: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    const updated = await updateNote(id, { is_favorite: !note.is_favorite });
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...updated, tags: n.tags } : n)) }));
  },

  toggleArchive: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    const updated = await updateNote(id, { is_archived: !note.is_archived });
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...updated, tags: n.tags } : n)) }));
  },

  setColor: async (id, color) => {
    const updated = await updateNote(id, { color });
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? { ...updated, tags: n.tags } : n)) }));
  },

  setFilter: (partial) =>
    set((s) => ({ filters: { ...s.filters, ...partial } })),

  setSaveStatus: (saveStatus) => set({ saveStatus }),

  setTagManagerOpen: (isTagManagerOpen) => set({ isTagManagerOpen }),

  setShortcutsOpen: (isShortcutsOpen) => set({ isShortcutsOpen }),

  createTag: async (name, color) => {
    const tag = await createTag(name, color);
    set((s) => ({ tags: [...s.tags, tag].sort((a, b) => a.name.localeCompare(b.name)) }));
  },

  deleteTag: async (id) => {
    await deleteTag(id);
    set((s) => ({
      tags: s.tags.filter((t) => t.id !== id),
      notes: s.notes.map((n) => ({
        ...n,
        tags: n.tags?.filter((t) => t.id !== id),
      })),
    }));
  },

  addTagToNote: async (noteId, tagId) => {
    await addTagToNote(noteId, tagId);
    const tag = get().tags.find((t) => t.id === tagId);
    if (!tag) return;
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === noteId
          ? { ...n, tags: [...(n.tags ?? []).filter((t) => t.id !== tagId), tag] }
          : n
      ),
    }));
  },

  removeTagFromNote: async (noteId, tagId) => {
    await removeTagFromNote(noteId, tagId);
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === noteId
          ? { ...n, tags: (n.tags ?? []).filter((t) => t.id !== tagId) }
          : n
      ),
    }));
  },
}));
