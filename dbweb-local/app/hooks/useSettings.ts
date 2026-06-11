import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SETTINGS,
  defaultPortFor,
  loadSettings,
  saveSettings,
  type AppSettings,
  type DataSettings,
  type DbSettings,
  type FontSettings,
} from "~/utils/settings";
import { effectiveReadonly, isLocalhost } from "~/utils/localhost";

function mergeDb(prev: AppSettings, partial: Partial<DbSettings>): DbSettings {
  const db = { ...prev.db, ...partial };

  // Follow the default port when switching db type, unless customized
  const isTypeSwitch = partial.type && partial.type !== prev.db.type;
  const portWasDefault = prev.db.port === defaultPortFor(prev.db.type);
  if (isTypeSwitch && portWasDefault) {
    db.port = defaultPortFor(db.type);
  }
  return db;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  // Load after mount to avoid SSR hydration mismatch
  useEffect(() => {
    setSettings(loadSettings());
    setLoaded(true);
  }, []);

  const commit = useCallback((next: AppSettings) => {
    saveSettings(next);
    return next;
  }, []);

  const updateDb = useCallback(
    (partial: Partial<DbSettings>) =>
      setSettings((prev) => commit({ ...prev, db: mergeDb(prev, partial) })),
    [commit]
  );

  const updateFont = useCallback(
    (partial: Partial<FontSettings>) =>
      setSettings((prev) => commit({ ...prev, font: { ...prev.font, ...partial } })),
    [commit]
  );

  const updateData = useCallback(
    (partial: Partial<DataSettings>) =>
      setSettings((prev) => commit({ ...prev, data: { ...prev.data, ...partial } })),
    [commit]
  );

  const readonlyForced =
    settings.db.type !== "sqlite" && !isLocalhost(settings.db.host);

  const isConfigured =
    settings.db.type === "sqlite"
      ? settings.db.sqlitePath !== ""
      : settings.db.database !== "" && settings.db.user !== "";

  return {
    settings,
    loaded,
    updateDb,
    updateFont,
    updateData,
    readonlyForced,
    readonly: effectiveReadonly(settings.db),
    isConfigured,
  };
}
