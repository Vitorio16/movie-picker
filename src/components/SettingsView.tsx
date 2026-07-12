import { useMemo, useState } from "react";
import type { ExcludedCombination } from "../hooks/useExcluded";
import type { Settings } from "../hooks/useSettings";

type SettingsViewProps = {
  settings: Settings;
  onChange: (settings: Settings) => void;
  excluded: ExcludedCombination[];
  excludedLoading: boolean;
  onRemoveExcluded: (id: number) => Promise<void>;
};

function CompactEditableList({
  title,
  items,
  onChange,
  placeholder,
}: {
  title: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState(items.length <= 8);

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return items.map((value, index) => ({ value, index }));
    return items
      .map((value, index) => ({ value, index }))
      .filter(({ value }) => value.toLowerCase().includes(query));
  }, [items, filter]);

  function updateItem(index: number, value: string) {
    const next = [...items];
    next[index] = value;
    onChange(next);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function addItem() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft("");
    setExpanded(true);
  }

  return (
    <section className="settings-section compact-section">
      <button
        type="button"
        className="section-toggle"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
      >
        <span className="section-toggle-label">
          {title}
          <span className="section-count">{items.length}</span>
        </span>
        <span className="section-chevron">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="compact-panel">
          {items.length > 5 && (
            <input
              className="list-input list-filter"
              value={filter}
              placeholder={`Search ${title.toLowerCase()}…`}
              onChange={(e) => setFilter(e.target.value)}
            />
          )}

          <div className="list-scroll">
            {items.length === 0 && <p className="empty-hint">No items yet — add one below.</p>}
            {items.length > 0 && filtered.length === 0 && (
              <p className="empty-hint">No matches for &ldquo;{filter}&rdquo;.</p>
            )}
            {filtered.map(({ value, index }) => (
              <div className="list-row compact-row" key={index}>
                <input
                  className="list-input compact-input"
                  value={value}
                  onChange={(e) => updateItem(index, e.target.value)}
                  aria-label={`${title} item ${index + 1}`}
                />
                <button
                  type="button"
                  className="icon-btn icon-btn-sm danger"
                  onClick={() => removeItem(index)}
                  aria-label={`Remove ${title} item ${index + 1}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="add-row">
            <input
              className="list-input compact-input"
              value={draft}
              placeholder={placeholder}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addItem();
              }}
            />
            <button type="button" className="add-btn add-btn-sm" onClick={addItem}>
              Add
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function ExcludedList({
  items,
  loading,
  onRemove,
}: {
  items: ExcludedCombination[];
  loading: boolean;
  onRemove: (id: number) => Promise<void>;
}) {
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return items;
    return items.filter(
      (item) =>
        String(item.year).includes(query) ||
        item.genre.toLowerCase().includes(query) ||
        item.extra.toLowerCase().includes(query),
    );
  }, [items, filter]);

  return (
    <section className="settings-section compact-section">
      <button
        type="button"
        className="section-toggle"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
      >
        <span className="section-toggle-label">
          No movie found
          <span className="section-count">{items.length}</span>
        </span>
        <span className="section-chevron">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="compact-panel">
          <p className="section-hint">
            Combinations saved from Generate. These are skipped on future picks.
          </p>

          {loading ? (
            <p className="empty-hint">Loading…</p>
          ) : items.length === 0 ? (
            <p className="empty-hint">Nothing saved yet.</p>
          ) : (
            <>
              {items.length > 5 && (
                <input
                  className="list-input list-filter"
                  value={filter}
                  placeholder="Search saved combinations…"
                  onChange={(e) => setFilter(e.target.value)}
                />
              )}

              <div className="list-scroll">
                {filtered.length === 0 && (
                  <p className="empty-hint">No matches for &ldquo;{filter}&rdquo;.</p>
                )}
                {filtered.map((item) => (
                  <div className="excluded-row" key={item.id}>
                    <div className="excluded-details">
                      <span className="excluded-year">{item.year}</span>
                      <span className="excluded-text">{item.genre}</span>
                      <span className="excluded-text">{item.extra}</span>
                    </div>
                    <button
                      type="button"
                      className="icon-btn icon-btn-sm danger"
                      disabled={removingId === item.id}
                      onClick={() => {
                        setRemovingId(item.id);
                        void onRemove(item.id).finally(() => setRemovingId(null));
                      }}
                      aria-label={`Remove ${item.year} ${item.genre} ${item.extra}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}

export function SettingsView({
  settings,
  onChange,
  excluded,
  excludedLoading,
  onRemoveExcluded,
}: SettingsViewProps) {
  const yearError =
    settings.yearMin > settings.yearMax
      ? "Min year must be less than or equal to max year."
      : null;

  function setYearMin(value: number) {
    onChange({ ...settings, yearMin: value });
  }

  function setYearMax(value: number) {
    onChange({ ...settings, yearMax: value });
  }

  return (
    <div className="settings-view">
      <h2>Settings</h2>

      <section className="settings-section">
        <h3>Year range</h3>
        <div className="year-row">
          <div className="field">
            <label htmlFor="year-min">Min</label>
            <input
              id="year-min"
              type="number"
              min={1900}
              max={2100}
              value={settings.yearMin}
              onChange={(e) => setYearMin(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="year-max">Max</label>
            <input
              id="year-max"
              type="number"
              min={1900}
              max={2100}
              value={settings.yearMax}
              onChange={(e) => setYearMax(Number(e.target.value))}
            />
          </div>
        </div>
        {yearError && <p className="field-error">{yearError}</p>}
      </section>

      <CompactEditableList
        title="Genres"
        items={settings.genres}
        onChange={(genres) => onChange({ ...settings, genres })}
        placeholder="Add a genre…"
      />

      <CompactEditableList
        title="Extras"
        items={settings.extras}
        onChange={(extras) => onChange({ ...settings, extras })}
        placeholder="Add an extra…"
      />

      <ExcludedList
        items={excluded}
        loading={excludedLoading}
        onRemove={onRemoveExcluded}
      />
    </div>
  );
}
