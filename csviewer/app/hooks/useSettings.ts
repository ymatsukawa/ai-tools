import { useState } from "react";

export interface Settings {
  separator: string;
  lineBreak: string;
}

export const DEFAULT_SETTINGS: Settings = {
  separator: ",",
  lineBreak: "LF"
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isOpen, setIsOpen] = useState(false);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const openSettings = () => setIsOpen(true);
  const closeSettings = () => setIsOpen(false);

  return {
    settings,
    updateSettings,
    isOpen,
    openSettings,
    closeSettings
  };
}
