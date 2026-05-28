"use client";
import { NOTE_COLORS, COLOR_DOT } from "@/lib/utils";
import type { NoteColor } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorPickerProps {
  current: NoteColor;
  onChange: (color: NoteColor) => void;
}

const COLORS = Object.keys(NOTE_COLORS) as NoteColor[];

export function ColorPicker({ current, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2 p-2">
      <p className="text-xs font-medium text-muted-foreground px-1">Colore nota</p>
      <div className="flex gap-2 flex-wrap">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            title={NOTE_COLORS[color].label}
            className={cn(
              "w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center",
              COLOR_DOT[color],
              current === color ? "border-primary scale-110" : "border-transparent hover:scale-110"
            )}
          >
            {current === color && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </button>
        ))}
      </div>
    </div>
  );
}
