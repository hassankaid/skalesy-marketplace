"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { deburr, isWordChar } from "@/lib/mention-parse";

export type MentionMember = { id: string; name: string };

type ProfileLike = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

/** Turn profile rows into the {id, name} list used for @mentions. */
export function toMentionMembers(profiles: ProfileLike[]): MentionMember[] {
  return profiles
    .filter((p) => p.role === "skalesy_admin" || p.role === "client" || p.role === "provider")
    .map((p) => ({
      id: p.id,
      name: (p.full_name?.trim() || p.email?.split("@")[0] || "").trim(),
    }))
    .filter((m) => m.name.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

/* ---- shared client-side member list (fetched once per session) ---- */

let membersCache: Promise<MentionMember[]> | null = null;

async function loadMembers(): Promise<MentionMember[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email, role");
  return toMentionMembers(data ?? []);
}

function fetchMembers(): Promise<MentionMember[]> {
  if (!membersCache) membersCache = loadMembers();
  return membersCache;
}

export function useMentionMembers(): MentionMember[] {
  const [members, setMembers] = useState<MentionMember[]>([]);
  useEffect(() => {
    let alive = true;
    fetchMembers().then((m) => {
      if (alive) setMembers(m);
    });
    return () => {
      alive = false;
    };
  }, []);
  return members;
}

type Part = string | { key: number; name: string };

function parseMentions(text: string, members: MentionMember[]): Part[] {
  if (!text) return [];
  const names = members
    .map((m) => m.name)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length); // longest first
  const out: Part[] = [];
  let buf = "";
  let i = 0;
  let key = 0;
  while (i < text.length) {
    const atBoundary = i === 0 || /\s|[([]/.test(text[i - 1]);
    if (text[i] === "@" && atBoundary) {
      const rest = text.slice(i + 1);
      const lower = rest.toLowerCase();
      const name = names.find(
        (n) => lower.startsWith(n.toLowerCase()) && !isWordChar(rest[n.length]),
      );
      if (name) {
        if (buf) {
          out.push(buf);
          buf = "";
        }
        out.push({ key: key++, name: rest.slice(0, name.length) });
        i += 1 + name.length;
        continue;
      }
    }
    buf += text[i];
    i += 1;
  }
  if (buf) out.push(buf);
  return out;
}

/** Renders text inline, highlighting `@Name` mentions of known members. */
export function MentionText({ text }: { text: string }) {
  const members = useMentionMembers();
  const parts = useMemo(() => parseMentions(text, members), [text, members]);
  return (
    <>
      {parts.map((p) =>
        typeof p === "string" ? (
          p
        ) : (
          <span
            key={p.key}
            className="rounded bg-brand/12 px-1 font-medium text-fuchsia-700 dark:text-fuchsia-300"
          >
            @{p.name}
          </span>
        ),
      )}
    </>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const TEXTAREA_CLASS =
  "flex field-sizing-content min-h-16 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30";

/** Textarea with an `@`-triggered member autocomplete. Stores plain `@Name` text. */
export function MentionTextarea({
  value,
  onChange,
  className,
  rows,
  placeholder,
  autoFocus,
  id,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  rows?: number;
  placeholder?: string;
  autoFocus?: boolean;
  id?: string;
  disabled?: boolean;
}) {
  const members = useMentionMembers();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [atIndex, setAtIndex] = useState(0);
  const [active, setActive] = useState(0);

  const suggestions = useMemo(() => {
    if (query == null) return [];
    const q = deburr(query);
    return members.filter((m) => deburr(m.name).includes(q)).slice(0, 50);
  }, [query, members]);

  function syncQuery(v: string, caret: number) {
    const before = v.slice(0, caret);
    const m = before.match(/(?:^|\s)@([^\s@]*)$/u);
    if (m) {
      setQuery(m[1]);
      setAtIndex(caret - m[1].length - 1);
      setActive(0);
    } else {
      setQuery(null);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onChange(e.target.value);
    syncQuery(e.target.value, e.target.selectionStart ?? e.target.value.length);
  }

  function select(m: MentionMember) {
    const el = ref.current;
    const caret = el?.selectionStart ?? value.length;
    const next = value.slice(0, atIndex) + "@" + m.name + " " + value.slice(caret);
    onChange(next);
    setQuery(null);
    const newCaret = atIndex + m.name.length + 2;
    requestAnimationFrame(() => {
      if (el) {
        el.focus();
        el.setSelectionRange(newCaret, newCaret);
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (query == null || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      select(suggestions[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setQuery(null);
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        id={id}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={() => window.setTimeout(() => setQuery(null), 120)}
        rows={rows}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className={cn(TEXTAREA_CLASS, className)}
      />
      {query != null && suggestions.length > 0 && (
        <ul className="absolute left-0 top-full z-50 mt-1 max-h-52 w-60 overflow-auto rounded-lg border bg-popover p-1 shadow-md">
          {suggestions.map((m, i) => (
            <li key={m.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(m);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm",
                  i === active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/12 text-[10px] font-semibold text-fuchsia-700 dark:text-fuchsia-300">
                  {initials(m.name)}
                </span>
                <span className="truncate">{m.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
