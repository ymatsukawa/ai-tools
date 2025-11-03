import { useState, useEffect } from "react";
import type { Settings } from "../types/mediaViewer";
import { getCookie, setCookie } from "../utils/cookies";

const COOKIE_NAME = 'imageViewerSettings';

const loadSettings = (): Settings => {
  const saved = getCookie(COOKIE_NAME);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { showTitle: true, showCounter: true };
    }
  }
  return { showTitle: true, showCounter: true };
};

const saveSettings = (settings: Settings) => {
  setCookie(COOKIE_NAME, JSON.stringify(settings));
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(loadSettings());

  const updateSetting = (key: keyof Settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return { settings, updateSetting };
};
