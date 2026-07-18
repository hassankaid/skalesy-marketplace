"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Light/dark switch. The icon swaps purely via the `.dark` class (set by
 * next-themes before paint), so there's no mount flag and no hydration flash.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      aria-label="Changer de thème (clair / sombre)"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="hidden size-4.5 dark:block" />
      <Moon className="block size-4.5 dark:hidden" />
    </Button>
  );
}
