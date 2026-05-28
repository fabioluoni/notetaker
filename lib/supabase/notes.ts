import type { Note, NoteInsert, NoteUpdate, Tag } from "@/lib/types";
import { createClient } from "./client";

const supabase = createClient();

export async function fetchNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select(`*, tags:note_tags(tag:tags(*))`)
    .order("is_pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((n: any) => ({
    ...n,
    tags: (n.tags ?? []).map((nt: any) => nt.tag).filter(Boolean),
  }));
}

export async function createNote(note: Partial<NoteInsert> = {}): Promise<Note> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("notes")
    .insert({ user_id: user.id, title: "Nuova nota", content: "", ...note })
    .select()
    .single();

  if (error) throw error;
  return { ...data, tags: [] };
}

export async function updateNote(id: string, update: NoteUpdate): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .update(update)
    .eq("id", id)
    .select(`*, tags:note_tags(tag:tags(*))`)
    .single();

  if (error) throw error;
  return {
    ...data,
    tags: (data.tags ?? []).map((nt: any) => nt.tag).filter(Boolean),
  };
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createTag(name: string, color: string): Promise<Tag> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("tags")
    .insert({ user_id: user.id, name, color })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTag(id: string): Promise<void> {
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw error;
}

export async function addTagToNote(noteId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from("note_tags")
    .insert({ note_id: noteId, tag_id: tagId });
  if (error && error.code !== "23505") throw error; // ignore duplicate
}

export async function removeTagFromNote(noteId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from("note_tags")
    .delete()
    .eq("note_id", noteId)
    .eq("tag_id", tagId);
  if (error) throw error;
}
