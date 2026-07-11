import { useCallback, useEffect, useState } from "react";

export type Settings = {
  yearMin: number;
  yearMax: number;
  genres: string[];
  extras: string[];
};

export const DEFAULT_SETTINGS: Settings = {
  yearMin: 1960,
  yearMax: 2026,
  genres: ["Horror", "Comedy"],
  extras: ["haunted house", "road trip", "mistaken identity"],
};

const STORAGE_KEY = "random-prompt-settings";

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS, genres: [...DEFAULT_SETTINGS.genres], extras: [...DEFAULT_SETTINGS.extras] };

    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      yearMin: typeof parsed.yearMin === "number" ? parsed.yearMin : DEFAULT_SETTINGS.yearMin,
      yearMax: typeof parsed.yearMax === "number" ? parsed.yearMax : DEFAULT_SETTINGS.yearMax,
      genres: Array.isArray(parsed.genres) && parsed.genres.length > 0
        ? parsed.genres.filter((g): g is string => typeof g === "string")
        : [...DEFAULT_SETTINGS.genres],
      extras: Array.isArray(parsed.extras)
        ? parsed.extras.filter((e): e is string => typeof e === "string")
        : [...DEFAULT_SETTINGS.extras],
    };
  } catch {
    return { ...DEFAULT_SETTINGS, genres: [...DEFAULT_SETTINGS.genres], extras: [...DEFAULT_SETTINGS.extras] };
  }
}

function saveSettings(settings: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const setSettings = useCallback((updater: Settings | ((prev: Settings) => Settings)) => {
    setSettingsState(updater);
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState({
      ...DEFAULT_SETTINGS,
      genres: [...DEFAULT_SETTINGS.genres],
      extras: [...DEFAULT_SETTINGS.extras],
    });
  }, []);

  return { settings, setSettings, resetSettings };
}
