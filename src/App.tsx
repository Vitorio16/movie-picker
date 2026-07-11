import { useState } from "react";
import { GenerateView, type PromptResult } from "./components/GenerateView";
import { SettingsView } from "./components/SettingsView";
import { useSettings } from "./hooks/useSettings";

type View = "generate" | "settings";

export default function App() {
  const { settings, setSettings, resetSettings } = useSettings();
  const [view, setView] = useState<View>("generate");
  const [result, setResult] = useState<PromptResult | null>(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">Random Prompt</h1>
        {view === "generate" ? (
          <button type="button" className="nav-btn" onClick={() => setView("settings")}>
            Settings
          </button>
        ) : (
          <button type="button" className="nav-btn" onClick={() => setView("generate")}>
            Back
          </button>
        )}
      </header>

      {view === "generate" ? (
        <GenerateView settings={settings} result={result} onGenerate={setResult} />
      ) : (
        <SettingsView
          settings={settings}
          onChange={setSettings}
          onReset={resetSettings}
        />
      )}
    </div>
  );
}
