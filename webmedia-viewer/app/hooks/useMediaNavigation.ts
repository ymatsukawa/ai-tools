import { useCallback, useState } from "react";

export const useMediaNavigation = (totalMedia: number) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    null
  );

  const selectMedia = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const goToPrevious = useCallback(() => {
    if (selectedIndex === null || totalMedia === 0) return;
    const newIndex =
      selectedIndex === 0 ? totalMedia - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
  }, [selectedIndex, totalMedia]);

  const goToNext = useCallback(() => {
    if (selectedIndex === null || totalMedia === 0) return;
    const newIndex =
      selectedIndex === totalMedia - 1 ? 0 : selectedIndex + 1;
    setSelectedIndex(newIndex);
  }, [selectedIndex, totalMedia]);

  return {
    selectedIndex,
    selectMedia,
    closeModal,
    goToPrevious,
    goToNext,
  };
};
