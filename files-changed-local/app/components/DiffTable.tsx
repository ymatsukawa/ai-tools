import type { DiffHunk, DiffLine } from "~/types/diff";
import { hasTodoMarker, TODO_MARKERS } from "~/lib/todo-marker";

const LINE_BG: Record<DiffLine["type"], string> = {
  add: "bg-[#e6ffec]",
  del: "bg-[#ffebe9]",
  context: "bg-white",
};

const GUTTER_BG: Record<DiffLine["type"], string> = {
  add: "bg-[#ccffd8]",
  del: "bg-[#ffcecb]",
  context: "bg-white",
};

const MARKER: Record<DiffLine["type"], string> = {
  add: "+",
  del: "-",
  context: " ",
};

interface DiffTableProps {
  hunks: DiffHunk[];
}

export function DiffTable({ hunks }: DiffTableProps) {
  return (
    <table className="w-full border-collapse font-mono text-[length:var(--app-code-size,18px)] leading-[1.65]">
      <tbody>
        {hunks.map((hunk, hi) => (
          <HunkRows key={hi} hunk={hunk} />
        ))}
      </tbody>
    </table>
  );
}

function HunkRows({ hunk }: { hunk: DiffHunk }) {
  return (
    <>
      <tr className="bg-[#ddf4ff] text-[#57606a]">
        <td className="w-12 select-none" colSpan={2} />
        <td className="px-2 py-1 whitespace-pre-wrap">{hunk.header}</td>
      </tr>
      {hunk.lines.map((line, li) => {
        const warn = line.type === "add" && hasTodoMarker(line.content);
        const lineBg = warn ? "bg-[#aceebb]" : LINE_BG[line.type];
        const gutterBg = warn ? "bg-[#7ee0a3]" : GUTTER_BG[line.type];
        return (
          <tr key={li} className={lineBg}>
            <td
              className={`w-10 min-w-10 select-none px-2 text-right align-top text-[#6e7781] ${gutterBg}`}
              title={warn ? `Added line contains ${TODO_MARKERS}` : undefined}
            >
              {warn ? "⚠️" : (line.oldLineNo ?? "")}
            </td>
            <td
              className={`w-10 min-w-10 select-none px-2 text-right align-top text-[#6e7781] ${gutterBg}`}
            >
              {line.newLineNo ?? ""}
            </td>
            <td className="px-2 align-top whitespace-pre-wrap break-all text-[#1f2328]">
              <span className="select-none">{MARKER[line.type]}</span>
              {line.content}
            </td>
          </tr>
        );
      })}
    </>
  );
}
