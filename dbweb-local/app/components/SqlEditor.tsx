import { useCallback, useImperativeHandle, useMemo, useRef, type Ref } from "react";
import CodeMirror, {
  keymap,
  Prec,
  type EditorView,
  type ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { sql, MySQL, PostgreSQL, SQLite } from "@codemirror/lang-sql";
import { formatSql } from "~/utils/format-sql";
import type { DbType } from "~/utils/settings";

export interface SqlEditorHandle {
  setText: (text: string) => void;
}

interface SqlEditorProps {
  ref?: Ref<SqlEditorHandle>;
  dbType: DbType;
  isRunning: boolean;
  canRun: boolean;
  onRun: (sql: string) => void;
  batchMode: boolean;
  onTestRun: (sql: string) => void;
  onShowHelp: () => void;
}

const DIALECTS = {
  mysql: MySQL,
  postgres: PostgreSQL,
  sqlite: SQLite,
} as const;

/**
 * PERFORMANCE INVARIANTS (typing latency):
 * - The editor text lives OUTSIDE React state. Keeping it in state
 *   re-rendered the whole app per keystroke and rebuilt the CodeMirror
 *   extensions, killing autocomplete responsiveness. Text is tracked in
 *   a ref and handed to the parent only when Run/Test run fires.
 * - The `extensions` memo must depend only on `dbType` and stable
 *   callbacks. Changing props (onRun, batchMode, …) are read through
 *   refs so the keymap never forces a CodeMirror reconfigure.
 * - CodeMirror stays uncontrolled (no `value` prop).
 */
export function SqlEditor({
  ref,
  dbType,
  isRunning,
  canRun,
  onRun,
  batchMode,
  onTestRun,
  onShowHelp,
}: SqlEditorProps) {
  const cmRef = useRef<ReactCodeMirrorRef>(null);
  const textRef = useRef("");
  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;
  const onTestRunRef = useRef(onTestRun);
  onTestRunRef.current = onTestRun;
  const batchModeRef = useRef(batchMode);
  batchModeRef.current = batchMode;

  const replaceText = useCallback((text: string) => {
    textRef.current = text;
    const view = cmRef.current?.view;
    if (!view) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: text },
    });
    view.focus();
  }, []);

  useImperativeHandle(ref, () => ({ setText: replaceText }), [replaceText]);

  const runCurrentText = useCallback(() => {
    onRunRef.current(textRef.current);
  }, []);

  const testRunCurrentText = useCallback(() => {
    onTestRunRef.current(textRef.current);
  }, []);

  const formatCurrentText = useCallback(() => {
    const formatted = formatSql(textRef.current, dbType);
    if (formatted !== textRef.current) replaceText(formatted);
  }, [dbType, replaceText]);

  const handleChange = useCallback((value: string) => {
    textRef.current = value;
  }, []);

  const extensions = useMemo(() => {
    const run = () => {
      runCurrentText();
      return true;
    };
    const format = (_view: EditorView) => {
      formatCurrentText();
      return true;
    };
    // Registered unconditionally so the extensions stay stable; no-op
    // (via batchModeRef) outside batch mode
    const testRun = () => {
      if (!batchModeRef.current) return false;
      testRunCurrentText();
      return true;
    };
    return [
      sql({ dialect: DIALECTS[dbType] }),
      Prec.highest(
        keymap.of([
          { key: "Mod-Enter", run },
          { key: "Ctrl-Enter", run },
          { key: "Ctrl-f", run: format },
          { key: "Ctrl-t", run: testRun },
        ])
      ),
    ];
  }, [dbType, runCurrentText, formatCurrentText, testRunCurrentText]);

  return (
    <div className="flex h-full flex-col">
      <EditorToolbar
        batchMode={batchMode}
        isRunning={isRunning}
        canRun={canRun}
        onShowHelp={onShowHelp}
        onFormat={formatCurrentText}
        onTestRun={testRunCurrentText}
        onRun={runCurrentText}
      />
      <div
        className="flex-1 overflow-auto"
        style={{
          fontFamily: "var(--editor-font)",
          fontSize: "var(--editor-font-size)",
        }}
      >
        <CodeMirror
          ref={cmRef}
          onChange={handleChange}
          extensions={extensions}
          height="100%"
          style={{ height: "100%" }}
          basicSetup={{ foldGutter: false }}
        />
      </div>
    </div>
  );
}

const toolbarButtonClass =
  "rounded border border-gray-300 px-3 py-1 text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800";

interface EditorToolbarProps {
  batchMode: boolean;
  isRunning: boolean;
  canRun: boolean;
  onShowHelp: () => void;
  onFormat: () => void;
  onTestRun: () => void;
  onRun: () => void;
}

function EditorToolbar({
  batchMode,
  isRunning,
  canRun,
  onShowHelp,
  onFormat,
  onTestRun,
  onRun,
}: EditorToolbarProps) {
  const busy = !canRun || isRunning;
  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-3 py-1.5 dark:border-gray-800">
      <span className="text-xs font-medium text-gray-500">
        SQL{batchMode ? " (batch)" : ""}
      </span>
      <div className="flex items-center gap-2">
        {batchMode && (
          <button
            type="button"
            onClick={onShowHelp}
            className={toolbarButtonClass}
            title="Show placeholder syntax"
          >
            ? Placeholders
          </button>
        )}
        <button
          type="button"
          onClick={onFormat}
          className={toolbarButtonClass}
          title="Format (Ctrl+F)"
        >
          Format
        </button>
        {batchMode && (
          <button
            type="button"
            disabled={busy}
            onClick={onTestRun}
            className="rounded border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-40 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
            title="Test run a single row (Ctrl+T)"
          >
            Test run
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={onRun}
          className={`rounded px-3 py-1 text-xs font-medium text-white disabled:opacity-40 ${
            batchMode ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
          title={batchMode ? "Batch run (Ctrl+Enter)" : "Run (Ctrl+Enter)"}
        >
          {isRunning ? "Running…" : batchMode ? "Batch run" : "Run"}
        </button>
      </div>
    </div>
  );
}
