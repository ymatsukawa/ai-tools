import { useState, useEffect, useCallback } from 'react';
import { loadSelectedFont, saveSelectedFont, loadSplitLevel, saveSplitLevel } from '../../shared/lib/utils';
import { loadFont } from '../../shared/lib/fontLoader';
import { fontOptions } from '../../shared/config/fonts';

export function useSettings() {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [splitLevel, setSplitLevel] = useState(1);

  // Load saved font and split level on mount
  useEffect(() => {
    const loadedFont = loadSelectedFont();
    const isValidFont = fontOptions.some(option => option.value === loadedFont);
    if (isValidFont) {
      setSelectedFont(loadedFont);
      loadFont(loadedFont);
    } else {
      loadFont("Inter");
    }

    const loadedSplitLevel = loadSplitLevel();
    setSplitLevel(loadedSplitLevel);
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
    loadFont(newFont);
  }, []);

  const handleSplitLevelChange = useCallback((level: number): void => {
    setSplitLevel(level);
    saveSplitLevel(level);
  }, []);

  return {
    showSettings,
    selectedFont,
    splitLevel,
    handleSettingsClose,
    handleSettingsOpen,
    handleFontChange,
    handleSplitLevelChange
  };
}