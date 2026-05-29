import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { NoteColor } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function countWords(text: string): number {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Ieri";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("it-IT", { weekday: "long" });
  } else {
    return date.toLocaleDateString("it-IT", { day: "numeric", month: "short", year: "numeric" });
  }
}

// Sistema colori coerente light/dark.
//  bg     = sfondo card (tinta tenue, stessa identità nei due temi)
//  border = bordo coerente
//  accent = barretta/accento colorato pieno
//  dot    = pallino selettore colore
export const NOTE_COLORS: Record<
  NoteColor,
  { bg: string; border: string; accent: string; dot: string; label: string }
> = {
  default: { bg: "bg-card",                      border: "border-border",                          accent: "bg-transparent", dot: "bg-zinc-300 dark:bg-zinc-600", label: "Nessuno" },
  red:     { bg: "bg-rose-50 dark:bg-rose-500/10",     border: "border-rose-200 dark:border-rose-500/30",     accent: "bg-rose-500",    dot: "bg-rose-500",    label: "Rosso" },
  orange:  { bg: "bg-amber-50 dark:bg-amber-500/10",   border: "border-amber-200 dark:border-amber-500/30",   accent: "bg-amber-500",   dot: "bg-amber-500",   label: "Arancio" },
  yellow:  { bg: "bg-yellow-50 dark:bg-yellow-400/10", border: "border-yellow-200 dark:border-yellow-400/30", accent: "bg-yellow-400",  dot: "bg-yellow-400",  label: "Giallo" },
  green:   { bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/30", accent: "bg-emerald-500", dot: "bg-emerald-500", label: "Verde" },
  blue:    { bg: "bg-sky-50 dark:bg-sky-500/10",       border: "border-sky-200 dark:border-sky-500/30",       accent: "bg-sky-500",     dot: "bg-sky-500",     label: "Blu" },
  purple:  { bg: "bg-violet-50 dark:bg-violet-500/10", border: "border-violet-200 dark:border-violet-500/30", accent: "bg-violet-500",  dot: "bg-violet-500",  label: "Viola" },
  pink:    { bg: "bg-pink-50 dark:bg-pink-500/10",     border: "border-pink-200 dark:border-pink-500/30",     accent: "bg-pink-500",    dot: "bg-pink-500",    label: "Rosa" },
};

export const COLOR_DOT: Record<NoteColor, string> = {
  default: "bg-zinc-300 dark:bg-zinc-600",
  red:     "bg-rose-500",
  orange:  "bg-amber-500",
  yellow:  "bg-yellow-400",
  green:   "bg-emerald-500",
  blue:    "bg-sky-500",
  purple:  "bg-violet-500",
  pink:    "bg-pink-500",
};

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/#+\s/g, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/`{1,3}[^`]*`{1,3}/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s/gm, "")
    .replace(/^\s*\d+\.\s/gm, "")
    .replace(/\n{2,}/g, " ")
    .trim();
}
