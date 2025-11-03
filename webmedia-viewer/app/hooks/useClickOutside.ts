import { useEffect } from "react";

interface UseClickOutsideProps {
  isActive: boolean;
  onClickOutside: () => void;
  excludeSelectors: string[];
}

export const useClickOutside = ({
  isActive,
  onClickOutside,
  excludeSelectors,
}: UseClickOutsideProps) => {
  useEffect(() => {
    if (!isActive) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isExcluded = excludeSelectors.some(selector =>
        target.closest(selector)
      );

      if (!isExcluded) {
        onClickOutside();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, [isActive, onClickOutside, excludeSelectors]);
};
