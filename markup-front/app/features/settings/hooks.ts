import { useState, useEffect } from 'react';
import { loadSelectedFont, saveSelectedFont } from '../../shared/lib/utils';
import { fontOptions } from '../../shared/config/fonts';

export function useSettings() {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Inter");

  useEffect(() => {
    const loadedFont = loadSelectedFont();
    const isValidFont = fontOptions.some(option => option.value === loadedFont);
    if (isValidFont && loadedFont !== selectedFont) {
      setSelectedFont(loadedFont);
    }
  }, []);

  const handleSettingsClose = (): void => {
    setShowSettings(false);
  };

  const handleSettingsOpen = (): void => {
    setShowSettings(true);
  };

  const handleFontChange = (newFont: string): void => {
    setSelectedFont(newFont);
    saveSelectedFont(newFont);
  };

  return {
    showSettings,
    selectedFont,
    handleSettingsClose,
    handleSettingsOpen,
    handleFontChange
  };
}