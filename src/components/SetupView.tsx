import { useState, type FormEvent } from "react";

type SetupViewProps = {
  onSetup: (username: string, password: string, confirmPassword: string) => Promise<void>;
};

export function SetupView({ onSetup }: SetupViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSetup(username, password, confirmPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-view">
      <h2>Create your account</h2>
      <p className="auth-copy">First launch — set up the admin user for this app.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="setup-username">Username</label>
          <input
            id="setup-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            minLength={2}
          />
        </div>
        <div className="field">
          <label htmlFor="setup-password">Password</label>
          <input
            id="setup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>
        <div className="field">
          <label htmlFor="setup-confirm">Confirm password</label>
          <input
            id="setup-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>
        {error && <p className="field-error">{error}</p>}
        <button type="submit" className="generate-btn auth-submit" disabled={submitting}>
          {submitting ? "Creating…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
