"use client";
import { X } from "lucide-react";
import { useNotesStore } from "@/lib/store/notesStore";

const shortcuts = [
  { keys: ["Ctrl", "N"], desc: "Nuova nota" },
  { keys: ["Ctrl", "S"], desc: "Salva nota" },
  { keys: ["Ctrl", "F"], desc: "Sposta il focus sulla ricerca" },
  { keys: ["Ctrl", "/"], desc: "Mostra questa finestra" },
  { keys: ["Ctrl", "B"], desc: "Grassetto (nell'editor)" },
  { keys: ["Ctrl", "I"], desc: "Corsivo (nell'editor)" },
  { keys: ["Ctrl", "K"], desc: "Link (nell'editor)" },
  { keys: ["Ctrl", "Z"], desc: "Annulla" },
  { keys: ["Esc"], desc: "Chiudi finestre modali" },
];

export function ShortcutsModal() {
  const setShortcutsOpen = useNotesStore((s) => s.setShortcutsOpen);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={() => setShortcutsOpen(false)}
    >
      <div
        className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base">Scorciatoie da tastiera</h2>
          <button onClick={() => setShortcutsOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{s.desc}</span>
              <div className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} className="px-2 py-0.5 bg-muted border border-border rounded text-xs font-mono">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
