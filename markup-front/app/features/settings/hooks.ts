import { useState, useEffect, useCallback } from 'react';
import { loadSelectedFont, saveSelectedFont } from '../../shared/lib/utils';
import { loadFont } from '../../shared/lib/fontLoader';
import { fontOptions } from '../../shared/config/fonts';

export function useSettings() {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Inter");

  // Load saved font on mount
  useEffect(() => {
    const loadedFont = loadSelectedFont();
    const isValidFont = fontOptions.some(option => option.value === loadedFont);
    if (isValidFont) {
      setSelectedFont(loadedFont);
      // Dynamically load the font
      loadFont(loadedFont);
    } else {
      // Load default font
      loadFont("Inter");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  const handleSettingsClose = useCallback((): void => {
    setShowSettings(false);
  }, []);

  const handleSettingsOpen = useCallback((): void => {
    setShowSettings(true);
  }, []);

  const handleFontChange = useCallback((newFont: string): void => {
    setSelectedFont(newFont);
    saveSelectedFont(newFont);
    // Dynamically load the selected font
    loadFont(newFont);
  }, []);

  return {
    showSettings,
    selectedFont,
    handleSettingsClose,
    handleSettingsOpen,
    handleFontChange
  };
}