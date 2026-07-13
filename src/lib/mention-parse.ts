/**
 * @mention parsing — shared by the client (input autocomplete + display
 * highlight) and the server (recording who was mentioned).
 * Mentions are stored inline in the text as `@Nom` (plain text).
 */

/** Lowercase + strip accents, so "Taieb" matches "Taïeb". */
export function deburr(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export function isWordChar(c: string | undefined): boolean {
  return !!c && /[\p{L}\p{N}]/u.test(c);
}

/** True when `@` at index `i` starts a mention (start of text or after space / opening bracket). */
export function isMentionBoundary(text: string, i: number): boolean {
  return i === 0 || /\s|[([]/.test(text[i - 1]);
}

type NamedMember = { id: string; name: string };

/**
 * Returns the unique ids of members @mentioned in `text`.
 * Accent-insensitive, longest-name-first, respects word boundaries.
 */
export function extractMentionIds(
  text: string | null | undefined,
  members: NamedMember[],
): string[] {
  if (!text) return [];
  const sorted = members
    .filter((m) => m.name)
    .slice()
    .sort((a, b) => b.name.length - a.name.length);
  const found = new Set<string>();
  let i = 0;
  while (i < text.length) {
    if (text[i] === "@" && isMentionBoundary(text, i)) {
      const rest = text.slice(i + 1);
      const drest = deburr(rest);
      const mem = sorted.find(
        (m) => drest.startsWith(deburr(m.name)) && !isWordChar(rest[m.name.length]),
      );
      if (mem) {
        found.add(mem.id);
        i += 1 + mem.name.length;
        continue;
      }
    }
    i += 1;
  }
  return [...found];
}
