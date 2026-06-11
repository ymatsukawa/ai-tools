import { useTables } from "~/hooks/useDbApi";
import type { DbSettings, DbType } from "~/utils/settings";
import { RadioGroup, TextField, inputClass, labelClass } from "./form";

interface DbSettingsPanelProps {
  db: DbSettings;
  readonlyForced: boolean;
  updateDb: (partial: Partial<DbSettings>) => void;
}

export function DbSettingsPanel({ db, readonlyForced, updateDb }: DbSettingsPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className={labelClass}>
        db type
        <select
          value={db.type}
          onChange={(e) => updateDb({ type: e.target.value as DbType })}
          className={inputClass}
        >
          <option value="mysql">MySQL</option>
          <option value="postgres">PostgreSQL</option>
          <option value="sqlite">SQLite</option>
        </select>
      </label>

      <div>
        <RadioGroup<boolean>
          legend="readonly"
          name="readonly"
          value={readonlyForced || db.readonly}
          disabled={readonlyForced}
          options={[
            { value: true, label: "yes" },
            { value: false, label: "no" },
          ]}
          onChange={(readonly) => updateDb({ readonly })}
        />
        {readonlyForced && (
          <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
            Host is not localhost — readonly is forced to yes.
          </p>
        )}
      </div>

      {db.type === "sqlite" ? (
        <TextField
          label="file path (absolute)"
          value={db.sqlitePath}
          placeholder="/path/to/database.sqlite3"
          onChange={(sqlitePath) => updateDb({ sqlitePath })}
        />
      ) : (
        <ServerConnectionFields db={db} updateDb={updateDb} />
      )}

      <ConnectionTest db={db} />
    </div>
  );
}

function ServerConnectionFields({
  db,
  updateDb,
}: {
  db: DbSettings;
  updateDb: (partial: Partial<DbSettings>) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <TextField
            label="host"
            value={db.host}
            onChange={(host) => updateDb({ host })}
          />
        </div>
        <TextField
          label="port"
          type="number"
          value={db.port}
          onChange={(port) => updateDb({ port: Number(port) })}
        />
      </div>
      <TextField
        label="db:user"
        value={db.user}
        onChange={(user) => updateDb({ user })}
      />
      <TextField
        label="db:name"
        value={db.database}
        onChange={(database) => updateDb({ database })}
      />
      <TextField
        label="db:password"
        type="password"
        value={db.password}
        onChange={(password) => updateDb({ password })}
      />
    </>
  );
}

function ConnectionTest({ db }: { db: DbSettings }) {
  const { refresh: testConnection, data: result, isLoading: isTesting } = useTables();

  return (
    <div>
      <button
        type="button"
        disabled={isTesting}
        onClick={() => testConnection(db)}
        className="rounded border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-40 dark:border-gray-700 dark:hover:bg-gray-800"
      >
        {isTesting ? "Testing…" : "Connection test"}
      </button>
      {!isTesting && result && (
        <div
          className={`mt-2 rounded border px-2 py-1.5 text-xs ${
            result.ok
              ? "border-green-300 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
              : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          <p className="font-semibold">{result.ok ? "✓ Success" : "✗ Failed"}</p>
          <p className="mt-0.5 break-words">
            {result.ok
              ? `Connected (${result.tables.length} table(s)). The connection is kept open and reused for this session.`
              : result.error}
          </p>
        </div>
      )}
    </div>
  );
}
