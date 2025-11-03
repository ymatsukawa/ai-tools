import { memo } from "react";

interface NavigationButtonProps {
  direction: 'prev' | 'next';
  onClick: () => void;
}

const NavigationButtonComponent = ({
  direction,
  onClick,
}: NavigationButtonProps) => {
  const isPrev = direction === 'prev';
  const position = isPrev ? 'left-0' : 'right-0';
  const label = isPrev ? 'Previous (←)' : 'Next (→)';
  const iconPath = isPrev
    ? 'M15 19l-7-7 7-7'
    : 'M9 5l7 7-7 7';

  return (
    <button
      className={`absolute ${position} top-1/2 -translate-y-1/2 z-10 py-20 px-8 group`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={label}
    >
      <div className="bg-black bg-opacity-50 group-hover:bg-opacity-75 rounded-full p-3 transition-colors">
        <svg
          className="w-8 h-8 text-white group-hover:text-gray-300 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={iconPath}
          />
        </svg>
      </div>
    </button>
  );
};

export const NavigationButton = memo(NavigationButtonComponent);
