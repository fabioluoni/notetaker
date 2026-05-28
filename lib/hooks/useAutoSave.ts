"use client";
import { useEffect, useRef, useCallback } from "react";
import { useNotesStore } from "@/lib/store/notesStore";

export function useAutoSave(id: string | null, title: string, content: string, delay = 1500) {
  const saveNote = useNotesStore((s) => s.saveNote);
  const setSaveStatus = useNotesStore((s) => s.setSaveStatus);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef({ title, content });

  const flush = useCallback(() => {
    if (!id) return;
    const changed =
      lastSavedRef.current.title !== title ||
      lastSavedRef.current.content !== content;
    if (!changed) return;
    lastSavedRef.current = { title, content };
    saveNote(id, title, content);
  }, [id, title, content, saveNote]);

  useEffect(() => {
    if (!id) return;
    const changed =
      lastSavedRef.current.title !== title ||
      lastSavedRef.current.content !== content;
    if (!changed) return;

    setSaveStatus("saving");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [id, title, content, delay, flush, setSaveStatus]);

  // Sync lastSaved when note changes
  useEffect(() => {
    lastSavedRef.current = { title, content };
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  return flush;
}
