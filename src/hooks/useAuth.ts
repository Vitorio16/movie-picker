import { useCallback, useEffect, useState } from "react";
import {
  apiFetch,
  clearToken,
  loadStoredToken,
  storeToken,
} from "../lib/api";

type AuthState = {
  loading: boolean;
  needsSetup: boolean | null;
  token: string | null;
  username: string | null;
  error: string | null;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    loading: true,
    needsSetup: null,
    token: loadStoredToken(),
    username: null,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const status = (await apiFetch("/api/setup/status")) as { needsSetup: boolean };
      if (status.needsSetup) {
        clearToken();
        setState({
          loading: false,
          needsSetup: true,
          token: null,
          username: null,
          error: null,
        });
        return;
      }

      const token = loadStoredToken();
      if (!token) {
        setState({
          loading: false,
          needsSetup: false,
          token: null,
          username: null,
          error: null,
        });
        return;
      }

      const me = (await apiFetch("/api/me", { token })) as { username: string };
      setState({
        loading: false,
        needsSetup: false,
        token,
        username: me.username,
        error: null,
      });
    } catch {
      clearToken();
      setState({
        loading: false,
        needsSetup: false,
        token: null,
        username: null,
        error: null,
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const setup = useCallback(
    async (username: string, password: string, confirmPassword: string) => {
      const result = (await apiFetch("/api/setup", {
        method: "POST",
        body: JSON.stringify({ username, password, confirmPassword }),
      })) as { token: string; username: string };
      storeToken(result.token);
      setState({
        loading: false,
        needsSetup: false,
        token: result.token,
        username: result.username,
        error: null,
      });
    },
    [],
  );

  const login = useCallback(async (username: string, password: string) => {
    const result = (await apiFetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })) as { token: string; username: string };
    storeToken(result.token);
    setState({
      loading: false,
      needsSetup: false,
      token: result.token,
      username: result.username,
      error: null,
    });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setState({
      loading: false,
      needsSetup: false,
      token: null,
      username: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    setup,
    login,
    logout,
    refresh,
  };
}
