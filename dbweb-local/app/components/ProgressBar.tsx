interface ProgressBarProps {
  done: number;
  total: number;
  barClassName?: string;
}

export function ProgressBar({
  done,
  total,
  barClassName = "bg-blue-600",
}: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div className="h-2 overflow-hidden rounded bg-gray-200 dark:bg-gray-800">
      <div
        className={`h-full transition-[width] duration-200 ${barClassName}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
