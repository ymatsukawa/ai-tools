import { memo } from "react";

interface ProgressBarProps {
  progress: number;
}

const ProgressBarComponent = ({ progress }: ProgressBarProps) => {
  return (
    <div className="h-1 bg-gray-200">
      <div
        className="h-full bg-blue-600 transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export const ProgressBar = memo(ProgressBarComponent);
