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

export const NOTE_COLORS: Record<NoteColor, { bg: string; bgDark: string; border: string; label: string }> = {
  default: { bg: "bg-white", bgDark: "dark:bg-zinc-900", border: "border-zinc-200 dark:border-zinc-700", label: "Nessuno" },
  red:     { bg: "bg-red-50",    bgDark: "dark:bg-red-950/40",    border: "border-red-200 dark:border-red-800",    label: "Rosso" },
  orange:  { bg: "bg-orange-50", bgDark: "dark:bg-orange-950/40", border: "border-orange-200 dark:border-orange-800", label: "Arancio" },
  yellow:  { bg: "bg-yellow-50", bgDark: "dark:bg-yellow-950/40", border: "border-yellow-200 dark:border-yellow-800", label: "Giallo" },
  green:   { bg: "bg-green-50",  bgDark: "dark:bg-green-950/40",  border: "border-green-200 dark:border-green-800",  label: "Verde" },
  blue:    { bg: "bg-blue-50",   bgDark: "dark:bg-blue-950/40",   border: "border-blue-200 dark:border-blue-800",   label: "Blu" },
  purple:  { bg: "bg-purple-50", bgDark: "dark:bg-purple-950/40", border: "border-purple-200 dark:border-purple-800", label: "Viola" },
  pink:    { bg: "bg-pink-50",   bgDark: "dark:bg-pink-950/40",   border: "border-pink-200 dark:border-pink-800",   label: "Rosa" },
};

export const COLOR_DOT: Record<NoteColor, string> = {
  default: "bg-zinc-400",
  red:     "bg-red-400",
  orange:  "bg-orange-400",
  yellow:  "bg-yellow-400",
  green:   "bg-green-400",
  blue:    "bg-blue-400",
  purple:  "bg-purple-400",
  pink:    "bg-pink-400",
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
