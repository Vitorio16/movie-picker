import { useState } from "react";
import type { Settings } from "../hooks/useSettings";

type SettingsViewProps = {
  settings: Settings;
  onChange: (settings: Settings) => void;
  onReset: () => void;
};

function EditableList({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

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
  }

  return (
    <div className="editable-list">
      {items.length === 0 && <p className="empty-hint">No items yet — add one below.</p>}
      {items.map((item, index) => (
        <div className="list-row" key={index}>
          <input
            className="list-input"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            aria-label={`Item ${index + 1}`}
          />
          <button
            type="button"
            className="icon-btn danger"
            onClick={() => removeItem(index)}
            aria-label={`Remove item ${index + 1}`}
          >
            ×
          </button>
        </div>
      ))}
      <div className="add-row">
        <input
          className="list-input"
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addItem();
          }}
        />
        <button type="button" className="add-btn" onClick={addItem}>
          Add
        </button>
      </div>
    </div>
  );
}

export function SettingsView({ settings, onChange, onReset }: SettingsViewProps) {
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

      <section className="settings-section">
        <h3>Genres</h3>
        <EditableList
          items={settings.genres}
          onChange={(genres) => onChange({ ...settings, genres })}
          placeholder="Add a genre…"
        />
      </section>

      <section className="settings-section">
        <h3>Extras</h3>
        <EditableList
          items={settings.extras}
          onChange={(extras) => onChange({ ...settings, extras })}
          placeholder="Add an extra…"
        />
      </section>
    </div>
  );
}
