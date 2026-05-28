export type NoteColor =
  | "default"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink";

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  color: NoteColor;
  is_pinned: boolean;
  is_favorite: boolean;
  is_archived: boolean;
  word_count: number;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
}

export type NoteInsert = Omit<Note, "id" | "user_id" | "created_at" | "updated_at" | "tags">;
export type NoteUpdate = Partial<NoteInsert>;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export type FilterSection = "all" | "pinned" | "favorites" | "archived";

export interface NoteFilters {
  section: FilterSection;
  tagId: string | null;
  search: string;
  sortBy: "updated_at" | "created_at" | "title";
  sortDir: "asc" | "desc";
}
