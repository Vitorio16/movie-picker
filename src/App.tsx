import { useState } from "react";
import { GenerateView, type PromptResult } from "./components/GenerateView";
import { LoginView } from "./components/LoginView";
import { SettingsView } from "./components/SettingsView";
import { SetupView } from "./components/SetupView";
import { useAuth } from "./hooks/useAuth";
import { useExcluded } from "./hooks/useExcluded";
import { useSettings } from "./hooks/useSettings";

type View = "generate" | "settings";

export default function App() {
  const auth = useAuth();
  const { settings, setSettings, loading: settingsLoading } = useSettings(auth.token);
  const excluded = useExcluded(auth.token);
  const [view, setView] = useState<View>("generate");
  const [result, setResult] = useState<PromptResult | null>(null);

  if (auth.loading) {
    return (
      <div className="app">
        <p className="auth-copy">Loading…</p>
      </div>
    );
  }

  if (auth.needsSetup) {
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="brand">Movie Picker</h1>
        </header>
        <SetupView onSetup={auth.setup} />
      </div>
    );
  }

  if (!auth.token) {
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="brand">Movie Picker</h1>
        </header>
        <LoginView onLogin={auth.login} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">Movie Picker</h1>
        <div className="header-actions">
          {view === "generate" ? (
            <button type="button" className="nav-btn" onClick={() => setView("settings")}>
              Settings
            </button>
          ) : (
            <button type="button" className="nav-btn" onClick={() => setView("generate")}>
              Back
            </button>
          )}
          <button type="button" className="nav-btn" onClick={auth.logout}>
            Log out
          </button>
        </div>
      </header>

      {settingsLoading ? (
        <p className="auth-copy">Loading settings…</p>
      ) : view === "generate" ? (
        <GenerateView
          settings={settings}
          result={result}
          excludedKeys={excluded.excludedKeys}
          onGenerate={setResult}
          onNoMovieFound={async (combo) => {
            await excluded.addExcluded(combo);
          }}
        />
      ) : (
        <SettingsView
          settings={settings}
          onChange={setSettings}
          excluded={excluded.items}
          excludedLoading={excluded.loading}
          onRemoveExcluded={excluded.removeExcluded}
        />
      )}
    </div>
  );
}
