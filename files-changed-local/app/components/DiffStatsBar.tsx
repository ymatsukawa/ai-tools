interface DiffStatsBarProps {
  fileCount: number;
  totalAdditions: number;
  totalDeletions: number;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export function DiffStatsBar({
  fileCount,
  totalAdditions,
  totalDeletions,
  onExpandAll,
  onCollapseAll,
}: DiffStatsBarProps) {
  return (
    <div className="flex items-center gap-3 py-4 text-sm text-[#1f2328]">
      <span>
        <span className="font-semibold">{fileCount}</span>{" "}
        {fileCount === 1 ? "file" : "files"} changed
      </span>
      <span className="font-semibold text-[#1a7f37]">+{totalAdditions}</span>
      <span className="font-semibold text-[#cf222e]">−{totalDeletions}</span>
      <span className="ml-auto flex gap-2">
        <button
          type="button"
          onClick={onExpandAll}
          className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-3 py-1 text-xs font-medium text-[#1f2328] hover:bg-[#eef1f4]"
        >
          Expand all
        </button>
        <button
          type="button"
          onClick={onCollapseAll}
          className="rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-3 py-1 text-xs font-medium text-[#1f2328] hover:bg-[#eef1f4]"
        >
          Collapse all
        </button>
      </span>
    </div>
  );
}
