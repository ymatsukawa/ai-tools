import { useCallback, useEffect, useState } from "react";
import {
  applyToDocument,
  DEFAULTS,
  loadSettings,
  saveSettings,
  STORAGE_KEY,
  type Settings,
} from "../lib/settings";
import { resolveTheme, type ResolvedTheme } from "../lib/theme";
import { useSystemTheme } from "./useSystemTheme";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const systemDark = useSystemTheme();

  useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  const resolved: ResolvedTheme = resolveTheme(settings.theme, systemDark);

  useEffect(() => {
    if (!hydrated) return;
    applyToDocument(settings, resolved);
    saveSettings(settings);
  }, [settings, resolved, hydrated]);

  // cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        setSettings({ ...DEFAULTS, ...JSON.parse(e.newValue) });
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => setSettings(DEFAULTS), []);

  return { settings, update, reset, resolved, hydrated };
}
