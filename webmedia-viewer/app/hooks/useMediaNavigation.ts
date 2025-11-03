import { useState } from "react";

export const useMediaNavigation = (totalMedia: number) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    null
  );

  const selectMedia = (index: number) => {
    setSelectedIndex(index);
  };

  const closeModal = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex === null || totalMedia === 0) return;
    const newIndex =
      selectedIndex === 0 ? totalMedia - 1 : selectedIndex - 1;
    setSelectedIndex(newIndex);
  };

  const goToNext = () => {
    if (selectedIndex === null || totalMedia === 0) return;
    const newIndex =
      selectedIndex === totalMedia - 1 ? 0 : selectedIndex + 1;
    setSelectedIndex(newIndex);
  };

  return {
    selectedIndex,
    selectMedia,
    closeModal,
    goToPrevious,
    goToNext,
  };
};
