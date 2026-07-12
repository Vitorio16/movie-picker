import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api";
import { combinationKey } from "../lib/combinations";

export type ExcludedCombination = {
  id: number;
  year: number;
  genre: string;
  extra: string;
  createdAt?: string;
};

export function useExcluded(token: string | null) {
  const [items, setItems] = useState<ExcludedCombination[]>([]);
  const [loading, setLoading] = useState(Boolean(token));

  const excludedKeys = useMemo(
    () => new Set(items.map((item) => combinationKey(item))),
    [items],
  );

  const refresh = useCallback(async () => {
    if (!token) {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = (await apiFetch("/api/excluded", { token })) as ExcludedCombination[];
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addExcluded = useCallback(
    async (combo: { year: number; genre: string; extra: string }) => {
      if (!token) return;
      const item = (await apiFetch("/api/excluded", {
        method: "POST",
        token,
        body: JSON.stringify(combo),
      })) as ExcludedCombination;
      setItems((prev) => {
        const without = prev.filter((entry) => entry.id !== item.id);
        return [item, ...without];
      });
    },
    [token],
  );

  const removeExcluded = useCallback(
    async (id: number) => {
      if (!token) return;
      await apiFetch(`/api/excluded/${id}`, { method: "DELETE", token });
      setItems((prev) => prev.filter((item) => item.id !== id));
    },
    [token],
  );

  return { items, excludedKeys, loading, addExcluded, removeExcluded, refresh };
}
