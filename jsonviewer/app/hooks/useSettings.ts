import { useState, useCallback } from 'react';
import { useCookie } from './useCookie';

export const useSettings = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useCookie('jsonviewer-font', 'JetBrains Mono');
  const [fontSize, setFontSize] = useCookie('jsonviewer-fontSize', 15);

  const openSettings = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleFontChange = useCallback((font: string) => {
    setSelectedFont(font);
  }, []);

  const handleFontSizeChange = useCallback((size: number) => {
    setFontSize(size);
  }, []);

  return {
    isOpen,
    selectedFont,
    fontSize,
    openSettings,
    closeSettings,
    handleFontChange,
    handleFontSizeChange,
  };
};
