import { useState } from "react";
import type { Settings } from "../../types/mediaViewer";
import { SettingsDropdown } from "./SettingsDropdown";
import { ProgressBar } from "./ProgressBar";
import { useClickOutside } from "../../hooks/useClickOutside";

interface TopBarProps {
  directoryName: string | null;
  mediaCount: number;
  loading: boolean;
  progress: number;
  settings: Settings;
  onSelectDirectory: () => void;
  onSettingChange: (key: keyof Settings, value: boolean) => void;
}

export const TopBar = ({
  directoryName,
  mediaCount,
  loading,
  progress,
  settings,
  onSelectDirectory,
  onSettingChange,
}: TopBarProps) => {
  const [showSettings, setShowSettings] = useState(false);

  useClickOutside({
    isActive: showSettings,
    onClickOutside: () => setShowSettings(false),
    excludeSelectors: ['.settings-dropdown', '.settings-button'],
  });

  return (
    <header className="sticky top-0 z-10 bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">
            Media Viewer
          </h1>
          {directoryName && (
            <span className="text-sm text-gray-500">
              {directoryName} ({mediaCount} files)
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSelectDirectory}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Select Directory'}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="settings-button p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>

            {showSettings && (
              <SettingsDropdown
                settings={settings}
                onSettingChange={onSettingChange}
              />
            )}
          </div>
        </div>
      </div>

      {loading && <ProgressBar progress={progress} />}
    </header>
  );
};
