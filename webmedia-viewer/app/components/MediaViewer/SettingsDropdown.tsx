import { memo } from "react";
import type { Settings } from "../../types/mediaViewer";

interface SettingsDropdownProps {
  settings: Settings;
  onSettingChange: (key: keyof Settings, value: boolean) => void;
}

const SettingsDropdownComponent = ({
  settings,
  onSettingChange,
}: SettingsDropdownProps) => {
  return (
    <div className="settings-dropdown absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
      <div className="px-4 py-2 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">
          Display Settings
        </h3>
      </div>
      <div className="py-2">
        <label className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer">
          <span className="text-sm text-gray-700">
            Show Media Title
          </span>
          <input
            type="checkbox"
            checked={settings.showTitle}
            onChange={(e) =>
              onSettingChange('showTitle', e.target.checked)
            }
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </label>

        <label className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer">
          <span className="text-sm text-gray-700">
            Show Media Counter
          </span>
          <input
            type="checkbox"
            checked={settings.showCounter}
            onChange={(e) =>
              onSettingChange('showCounter', e.target.checked)
            }
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </label>
      </div>
    </div>
  );
};

export const SettingsDropdown = memo(SettingsDropdownComponent);
