import { pickRandom, randomInt } from "../lib/random";
import type { Settings } from "../hooks/useSettings";

export type PromptResult = {
  year: number;
  genre: string;
  extra: string;
};

type GenerateViewProps = {
  settings: Settings;
  result: PromptResult | null;
  onGenerate: (result: PromptResult) => void;
};

export function GenerateView({ settings, result, onGenerate }: GenerateViewProps) {
  function handleGenerate() {
    const min = Math.min(settings.yearMin, settings.yearMax);
    const max = Math.max(settings.yearMin, settings.yearMax);
    const year = randomInt(min, max);
    const genre = pickRandom(settings.genres) ?? "—";
    const extra = pickRandom(settings.extras) ?? "—";
    onGenerate({ year, genre, extra });
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

      <button type="button" className="generate-btn" onClick={handleGenerate}>
        Generate
      </button>
    </div>
  );
}
