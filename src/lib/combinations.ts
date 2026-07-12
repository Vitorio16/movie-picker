import { pickRandom, randomInt } from "./random";
import type { Settings } from "../hooks/useSettings";

export type Combination = {
  year: number;
  genre: string;
  extra: string;
};

export function combinationKey(combo: Combination): string {
  return `${combo.year}\0${combo.genre}\0${combo.extra}`;
}

export function generateUnique(
  settings: Settings,
  excluded: Set<string>,
): Combination | "exhausted" {
  const min = Math.min(settings.yearMin, settings.yearMax);
  const max = Math.max(settings.yearMin, settings.yearMax);
  const genres = settings.genres.filter(Boolean);
  const extras = settings.extras.filter(Boolean);

  if (genres.length === 0 || extras.length === 0) {
    return { year: min, genre: "—", extra: "—" };
  }

  const total = (max - min + 1) * genres.length * extras.length;
  if (excluded.size >= total) {
    return "exhausted";
  }

  const maxAttempts = Math.min(total * 3, 10000);
  for (let i = 0; i < maxAttempts; i++) {
    const result: Combination = {
      year: randomInt(min, max),
      genre: pickRandom(genres) ?? "—",
      extra: pickRandom(extras) ?? "—",
    };
    if (!excluded.has(combinationKey(result))) {
      return result;
    }
  }

  if (total <= 50000) {
    const available: Combination[] = [];
    for (let year = min; year <= max; year++) {
      for (const genre of genres) {
        for (const extra of extras) {
          const combo = { year, genre, extra };
          if (!excluded.has(combinationKey(combo))) {
            available.push(combo);
          }
        }
      }
    }
    if (available.length === 0) return "exhausted";
    return pickRandom(available)!;
  }

  return "exhausted";
}
