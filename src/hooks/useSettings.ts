import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../lib/api";

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

function cloneDefaults(): Settings {
  return {
    ...DEFAULT_SETTINGS,
    genres: [...DEFAULT_SETTINGS.genres],
    extras: [...DEFAULT_SETTINGS.extras],
  };
}

export function useSettings(token: string | null) {
  const [settings, setSettingsState] = useState<Settings>(cloneDefaults);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(true);

  useEffect(() => {
    if (!token) {
      setSettingsState(cloneDefaults());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const data = (await apiFetch("/api/settings", { token })) as Settings;
        if (cancelled) return;
        skipNextSave.current = true;
        setSettingsState({
          yearMin: data.yearMin,
          yearMax: data.yearMax,
          genres: Array.isArray(data.genres) ? data.genres : [...DEFAULT_SETTINGS.genres],
          extras: Array.isArray(data.extras) ? data.extras : [...DEFAULT_SETTINGS.extras],
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load settings");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    if (!token) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void apiFetch("/api/settings", {
        method: "PUT",
        token,
        body: JSON.stringify(settings),
      }).catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to save settings");
      });
    }, 400);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [settings, token]);

  const setSettings = useCallback((updater: Settings | ((prev: Settings) => Settings)) => {
    setSettingsState(updater);
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(cloneDefaults());
  }, []);

  return { settings, setSettings, resetSettings, loading, error };
}
