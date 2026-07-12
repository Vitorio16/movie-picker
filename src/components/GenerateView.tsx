import { useState } from "react";
import type { Combination } from "../lib/combinations";
import { generateUnique } from "../lib/combinations";
import type { Settings } from "../hooks/useSettings";

export type PromptResult = Combination;

type GenerateViewProps = {
  settings: Settings;
  result: PromptResult | null;
  excludedKeys: Set<string>;
  onGenerate: (result: PromptResult) => void;
  onNoMovieFound: (result: PromptResult) => Promise<void>;
};

export function GenerateView({
  settings,
  result,
  excludedKeys,
  onGenerate,
  onNoMovieFound,
}: GenerateViewProps) {
  const [exhausted, setExhausted] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleGenerate() {
    setExhausted(false);
    const next = generateUnique(settings, excludedKeys);
    if (next === "exhausted") {
      setExhausted(true);
      return;
    }
    onGenerate(next);
  }

  async function handleNoMovieFound() {
    if (!result || saving) return;
    setSaving(true);
    try {
      await onNoMovieFound(result);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="generate-view">
      <div className="results">
        <div className="result-item">
          <span className="result-label">Year</span>
          <span className={`result-value${result ? "" : " is-placeholder"}`}>
            {result ? result.year : "—"}
          </span>
        </div>
        <div className="result-item">
          <span className="result-label">Genre</span>
          <span className={`result-value${result ? "" : " is-placeholder"}`}>
            {result ? result.genre : "—"}
          </span>
        </div>
        <div className="result-item">
          <span className="result-label">Extra</span>
          <span className={`result-value${result ? "" : " is-placeholder"}`}>
            {result ? result.extra : "—"}
          </span>
        </div>
      </div>

      <div className="generate-actions">
        <button type="button" className="generate-btn" onClick={handleGenerate}>
          Generate
        </button>
        {result && (
          <button
            type="button"
            className="secondary-btn"
            onClick={() => void handleNoMovieFound()}
            disabled={saving}
          >
            {saving ? "Saving…" : "No Movie Found"}
          </button>
        )}
      </div>

      {exhausted && (
        <p className="field-error generate-message">
          All combinations are excluded. Remove some in Settings to generate again.
        </p>
      )}
    </div>
  );
}
