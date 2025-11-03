import { useEffect } from "react";

interface UseKeyboardNavigationProps {
  isActive: boolean;
  onEscape: () => void;
  onArrowLeft: () => void;
  onArrowRight: () => void;
}

export const useKeyboardNavigation = ({
  isActive,
  onEscape,
  onArrowLeft,
  onArrowRight,
}: UseKeyboardNavigationProps) => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEscape();
      } else if (e.key === 'ArrowLeft') {
        onArrowLeft();
      } else if (e.key === 'ArrowRight') {
        onArrowRight();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onEscape, onArrowLeft, onArrowRight]);
};
