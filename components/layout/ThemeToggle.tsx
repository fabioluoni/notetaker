"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
        className
      )}
      title={isDark ? "Passa al tema chiaro" : "Passa al tema scuro"}
      aria-label="Cambia tema"
    >
      {mounted ? (
        isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4 opacity-0" />
      )}
    </button>
  );
}
