"use client";
import { useEffect } from "react";
import { useNotesStore } from "@/lib/store/notesStore";

export function useKeyboardShortcuts(searchRef?: React.RefObject<HTMLInputElement | null>) {
  const { newNote, setShortcutsOpen } = useNotesStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (!ctrl) return;

      switch (e.key) {
        case "n":
          e.preventDefault();
          newNote();
          break;
        case "f":
          e.preventDefault();
          searchRef?.current?.focus();
          break;
        case "/":
          e.preventDefault();
          setShortcutsOpen(true);
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [newNote, searchRef, setShortcutsOpen]);
}
