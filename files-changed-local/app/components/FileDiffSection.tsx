import type { FileDiff } from "~/types/diff";
import { DiffTable } from "./DiffTable";

const STATUS_BADGE: Record<
  FileDiff["status"],
  { label: string; className: string }
> = {
  added: { label: "Added", className: "border-[#aceebb] text-[#1a7f37]" },
  modified: { label: "Modified", className: "border-[#d4a72c66] text-[#9a6700]" },
  deleted: { label: "Deleted", className: "border-[#ff818266] text-[#cf222e]" },
  renamed: { label: "Renamed", className: "border-[#d0d7de] text-[#57606a]" },
};

interface FileDiffSectionProps {
  file: FileDiff;
  collapsed: boolean;
  onToggle: () => void;
  registerRef: (el: HTMLElement | null) => void;
}

export function FileDiffSection({
  file,
  collapsed,
  onToggle,
  registerRef,
}: FileDiffSectionProps) {
  const badge = STATUS_BADGE[file.status];

  return (
    <section
      ref={registerRef}
      className="mb-4 rounded-md border border-[#d0d7de] bg-white"
    >
      <header
        className="sticky top-14 z-10 flex cursor-pointer items-center gap-2 rounded-t-md border-b border-[#d0d7de] bg-[#f6f8fa] px-3 py-2"
        onClick={onToggle}
      >
        <span
          className={`text-[#57606a] transition-transform ${collapsed ? "" : "rotate-90"}`}
        >
          ▶
        </span>
        <span className="font-mono text-sm font-semibold text-[#1f2328]">
          {file.oldPath ? (
            <>
              {file.oldPath} <span className="text-[#57606a]">→</span> {file.path}
            </>
          ) : (
            file.path
          )}
        </span>
        <span
          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
        <span className="ml-auto text-xs">
          {file.binary ? (
            <span className="text-[#57606a]">BIN</span>
          ) : (
            <>
              <span className="font-semibold text-[#1a7f37]">
                +{file.additions}
              </span>{" "}
              <span className="font-semibold text-[#cf222e]">
                −{file.deletions}
              </span>
            </>
          )}
        </span>
      </header>
      {!collapsed && (
        <div className="overflow-x-auto rounded-b-md">
          {file.binary ? (
            <EmptyBody text="Binary file not shown" />
          ) : file.hunks.length === 0 ? (
            <EmptyBody
              text={
                file.status === "renamed"
                  ? "File renamed without changes"
                  : "No content changes"
              }
            />
          ) : (
            <DiffTable hunks={file.hunks} />
          )}
        </div>
      )}
    </section>
  );
}

function EmptyBody({ text }: { text: string }) {
  return (
    <div className="px-4 py-8 text-center text-sm text-[#57606a]">{text}</div>
  );
}
