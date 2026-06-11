export type DbType = "mysql" | "postgres" | "sqlite";

export type DbSettings = {
  type: DbType;
  readonly: boolean;
  host: string;
  port: number;
  user: string;
  database: string;
  password: string;
  sqlitePath: string;
};

export type FontSettings = {
  uiFont: string;
  uiFontSize: number;
  editorFont: string;
  editorFontSize: number;
};

export type CopyFormat = "csv" | "tsv";
export type DataEncoding = "utf-8" | "shift-jis";
export type DataNewline = "lf" | "crlf";

export type DataSettings = {
  copyFormat: CopyFormat;
  withHeader: boolean;
  encoding: DataEncoding;
  newline: DataNewline;
};

export type AppSettings = {
  db: DbSettings;
  font: FontSettings;
  data: DataSettings;
};

export const STORAGE_KEY = "dbweb-local:settings:v1";

export const FONT_SIZE_MIN = 12;
export const FONT_SIZE_MAX = 24;

export const UI_FONTS = [
  "Inter",
  "system-ui",
  "Segoe UI",
  "Roboto",
  "Noto Sans JP",
  "Verdana",
] as const;

export const EDITOR_FONTS = [
  "Menlo",
  "Monaco",
  "Consolas",
  "JetBrains Mono",
  "Fira Code",
  "Source Code Pro",
] as const;

export function defaultPortFor(type: DbType): number {
  switch (type) {
    case "mysql":
      return 3306;
    case "postgres":
      return 5432;
    case "sqlite":
      return 0;
  }
}

export const DEFAULT_SETTINGS: AppSettings = {
  db: {
    type: "mysql",
    readonly: false,
    host: "localhost",
    port: 3306,
    user: "",
    database: "",
    password: "",
    sqlitePath: "",
  },
  font: {
    uiFont: "Inter",
    uiFontSize: 16,
    editorFont: "Menlo",
    editorFontSize: 18,
  },
  data: {
    copyFormat: "csv",
    withHeader: true,
    encoding: "utf-8",
    newline: "lf",
  },
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AppSettings> & {
      general?: Partial<DataSettings>; // pre-rename key, kept for migration
    };
    return {
      db: { ...DEFAULT_SETTINGS.db, ...parsed.db },
      font: { ...DEFAULT_SETTINGS.font, ...parsed.font },
      data: { ...DEFAULT_SETTINGS.data, ...parsed.general, ...parsed.data },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (private mode etc.) — settings stay in memory
  }
}
