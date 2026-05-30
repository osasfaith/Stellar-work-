"use client";

const RECENT_SEARCHES_STORAGE_KEY = "stellarwork:recent-searches";
const MAX_RECENT_SEARCHES = 5;

function normalizeTerm(term: string): string {
  return term.trim();
}

export function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => (typeof entry === "string" ? normalizeTerm(entry) : ""))
      .filter((entry): entry is string => entry.length > 0)
      .slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function saveRecentSearches(searches: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(searches));
}

export function updateRecentSearches(searches: string[], term: string): string[] {
  const normalized = normalizeTerm(term);
  if (!normalized) return searches;

  const next = [
    normalized,
    ...searches.filter(
      (entry) => entry.toLowerCase() !== normalized.toLowerCase(),
    ),
  ];

  return next.slice(0, MAX_RECENT_SEARCHES);
}

export function clearRecentSearches(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
}
